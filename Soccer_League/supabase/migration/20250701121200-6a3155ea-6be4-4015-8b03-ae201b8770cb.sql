
-- Create leagues table
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  start_date DATE,
  end_date DATE,
  rules TEXT,
  status VARCHAR(50) DEFAULT 'setup',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  captain_name VARCHAR(255),
  captain_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  jersey_number INTEGER,
  position VARCHAR(100),
  photo_url VARCHAR(500),
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, jersey_number)
);

-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  team1_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  match_date TIMESTAMP WITH TIME ZONE,
  venue VARCHAR(255),
  status VARCHAR(50) DEFAULT 'scheduled',
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_teams CHECK (team1_id != team2_id)
);

-- Create points_table table (auto-calculated from matches)
CREATE TABLE points_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(league_id, team_id)
);

-- Create admin_users table for role management
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('league-images', 'league-images', true);

-- Enable Row Level Security
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leagues
CREATE POLICY "Anyone can view leagues" ON leagues FOR SELECT USING (true);
CREATE POLICY "Admins can create leagues" ON leagues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creators can update their leagues" ON leagues FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Creators can delete their leagues" ON leagues FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for teams
CREATE POLICY "Anyone can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create teams" ON teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "League creators can manage teams" ON teams FOR UPDATE USING (
  EXISTS (SELECT 1 FROM leagues WHERE leagues.id = teams.league_id AND leagues.created_by = auth.uid())
);
CREATE POLICY "League creators can delete teams" ON teams FOR DELETE USING (
  EXISTS (SELECT 1 FROM leagues WHERE leagues.id = teams.league_id AND leagues.created_by = auth.uid())
);

-- Create RLS policies for players
CREATE POLICY "Anyone can view players" ON players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create players" ON players FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Team managers can update players" ON players FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM teams 
    JOIN leagues ON leagues.id = teams.league_id 
    WHERE teams.id = players.team_id AND leagues.created_by = auth.uid()
  )
);
CREATE POLICY "Team managers can delete players" ON players FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM teams 
    JOIN leagues ON leagues.id = teams.league_id 
    WHERE teams.id = players.team_id AND leagues.created_by = auth.uid()
  )
);

-- Create RLS policies for matches
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);
CREATE POLICY "League creators can manage matches" ON matches FOR ALL USING (
  EXISTS (SELECT 1 FROM leagues WHERE leagues.id = matches.league_id AND leagues.created_by = auth.uid())
);

-- Create RLS policies for points_table
CREATE POLICY "Anyone can view points table" ON points_table FOR SELECT USING (true);
CREATE POLICY "System can update points table" ON points_table FOR ALL USING (true);

-- Create RLS policies for admin_users
CREATE POLICY "Users can view their admin status" ON admin_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only authenticated users can be admins" ON admin_users FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update points table when match results change
CREATE OR REPLACE FUNCTION update_points_table()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete existing points for teams in this league
  DELETE FROM points_table WHERE league_id = NEW.league_id AND team_id IN (NEW.team1_id, NEW.team2_id);
  
  -- Recalculate points for both teams
  INSERT INTO points_table (league_id, team_id, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, points)
  SELECT 
    m.league_id,
    t.id as team_id,
    COUNT(m.id) as matches_played,
    SUM(CASE 
      WHEN (m.team1_id = t.id AND m.team1_score > m.team2_score) OR 
           (m.team2_id = t.id AND m.team2_score > m.team1_score) THEN 1 
      ELSE 0 
    END) as wins,
    SUM(CASE 
      WHEN m.team1_score = m.team2_score AND m.status = 'completed' THEN 1 
      ELSE 0 
    END) as draws,
    SUM(CASE 
      WHEN (m.team1_id = t.id AND m.team1_score < m.team2_score) OR 
           (m.team2_id = t.id AND m.team2_score < m.team1_score) THEN 1 
      ELSE 0 
    END) as losses,
    SUM(CASE 
      WHEN m.team1_id = t.id THEN m.team1_score 
      WHEN m.team2_id = t.id THEN m.team2_score 
      ELSE 0 
    END) as goals_for,
    SUM(CASE 
      WHEN m.team1_id = t.id THEN m.team2_score 
      WHEN m.team2_id = t.id THEN m.team1_score 
      ELSE 0 
    END) as goals_against,
    SUM(CASE 
      WHEN m.team1_id = t.id THEN (m.team1_score - m.team2_score)
      WHEN m.team2_id = t.id THEN (m.team2_score - m.team1_score)
      ELSE 0 
    END) as goal_difference,
    SUM(CASE 
      WHEN (m.team1_id = t.id AND m.team1_score > m.team2_score) OR 
           (m.team2_id = t.id AND m.team2_score > m.team1_score) THEN 3
      WHEN m.team1_score = m.team2_score AND m.status = 'completed' THEN 1
      ELSE 0 
    END) as points
  FROM teams t
  LEFT JOIN matches m ON (m.team1_id = t.id OR m.team2_id = t.id) 
    AND m.league_id = NEW.league_id 
    AND m.status = 'completed'
  WHERE t.id IN (NEW.team1_id, NEW.team2_id)
  GROUP BY m.league_id, t.id
  ON CONFLICT (league_id, team_id) 
  DO UPDATE SET
    matches_played = EXCLUDED.matches_played,
    wins = EXCLUDED.wins,
    draws = EXCLUDED.draws,
    losses = EXCLUDED.losses,
    goals_for = EXCLUDED.goals_for,
    goals_against = EXCLUDED.goals_against,
    goal_difference = EXCLUDED.goal_difference,
    points = EXCLUDED.points,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update points table when match results change
CREATE TRIGGER update_points_after_match
  AFTER INSERT OR UPDATE OF team1_score, team2_score, status ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_points_table();

-- Create storage policies
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'league-images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'league-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their images" ON storage.objects FOR UPDATE USING (bucket_id = 'league-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their images" ON storage.objects FOR DELETE USING (bucket_id = 'league-images' AND auth.uid() IS NOT NULL);
