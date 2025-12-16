# 📦 BlockShare

BlockShare is a **decentralized peer-to-peer file sharing platform with a blockchain-based audit trail**.  
It enables secure, transparent, and tamper-proof file sharing by combining smart contracts, a backend API, and a modern frontend interface.

---

## 🧠 Project Overview

BlockShare leverages **blockchain technology** to store immutable records of file uploads, access, and sharing events.  
Actual file storage is handled off-chain (e.g., IPFS or similar decentralized storage), while the blockchain ensures **trust, traceability, and integrity**.

This project is designed as a **full-stack decentralized application (dApp)** and can be used for academic, learning, or real-world experimentation purposes.

---

## 🚀 Features

- 🔐 Secure peer-to-peer file sharing
- 📜 Blockchain audit trail for file transactions
- 📂 Smart contracts for file metadata & access control
- 🌐 Web-based frontend for user interaction
- ⚙️ Backend API for business logic & blockchain interaction
- 🧩 Modular and scalable project structure

---

## 🗂️ Project Structure

BlockShare/
├── backend/ # Backend server (API & blockchain integration)
├── client/ # Frontend application
├── contracts/ # Smart contracts (Solidity)
├── scripts/ # Deployment and utility scripts
├── SETUP_INSTRUCTIONS.md # Detailed setup guide
├── CHANGES_SUMMARY.md # Change log
├── README.md # Project documentation
├── package.json # Root dependencies
├── hardhat.config.js # Hardhat configuration
└── .gitignore


---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Smart Contracts | Solidity, Hardhat |
| Blockchain | Ethereum (Local / Testnet) |
| Backend | Node.js, Express |
| Frontend | React |
| Storage | IPFS / Decentralized storage |
| Wallet | MetaMask |

---

## 📦 Prerequisites

Make sure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Hardhat
- MetaMask browser extension
- Git

---

## 🔧 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/abhisheckpo/BlockShare.git
cd BlockShare

```
2️⃣ Install Dependencies

# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../client
npm install

# Smart Contracts
cd ../contracts
npm install

🔗 Smart Contract Deployment

cd contracts
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost


🚀 Running the Application
▶ Backend

cd backend
npm run dev


▶ Frontend

cd client
npm start


Open your browser and navigate to:

http://localhost:3000

🧪 Testing
Smart Contracts
cd contracts
npx hardhat test

Backend
cd backend
npm test

📡 API Endpoints (Sample)
Method	Endpoint	Description
GET	/api/files	Fetch all files
POST	/api/files/upload	Upload a file
GET	/api/files/:id	Download a file
🧑‍💻 Use Case

Academic final-year project

Blockchain & Web3 learning

Secure document sharing systems

Decentralized audit systems

🤝 Contributing

Contributions are welcome!

Fork the repository

Create a new branch

Commit your changes

Open a pull request

📄 License

This project is licensed under the MIT License.

🙏 Acknowledgements

Ethereum & Hardhat community

Open-source contributors

Blockchain learning resources
