class IndexedDb {
    constructor() {
        this.dbName = "EasyMutualFundsDB";
        this.db = null;
        if("indexedDB" in window) {
            const request = indexedDB.open(this.dbName, 1);
        
            request.onsuccess = event => { this.db = event.target.result };
            request.onerror = () => this.db = null; 
            request.onupgradeneeded = event => {
                event.target.result.createObjectStore("funds", { keyPath: "symbol" });
                event.target.result.createObjectStore("portfolio", { keyPath: "fundId" });
                event.target.result.createObjectStore("transactions", { autoIncrement: true });
            };
        }
    }

    async isAvailable() {
        return new Promise(resolve => {
            if(!("indexedDB" in window)) resolve(false);

            indexedDB.databases()
                .then(dbList => {
                    const exists = dbList.some(db => db.name === this.dbName)
                    resolve(exists)
                })
                .catch(() => resolve(false));
        });
    }

    async addAllFunds(funds) {
        const isAvailable = await this.isAvailable();
        if(!isAvailable) return;

        await this.removeAllFunds();    //remove existing funds before adding new ones

        const transaction = this.db.transaction("funds", "readwrite");
        const store = transaction.objectStore("funds");
        funds.forEach(fund => store.add({ //store only desired fields
            symbol: fund.symbol, 
            name: fund.name, 
            fund_family: fund.fund_family,
            performance_rating: fund.performance_rating, 
            risk_rating: fund.risk_rating
        }));
    }

    async removeAllFunds() {
        const isAvailable = await this.isAvailable();
        if(!isAvailable) return;

        const transaction = this.db.transaction("funds", "readwrite");
        const store = transaction.objectStore("funds");
        store.clear();
    }

    async getAllFunds() {
        const isAvailable = await this.isAvailable();
        if(!isAvailable) return [];

        return new Promise(resolve => {
            const transaction = this.db.transaction("funds", "readonly");
            const store = transaction.objectStore("funds");
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve([]);
        });
    }

    async addAllPortfolioItems(portfolioItems) {
        const isAvailable = await this.isAvailable();
        if(!isAvailable) return;

        await this.removeAllPortfolioItems();   //remove existing portfolio items before adding new ones

        const transaction = this.db.transaction("portfolio", "readwrite");
        const store = transaction.objectStore("portfolio");
        portfolioItems.forEach(item => store.put(item));
    }

    async removeAllPortfolioItems() {
        const isAvailable = await this.isAvailable();
        if(!isAvailable) return;

        const transaction = this.db.transaction("portfolio", "readwrite");
        const store = transaction.objectStore("portfolio");
        store.clear();
    }

    async getAllPortfolioItems(callback) {
        const isAvailable = await this.isAvailable();
        if(!isAvailable) callback(null, "IndexedDB not available");

        const transaction = this.db.transaction("portfolio", "readonly");
        const store = transaction.objectStore("portfolio");
        const request = store.getAll();
        request.onsuccess = () => callback(request.result);
        request.onerror = () => callback(null, "Error fetching portfolio items");
    }

    async addTransaction(fundId, fundName, transactionType, amount) {
        const isAvailable = await this.isAvailable();
        if(!isAvailable) return;

        const transaction = this.db.transaction("transactions", "readwrite");
        const store = transaction.objectStore("transactions");
        store.add({ fundId, fundName, transactionType, amount });
    }

    async removeAllTransactions() {
        const isAvailable = await this.isAvailable();
        if(!isAvailable) return;

        const transaction = this.db.transaction("transactions", "readwrite");
        const store = transaction.objectStore("transactions");
        store.clear();
    }

    async getAllTransactions(callback) {
        const isAvailable = await this.isAvailable();
        if(!isAvailable) callback(null, "IndexedDB not available");
  
        const transaction = this.db.transaction("transactions", "readonly");
        const store = transaction.objectStore("transactions");
        const request = store.getAll();
        request.onsuccess = () => callback(request.result);
        request.onerror = () => callback(null, "Error fetching transactions"); 
    }
}

const indexedDb = new IndexedDb();