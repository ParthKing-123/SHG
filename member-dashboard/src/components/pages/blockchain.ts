import { ethers } from "ethers";
import  LoanLedgerABI  from "./LoanLedgerABI.json";

export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  console.log(
  "Contract code:",
  await provider.getCode(CONTRACT_ADDRESS)
);
  const signer = await provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    LoanLedgerABI,
    signer
  );
};

export const getReadContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    LoanLedgerABI,
    provider
  );
};
export const getReadProvider = () => {
  if (!window.ethereum) {
    throw new Error("Ethereum provider not found");
  }

  return new ethers.BrowserProvider(window.ethereum);
};

// 🔍 VERIFY + DECODE TRANSACTION
export const decodeRepaymentTx = async (txHash: string) => {
  const provider = getReadProvider();

  // 1️⃣ Fetch transaction
  const tx = await provider.getTransaction(txHash);
  if (!tx) {
    throw new Error("Transaction not found");
  }

  // 2️⃣ Fetch receipt (for confirmation)
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt || receipt.status !== 1) {
    throw new Error("Transaction failed or not confirmed");
  }

  // 3️⃣ Ensure it was sent to OUR contract
  if (
    !tx.to ||
    tx.to.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()
  ) {
    throw new Error("Transaction not sent to LoanLedger contract");
  }

  // 4️⃣ Decode function call
  const iface = new ethers.Interface(LoanLedgerABI);

  const decoded = iface.parseTransaction({
    data: tx.data,
    value: tx.value,
  });

  if (!decoded || decoded.name !== "payEMI") {
    throw new Error("Not a payEMI transaction");
  }

  // 5️⃣ Extract decoded data
  return {
    payer: tx.from,
    loanId: decoded.args[0].toString(),
    amountETH: ethers.formatEther(tx.value),
    blockNumber: receipt.blockNumber,
    txHash: txHash,
  };
};
