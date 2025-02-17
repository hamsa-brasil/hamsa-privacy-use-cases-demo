const CrossBankTxStatusCreated = 0
const CrossBankTxStatusSubmitted = 1
const CrossBankTxStatusExecuted = 2
const CrossBankTxStatusFailed = 3
const CrossBankTxStatusExpired = 4
const CrossBankTxExecutionMonitored = 5
const CrossBankTxCancelMonitored = 6

const status = {
    "0": "Created",
    "1": "Submitted",
    "2": "Executed",
    "3": "Failed",
    "4": "Expired",
    "5": "Execution Monitored",
    "6": "Cancel Monitored",
}

module.exports = status