# GDrive 3.0 — Decentralized Drive (React + Hardhat + IPFS/Pinata)

A simple decentralized image drive:
- Files are uploaded to IPFS via Pinata
- The smart contract stores `ipfs://` URIs and manages access control
- The React UI lets you connect your wallet, upload, browse, and share access

## Monorepo Layout

- `client/` — React frontend (Create React App)
- `contracts/` — Solidity smart contracts
- `scripts/` — Hardhat deployment scripts
- `hardhat.config.js` — Hardhat configuration

## Prerequisites

- Node.js 16+ and npm
- MetaMask browser extension
- Pinata account (API Keys or JWT)
- Hardhat (installed via devDependencies)

## 1) Install dependencies

```bash
# From repo root
npm install

# Then install frontend deps
cd client
npm install
```

## 2) Environment variables (client/.env)

Create `client/.env` (in the client folder, not the repo root). Restart the dev server after any change.

Required:
```
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Pinata authentication (choose ONE of the following):
- Preferred (JWT):
```
REACT_APP_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # example
```
- Or API key + secret:
```
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret
```

Notes:
- No quotes and no spaces around `=`.
- Variable names must start with `REACT_APP_` to be available in the React app.
- Never commit your `.env` file.

## 3) Compile and deploy the contract

Local (Hardhat) network:
```bash
# From repo root
npx hardhat compile
npx hardhat node                         # terminal A (keeps running)

# In another terminal (repo root)
npx hardhat run scripts/deploy.js --network localhost
# Output example:
# Library deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```
Copy the printed address into `REACT_APP_CONTRACT_ADDRESS` in `client/.env`.

Testnet/Mainnet:
1. Configure the target network in `hardhat.config.js` (RPC URL, chainId, accounts/private key)
2. Fund the deployer address
3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network <network>
```
4. Put the deployed address into `REACT_APP_CONTRACT_ADDRESS`.

## 4) Run the app

```bash
# From client/
npm start
```
Open `http://localhost:3000`, connect MetaMask (ensure it’s on the same network as the deployed contract), then use the tabs:
- Gallery — browse your images or shared images
- Upload — upload a new image to IPFS (Pinata)
- Share Access — grant access to another address

## Using the App

1. Click “Connect MetaMask” and approve the connection
2. Upload:
   - Drag & drop or choose an image
   - Progress appears; on success, the contract is updated with `ipfs://<hash>`
3. Gallery:
   - Shows your images
   - Enter another address and “Get Images” if they shared with you
4. Share Access:
   - Grant another address permission to see your images

## Troubleshooting

- Connect button does nothing
  - Make sure MetaMask is installed and unlocked
  - If you see “request already pending”, open the MetaMask extension window and approve

- “Contract not configured”
  - Set `REACT_APP_CONTRACT_ADDRESS` in `client/.env` and restart `npm start`
  - Ensure MetaMask is on the same network as the deployed contract (Localhost 8545 or your testnet)

- Upload fails: “Pinata authentication failed” (401/403)
  - Verify `REACT_APP_PINATA_JWT` (recommended) or `REACT_APP_PINATA_API_KEY` + `REACT_APP_PINATA_SECRET_KEY`
  - Restart the dev server after editing `.env`

- Upload fails: “Rate limited” (429)
  - Wait and retry; consider upgrading your Pinata plan

- Network/CORS error to Pinata
  - Check your internet connection and try again

## Scripts reference

Root (Hardhat):
```bash
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network <network>
```

Frontend (client):
```bash
npm start
npm run build
npm test
```

## Security notes

- Do not commit `.env`
- Prefer using a Pinata JWT in the browser over key+secret
- Rotate keys/JWT if exposed

## Tech Stack

- Solidity, Hardhat, Ethers.js
- React (CRA), modern dark UI with animations
- IPFS via Pinata

---
If you run into issues, please copy the exact error message and I’ll help you resolve it quickly.

