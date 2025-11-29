🚗 Autonomous Driving Model using Deep Learning & Reinforcement Learning (CARLA Simulator)

A vision-based autonomous driving system built using Deep Learning (CNN) and Reinforcement Learning (PPO/DQN) inside the CARLA Simulator.
The model predicts steering, throttle, and brake directly from camera input, achieving high accuracy under multiple weather and traffic conditions.

📘 Overview

This project implements a complete end-to-end autonomous driving pipeline that includes:

Supervised Learning (CNN) for steering control

Reinforcement Learning (PPO / DQN) for decision making in dynamic environments

Adversarial & scenario-based testing to evaluate robustness

The goal is to create a robust driving agent capable of lane following, obstacle avoidance, and stable driving across varying environments.

🧠 Tech Stack

Languages: Python
Frameworks: PyTorch / TensorFlow, OpenCV, NumPy
Simulator: CARLA
Techniques:

Convolutional Neural Networks

Deep Reinforcement Learning (PPO / DQN)

Data Augmentation

Adversarial Testing

Behavioral Cloning


📂 Project Structure:
AutonomousDrivingModel/
│── data/                 # Training data (images + control commands)
│── models/               # Saved CNN and RL models
│── src/
│   ├── data_collection.py
│   ├── train_supervised.py
│   ├── train_rl.py
│   ├── inference.py
│   ├── utils.py
│── results/
│   ├── curves.png
│   ├── demo.gif
│── README.md

📦 Dataset

Collected directly from CARLA Simulator using a custom data collection script.

Includes:

RGB images from front-facing camera

Steering, throttle, and brake values

Speed, collision, and environment metadata

Preprocessing steps:

Resize to 224×224

Normalization

Data augmentation (brightness, blur, noise)

Removal of corrupted frames

🏗️ Model Architecture
1. CNN (Supervised Learning)

Learns to predict steering angle from camera frames.
Input (224x224x3)
↓ Conv + ReLU + BatchNorm
↓ Conv + ReLU + MaxPool
↓ Conv + ReLU + Dropout
↓ Fully Connected Layer (256)
↓ Output → [Steering, Throttle, Brake]
2. Reinforcement Learning (PPO / DQN)

Learns long-term driving policies.

State: Camera frame
Action: Continuous control values
Reward function:

+0.5 for lane keeping

+1 for stable speed

–5 for collisions

–2 for going off-road

–1 for abrupt steering

⚙️ How to Run
1. Clone
git clone <repo_link>
cd AutonomousDrivingModel

2. Install dependencies
pip install -r requirements.txt

3. Start CARLA Simulator
./CarlaUE4.sh

4. Collect Training Data
python src/data_collection.py

5. Train Supervised Model
python src/train_supervised.py

6. Train RL Agent
python src/train_rl.py

7. Run Inference (Autonomous Mode)
python src/inference.py

📊 Results

Achieved stable lane following across multiple weather settings

Smooth throttle and steering using PPO-optimized policy

Performed reliably under:

Rain

Low visibility

Night mode

Gaussian noise

Dynamic traffic

Sample Outputs






