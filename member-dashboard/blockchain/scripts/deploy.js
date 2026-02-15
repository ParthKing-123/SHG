const { ethers } = require("hardhat");

async function main() {
  const LoanLedger = await ethers.getContractFactory("LoanLedger");

  const loanLedger = await LoanLedger.deploy();

  // ✅ ethers v6 replacement for .deployed()
  await loanLedger.waitForDeployment();

  console.log("LoanLedger deployed to:", await loanLedger.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
