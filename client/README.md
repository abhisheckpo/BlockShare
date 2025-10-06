# GDrive 3.0 Frontend (React)

This is the React client for the decentralized drive. It connects to a deployed smart contract, uploads images to IPFS via Pinata, and provides a modern dark UI with animations.

## Quick Start

1) Install dependencies
```bash
npm install
```

2) Configure environment variables (create `client/.env`)
```bash
REACT_APP_CONTRACT_ADDRESS=0xYourDeployedContractAddress

# Choose ONE auth method for Pinata
# Preferred: JWT
REACT_APP_PINATA_JWT=your_pinata_jwt
# Or: API key + secret
# REACT_APP_PINATA_API_KEY=your_pinata_api_key
# REACT_APP_PINATA_SECRET_KEY=your_pinata_secret
```
Notes:
- No quotes or spaces around `=`
- Restart `npm start` after editing `.env`

3) Run
```bash
npm start
```
Open `http://localhost:3000` and click “Connect MetaMask”.

## Features
- Wallet connect flow with helpful errors
- Upload images to IPFS (Pinata) with progress
- Store `ipfs://` URIs on-chain
- Gallery with lazy loading and hover effects
- Share access via modal

## Troubleshooting
- Connect issues: ensure MetaMask is installed/unlocked and on the correct network
- “Contract not configured”: set `REACT_APP_CONTRACT_ADDRESS` and restart dev server
- Pinata auth errors: verify JWT or API key+secret in `.env` and restart dev server

## Scripts
```bash
npm start       # dev server
npm run build   # production build
npm test        # tests
```
