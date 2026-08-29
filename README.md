# SHG Portal — TrustLedger

> A full-stack, blockchain-powered financial management platform for Self-Help Groups (SHGs) in India.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-orange?logo=firebase)](https://firebase.google.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-purple?logo=ethereum)](https://soliditylang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-yellow?logo=vite)](https://vitejs.dev/)

---

## ?? What is SHG Portal?

SHG Portal is a dual-dashboard web application for managing Self-Help Group (SHG) finances:

- **Member Dashboard** — Personal savings tracker, loan management, EMI payments on blockchain, AI chatbot, financial literacy modules, savings goals, group directory, and chat
- **Admin Dashboard** — Group management, loan approvals, attendance, monthly rounds, member trust scores, and PDF/Excel/JSON report generation

---

## ??? Project Architecture

```
SHG/
+-- member-dashboard/          # Member-facing React app (port 3000)
¦   +-- src/
¦   ¦   +-- components/        # All UI components & pages
¦   ¦   +-- utils/gemini.ts    # Gemini AI integration
¦   ¦   +-- i18n/              # 11-language translation files
¦   ¦   +-- services/          # Firebase transaction services
¦   +-- blockchain/            # Hardhat + Solidity smart contracts
¦   ¦   +-- contracts/
¦   ¦       +-- Ledger.sol     # LoanLedger smart contract
¦   +-- gmail-backend/         # Gmail + Google Meet Express server (port 5001)
¦   +-- otp-backend/           # Twilio OTP Express server (port 5001*)
¦
+-- admin-dashboard/           # Admin-facing React app (port 3001)
    +-- src/
        +-- components/        # Admin UI components
        +-- reports/           # PDF / Excel / JSON generators
```

> ?? **Note:** Both `gmail-backend` and `otp-backend` default to port 5001. Run only **one at a time**, or change one port before running both.

---

## ?? Prerequisites

Make sure these are installed before starting:

| Tool | Purpose | Install |
|------|---------|---------|
| Node.js (v18+) | All JS runtimes | https://nodejs.org |
| npm | Package manager | Bundled with Node.js |
| MetaMask | Browser wallet for blockchain | https://metamask.io |
| Git | Version control | https://git-scm.com |

---

## ?? Environment Variables Setup

### 1. Member Dashboard — `.env` file
Create/edit `member-dashboard/.env`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Gmail Backend — `gmail-backend/.env`
```env
GMAIL_CLIENT_ID=your_google_oauth_client_id
GMAIL_CLIENT_SECRET=your_google_oauth_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
PORT=5001
```

### 3. OTP Backend — `otp-backend/.env`
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

> ?? The OTP backend works in **DEV mode** without Twilio credentials — it logs the OTP to the terminal console.

### 4. Firebase (already hardcoded in `firebase.js`)
Firebase credentials are already embedded in the source. No `.env` changes needed for Firebase.

---

## ?? Running the Project — VS Code Terminal Commands

Open **separate VS Code terminals** for each service. Use the **Split Terminal** feature (`Ctrl + Shift + 5`).

---

### Terminal 1 — Member Frontend (Port 3000)

```bash
cd "C:\Users\parth\OneDrive\Desktop\SHG\member-dashboard"
npm install
npm run dev
```

? Opens at: **http://localhost:3000**

---

### Terminal 2 — Admin Frontend (Port 3001)

```bash
cd "C:\Users\parth\OneDrive\Desktop\SHG\admin-dashboard"
npm install
npm run dev
```

? Opens at: **http://localhost:3001**

---

### Terminal 3 — Gmail + Google Meet Backend (Port 5001)

```bash
cd "C:\Users\parth\OneDrive\Desktop\SHG\member-dashboard\gmail-backend"
node index.js
```

? Starts: `?? Gmail + Meet backend running on port 5001`

---

### Terminal 4 — OTP Backend (Port 5001 — change if running gmail-backend simultaneously)

> ?? If you need BOTH backends simultaneously, edit `otp-backend/server.js` line 175 and change `const PORT = 5001;` to `const PORT = 5002;`

```bash
cd "C:\Users\parth\OneDrive\Desktop\SHG\member-dashboard\otp-backend"
node server.js
```

? Starts: `?? OTP backend running on port 5001`

---

### Terminal 5 — Hardhat Local Blockchain Node

> Required only if you want to test blockchain/EMI payment features locally

```bash
cd "C:\Users\parth\OneDrive\Desktop\SHG\member-dashboard\blockchain"
npm install
npx hardhat node
```

? Starts a local Ethereum node at: **http://127.0.0.1:8545**
? Shows 20 test accounts with 10,000 ETH each

---

### Terminal 6 — Deploy Smart Contract (after Hardhat node is running)

> Run this in a NEW terminal while Terminal 5's node is still running

```bash
cd "C:\Users\parth\OneDrive\Desktop\SHG\member-dashboard\blockchain"
npx hardhat run scripts/deploy.js --network localhost
```

? Prints the deployed contract address (e.g., `0x5FbDB2...`)
? Update `CONTRACT_ADDRESS` in `src/components/pages/blockchain.ts` if it changes

---

## ?? MetaMask Setup (for Blockchain Features)

1. Open MetaMask in your browser
2. Add a custom network:
   - **Network Name:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
3. Import a test account using one of the private keys printed by `npx hardhat node`

---

## ?? Port Reference

| Service | Port | URL |
|---------|------|-----|
| Member Dashboard (Vite) | 3000 | http://localhost:3000 |
| Admin Dashboard (Vite) | 3001 | http://localhost:3001 |
| Gmail + Meet Backend | 5001 | http://localhost:5001 |
| OTP Backend | 5001* | http://localhost:5001 |
| Hardhat Blockchain Node | 8545 | http://localhost:8545 |

---

## ?? Firebase Services Used

| Service | Purpose |
|---------|---------|
| Firebase Auth | Email/password login + phone OTP verification |
| Firestore | Member data, groups, loans, rounds, messages, goals, learning progress |
| Firebase project ID | `trustledger-a1ca1` |

---

## ?? Blockchain Architecture

| Component | Detail |
|-----------|--------|
| Smart Contract | `LoanLedger.sol` — records EMI repayments on-chain |
| Network | Hardhat local node (dev) / Ethereum-compatible mainnet (prod) |
| Wallet | MetaMask (browser) via `ethers.js v6` |
| Contract Address (dev) | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| Functions | `payEMI(loanId)` — payable, `getRepayment(index)`, `totalRepayments()` |

---

## ?? AI Features

| Feature | Model | Integration |
|---------|-------|-------------|
| In-app Chatbot | Gemini 2.5 Flash | REST API via `VITE_GEMINI_API_KEY` |

---

## ?? Multilingual Support

11 languages supported with live switching:

| Language | Code |
|----------|------|
| English | `en` |
| Hindi (?????) | `hi` |
| Bengali (?????) | `bn` |
| Marathi (?????) | `mr` |
| Telugu (??????) | `te` |
| Kannada (?????) | `kn` |
| Odia (?????) | `od` |
| Malayalam (??????) | `ml` |
| Tamil (?????) | `ta` |
| Gujarati (???????) | `gu` |
| Urdu (????) | `ur` |

---

## ?? Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 6, Tailwind CSS, Radix UI, Recharts |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore (NoSQL, real-time) |
| Auth | Firebase Auth (email + phone OTP) |
| Blockchain | Solidity 0.8.28, Hardhat, ethers.js v6 |
| AI | Google Gemini 2.5 Flash (REST) |
| Email | Gmail API (Google OAuth2) |
| Meetings | Google Calendar API (auto Google Meet) |
| SMS/OTP | Twilio |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Excel Export | XLSX |

---

## ?? User Roles

| Role | Access | Dashboard |
|------|--------|-----------|
| Member | Personal finance, loans, goals, learning, group chat | http://localhost:3000 |
| Admin | Group management, reports, loan approvals, attendance | http://localhost:3001 |

---

## ?? Key Files Reference

| File | Purpose |
|------|---------|
| `member-dashboard/src/App.tsx` | Main routing & auth flow |
| `member-dashboard/src/components/pages/LoanManagement.tsx` | Loan apply + EMI payment |
| `member-dashboard/src/components/pages/MonthlyRound.tsx` | Monthly savings rounds |
| `member-dashboard/src/components/pages/MyLedger.tsx` | Transaction ledger + blockchain verify |
| `member-dashboard/src/components/pages/FinancialLiteracy.tsx` | Learning modules |
| `member-dashboard/src/components/ChatBot.tsx` | Gemini AI chatbot |
| `member-dashboard/src/components/TrustScoreGauge.tsx` | Trust score visualization |
| `member-dashboard/src/utils/gemini.ts` | Gemini API client |
| `member-dashboard/blockchain/contracts/Ledger.sol` | Smart contract |
| `member-dashboard/gmail-backend/index.js` | Gmail + Meet API server |
| `member-dashboard/otp-backend/server.js` | Twilio OTP server |
| `admin-dashboard/src/components/ReportsView.tsx` | PDF/Excel/JSON reports |
| `admin-dashboard/src/components/LoanApprovalsView.tsx` | Loan approval panel |

---

## ?? Quick Start (Minimum Setup — No Blockchain or Email)

Just want to see the app running? Only Firebase + AI needed:

```bash
# Terminal 1 — Member Dashboard
cd "C:\Users\parth\OneDrive\Desktop\SHG\member-dashboard"
npm install
npm run dev

# Terminal 2 — Admin Dashboard  
cd "C:\Users\parth\OneDrive\Desktop\SHG\admin-dashboard"
npm install
npm run dev
```

Firebase works out of the box. Add `VITE_GEMINI_API_KEY` in `.env` for the AI chatbot.

---

## ?? License

MIT — Built for SHG empowerment across India ????
