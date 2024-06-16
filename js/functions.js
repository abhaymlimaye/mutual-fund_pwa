function validateAmountInput(inputElementId, errorDivId) {
    const inputElement = document.getElementById(inputElementId);
    const errorDiv = document.getElementById(errorDivId); 

    const amount = parseFloat(inputElement?.value);
    let errorMessage = "";

    if(isNaN(amount)) errorMessage = "Amount should be a number";    
    else if(amount < 10) errorMessage = "Amount should be at least 10";
    else if(amount > 100000) errorMessage = "Amount cannot be more than 100000";

    if(errorMessage) {
        errorDiv.innerHTML = errorMessage;
        errorDiv.style.display = "block";
        return 0;
    }

    errorDiv.style.display = "none";
    inputElement.value = "";  
    return amount;
}

function processBuyOrSell(fundId, fundName, transactionType, amount) {
    masterDb.addTransaction(fundId, fundName, transactionType, amount)
        .then(() => {
            showToastAndNotification('Transaction successful ✓', 3000);
            changeTabTo(2);
        })
        .catch(() => showToastAndNotification('Transaction failed ⓧ', 5000));
}

