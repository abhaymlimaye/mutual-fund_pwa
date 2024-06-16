class MasterDb {
    async getOperationMode() { 
        try {
            let isOnlineAvailable = navigator.onLine;
            let isOfflineAvailable = false;

            if("serviceWorker" in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const tags = await registration.sync.getTags();
                const isIndexedDbAvailable = await indexedDb.isAvailable();
                isOfflineAvailable = ("active" in registration && "sync" in registration && tags.includes("easy-mutual-funds-sync") && isIndexedDbAvailable);
            }

            if(isOnlineAvailable && isOfflineAvailable) {
                toggleOfflineIndicator(false);
                return "online-and-offline"
            }
            if(isOnlineAvailable) {
                toggleOfflineIndicator(false);
                return "online-only"
            }
            if(isOfflineAvailable) {
                toggleOfflineIndicator(true);
                return "offline-only"
            }
            toggleOfflineIndicator(true);
            return "offline-only";
        }
        catch(e) {
            return "offline-only"; 
        }
    }

    getAllFunds() {
        return new Promise(async resolve => {
            try {
                const operationMode = await this.getOperationMode();
                if(operationMode === "online-only" || operationMode === "online-and-offline") {
                    const funds = await apis.getAllFunds();
                    resolve(funds);
                }
                else if(operationMode === "offline-only") {
                    const funds = await indexedDb.getAllFunds();
                    resolve(funds);
                }
                else resolve([]);
            }
            catch(e) {
                resolve([]);
            }
        });
    }

    async getAllPortfolioItems(callback) {
        try {
            const operationMode = await this.getOperationMode();
            if(operationMode === "online-only" || operationMode === "online-and-offline")
                firebaseDb.getAllPortfolioItems(callback);
            else if(operationMode === "offline-only")
                indexedDb.getAllPortfolioItems(callback);
            else callback(null, "No data available");
        }
        catch(e) {
            callback(null, "Error fetching portfolio items");
        }
    }

    async getAllTransactions(callback) {
        try {
            const operationMode = await this.getOperationMode();
            if(operationMode === "online-only" || operationMode === "online-and-offline")
                firebaseDb.getAllTransactions(callback);
            else if(operationMode === "offline-only")
                indexedDb.getAllTransactions(callback);
            else callback(null, "No data available");
        }
        catch(e) {
            callback(null, "Error fetching transactions");
        }
    }

    async addTransaction(fundId, fundName, transactionType, amount) {
        const operationMode = await this.getOperationMode();
        
        if(operationMode === "online-only" || operationMode === "online-and-offline")
            firebaseDb.addTransaction(fundId, fundName, transactionType, amount);
        else if(operationMode === "offline-only") {
            indexedDb.addTransaction(fundId, fundName, transactionType, amount);
            refreshAllTransactions();
        }
    }

    async syncPendingTransactions() {  
        const operationMode = await this.getOperationMode();
        if(operationMode === "offline-only") return;  //cannot sync if offline-only

        indexedDb.getAllTransactions(
            async transactions => {
                await firebaseDb.addMultipleTransactions(transactions);
                await indexedDb.removeAllTransactions();
                refreshAllTransactions();
                refreshAllPortfolioItems();
            }
        );     
    }
}

const masterDb = new MasterDb();

