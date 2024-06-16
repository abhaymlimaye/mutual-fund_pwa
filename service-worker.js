const cacheName = "notifications-app-cache-v1";

/** Adding Event Listener for Service Worker Install Event */
self.addEventListener("install", e => {
    self.skipWaiting(); //Skip the Waiting State and Activate the Service Worker

    //Open the Cache and Add the Necessary Files to Cache
    e.waitUntil(caches.open(cacheName).then(cache => {
            cache.addAll([
                "/",
                "/index.html",
                "/pages/invest.html",
                "/pages/portfolio.html",
                "/pages/transactions.html",
                "/js/index.js",
                "js/functions.js",
                "/js/onsenui.min.js",
                "/js/data-sources/masterDb.js",
                "/js/data-sources/apis.js",
                "/js/data-sources/firebaseDb.js",
                "/js/data-sources/indexedDb.js",
                "/css/styles.css",
                "/css/onsen-ui/onsenui.min.css",
                "/css/onsen-ui/onsen-css-components.min.css",
                "/css/onsen-ui/onsenui-core.min.css",
                "/css/onsen-ui/font_awesome/css/all.min.css",
                "/css/onsen-ui/ionicons/css/ionicons.min.css",
                "/css/onsen-ui/ionicons/css/iconicons-core.min.css",
                "/css/material-design-iconic-font/css/material-design-iconic-font.min.css",
                "/images/favicon.ico",
                "/images/icon-512.png",
                "/images/icon-192.png",
                "manifest.json",
            ]);
        })
    );
});

/** Adding Event Listener for Service Worker Activate Event */
self.addEventListener("activate", e => {
    e.waitUntil(clients.claim()); //Immediately claim the control over open pages in Client   

    //Remove the Outdated Cache
    e.waitUntil(caches.keys().then(cacheNames => {
        cacheNames.forEach(name => {
            if(name !== cacheName) {
                caches.delete(name);
            }
        });
    }));
});

/** Adding Event Listener for Service Worker Fetch Event */
self.addEventListener("fetch", e => {
    if(e.request.method !== "GET") return;  //Handle only the GET Requests
    
    //Caching using the Strategy: Stale While Revalidate
    e.respondWith(caches.open(cacheName).then(cache => { //First Open the Cache
        return cache.match(e.request)
            .then(cachedResp => {   //For matched request in the Cache
                const fetchPromise = fetch(e.request)
                    .then(fetchedResp => {
                        cache.put(e.request, fetchedResp.clone());  //Put the Latest Fetched Response in the Cache
                        return fetchedResp;
                    })
                    .catch(() => cachedResp);  //If Fetch fails, return the Cached Response
                return cachedResp || fetchPromise;  //Return the Cached Response if available, else return the Network Fetched Response
            })
            .catch(() => fetch(e.request));  //If there is an error in matching the request in Cache, Fetch the Request from Network
    }));
});

/** Adding Event Listener for Service Worker Sync Event */
self.addEventListener("sync", function(event) {
    if (event.tag === "easy-mutual-funds-sync") {
        event.waitUntil(    
            clients.matchAll().then(clients => { //Send a Message indicating sync event to all Clients
                clients.forEach(client => client.postMessage("sync-transactions"));
            })
        );
    }
});


