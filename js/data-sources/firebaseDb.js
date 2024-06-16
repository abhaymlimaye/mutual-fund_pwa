class FirebaseDb {
    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyAJvg7Sp4zTPyzEdUuSos-LW9Dq_Tx694s",
            authDomain: "mobileweb-development.firebaseapp.com",
            databaseURL: "https://mobileweb-development-default-rtdb.firebaseio.com",
            projectId: "mobileweb-development",
            storageBucket: "mobileweb-development.appspot.com",
            messagingSenderId: "254347299524",
            appId: "1:254347299524:web:9a88c67262bd30e8eb9791"
        };
        firebase.initializeApp(firebaseConfig)
    }

    getAllTransactions(callback) {
        firebase.database().ref("transactions").on("value", snapshot => {
            let transactions = [];
            snapshot.forEach(childSnapshot => {
                transactions.push({ transactionId: childSnapshot.key, ...childSnapshot.val() });
            });
            callback(transactions);
        }, 
        error => callback(null, error)); 
    }
    
    getAllPortfolioItems(callback) {
        firebase.database().ref("portfolio").on("value", snapshot => {
            let portfolioItems = [];
            snapshot.forEach(childSnapshot => {
                portfolioItems.push({ fundId: childSnapshot.key, ...childSnapshot.val() });
            });
            if(portfolioItems && portfolioItems.length) indexedDb.addAllPortfolioItems(portfolioItems); //save portfolioItems in indexedDb for offline use
            callback(portfolioItems);
        }, 
        error => callback(null, error));  
    }
    
    addTransaction(fundId, fundName, transactionType, amount) {
        return new Promise((resolve, reject) => {
            firebase.database().ref("transactions").push({ fundId: fundId, fundName: fundName, transactionType: transactionType, amount: amount }, error => {
                if (error) reject(error);
                else {
                    this.addOrUpdatePortfolioItem(fundId, fundName, transactionType, amount)
                        .then(() => resolve())
                        .catch(error => reject(error));
                }
            });
        });
    }

    async addMultipleTransactions(transactions) {
        if (!transactions || !transactions.length) return;
    
        for (const transaction of transactions) {
            const { fundId, fundName, transactionType, amount } = transaction;
            await this.addTransaction(fundId, fundName, transactionType, amount);
        }
    }
    
    
    addOrUpdatePortfolioItem(fundId, fundName, transactionType, amount) {
        return new Promise((resolve, reject) => {
            firebase.database().ref("portfolio").child(fundId).once("value").then(snapshot => {
                let existingAmount = snapshot.exists() ? snapshot.val().amount : 0;
                if (transactionType === "BUY")
                    existingAmount += amount;
                else if (transactionType === "SELL") {
                    if (existingAmount < amount) {
                        reject("Insufficient funds");
                        return;
                    }
                    existingAmount -= amount;
                    if (existingAmount === 0) {
                        // Remove the node if the amount becomes zero
                        firebase.database().ref("portfolio").child(fundId).remove();
                        resolve();
                        return;
                    }
                }
    
                const fund = { fundName: fundName, amount: existingAmount };
                firebase.database().ref("portfolio").update({ [fundId]: fund }, error => {
                    if (error) reject(error);
                    else resolve();
                });
            }).catch(error => reject(error));
        });
    } 
}

const firebaseDb = new FirebaseDb();
