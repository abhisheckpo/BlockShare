📦 BlockShare

A decentralized file sharing & storage platform built using blockchain, smart contracts, and a modern full-stack architecture (frontend + backend + contracts + scripts).

This README provides everything you need to get started, build, test, and contribute to the BlockShare project.

🧠 Overview

BlockShare is an open-source decentralized application (dApp) that enables secure, distributed file sharing using blockchain technology. It integrates a smart contract layer, backend services, a frontend UI, and utility scripts — offering a real-world example of how decentralized systems can enable trustless file storage and sharing.

🚀 Features

✔ Smart Contracts — Manages file metadata, permissions, and transaction logic
✔ Secure Backend — Handles API requests, user authentication, and contract interaction
✔ Interactive Frontend — User interface for uploading/downloading files and viewing status
✔ Scripts & Deployment — Tools to deploy contracts and bootstrap your local network
✔ Modular project structure with clear separation of concerns

🗂️ Project Structure
BlockShare/
├─ backend/                # Backend server (API + blockchain interaction)
├─ client/                 # Frontend user interface
├─ contracts/              # Smart contracts (e.g., Solidity)
├─ scripts/                # Deployment & utility scripts
├─ SETUP_INSTRUCTIONS.md   # Setup steps
├─ CHANGES_SUMMARY.md      # Notable changes by version
├─ README.md               # This file
├─ package.json            # Package metadata & scripts
├─ hardhat.config.js       # Hardhat config for contracts
├─ .gitignore

🛠️ Tech Stack
Layer	Technology
Smart Contracts	Solidity + Hardhat
Backend	Node.js / Express
Frontend	React / Web3 UI
Blockchain Dev	Ethereum test network (Hardhat)
Storage	IPFS / decentralized storage (optional)
📦 Prerequisites

Before running the project locally, make sure you have:

✔ Node.js (v16+)
✔ npm or yarn
✔ Hardhat (for contract deployment)
✔ MetaMask or equivalent wallet
✔ Local Ethereum node (Hardhat network)
✔ Optional: IPFS daemon or decentralized storage provider

🔧 Setup Instructions (Local Development)
1. Clone the Repository
git clone https://github.com/abhisheckpo/BlockShare.git
cd BlockShare

2. Install Dependencies
# Root dependencies
npm install

# Backend
cd backend
npm install

# Client
cd ../client
npm install

# Smart contracts
cd ../contracts
npm install

🔗 Smart Contract Deployment

From the contracts/ folder:

npx hardhat compile
npx hardhat node    # Launch local blockchain
npx hardhat run --network localhost scripts/deploy.js


Adjust scripts/ file names if needed.

🚀 Running the Application
🧠 Backend
cd backend
npm run dev


Ensure backend is configured to connect with your local blockchain instance.

🖥️ Frontend
cd client
npm start


Open your browser at http://localhost:3000 (or configured port) to view the app.

🧪 Testing

Smart contract tests:

cd contracts
npx hardhat test


Backend / integration tests:

cd backend
npm test


Frontend tests (if configured):

cd client
npm test

🧩 API Endpoints

(Example — edit to match your backend)

Method	Endpoint	Description
GET	/api/files	List all files
POST	/api/files/upload	Upload a file
GET	/api/files/:id	Download a file

Describe endpoints here as needed.

🧑‍💻 Contributing

We welcome contributions!

Fork the repository

Create a feature branch

Add your changes

Submit a Pull Request

Be sure to follow code style guidelines and document your work.

📄 License

This project is licensed under the MIT License — see the LICENSE file for details.

🙏 Acknowledgements

Thanks to all collaborators and open-source contributors who helped make this project possible.

