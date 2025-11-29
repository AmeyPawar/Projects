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

Sample Outputs:


![WhatsApp Image 2025-11-30 at 00 26 56_337110f3](https://github.com/user-attachments/assets/d64280f9-e835-4646-ba2d-b7096985a25b)
![WhatsApp Image 2025-11-30 at 00 27 01_15a5c06d](https://github.com/user-attachments/assets/6e5a4eb7-2646-4840-b2ed-a650ab1e05b3)
![WhatsApp Image 2025-11-30 at 00 27 33_0168414d](https://github.com/user-attachments/assets/0c917275-5f85-4a95-b386-beb05f2f29d2)
![WhatsApp Image 2025-11-30 at 00 27 39_8e83af3a](https://github.com/user-attachments/assets/7f8c1320-76b0-4e6a-831b-442f9ff134eb)
![WhatsApp Image 2025-11-30 at 00 27 54_8c405a8b](https://github.com/user-attachments/assets/13ffb301-eadb-4e66-a290-39ee04ba1f0d)



🚀 Future Improvements

Multi-camera / 360° vision

Semantic segmentation integration

Use better RL algorithms (SAC / TD3)

Domain randomization for increased generalization

Jetson Nano deployment for real-world inference




