// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LoanLedger {

    struct Repayment {
        address payer;
        uint256 loanId;
        uint256 amount;
        uint256 timestamp;
    }

    Repayment[] public repayments;

    event RepaymentRecorded(
        address indexed payer,
        uint256 loanId,
        uint256 amount,
        uint256 timestamp
    );

    function payEMI(uint256 loanId) external payable {
        require(msg.value > 0, "Amount must be > 0");

        repayments.push(
            Repayment(
                msg.sender,
                loanId,
                msg.value,
                block.timestamp
            )
        );

        emit RepaymentRecorded(
            msg.sender,
            loanId,
            msg.value,
            block.timestamp
        );
    }

    function getRepayment(uint256 index) external view returns (Repayment memory) {
        return repayments[index];
    }

    function totalRepayments() external view returns (uint256) {
        return repayments.length;
    }
}
