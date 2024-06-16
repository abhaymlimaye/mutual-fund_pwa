
/** Register the Service Worker if Supported by the Browser */
if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js", { scope: "/"});

    /** Register the Sync Event for Service Worker */
    navigator.serviceWorker.ready.then(registration => {
        if("sync" in registration) {
            registration.sync.register("easy-mutual-funds-sync") ;
        }
    });

    /** Add Event Listener for Background Sync Event from Service Worker */
    navigator.serviceWorker.addEventListener("message", event => {
        if(event.data === "sync-transactions") {
            masterDb.syncPendingTransactions();
        }
    });
}

/** Web API #1 : Request Permission for Notifications */
if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
}

/** Web API #2 : Lock the Screen Orientation to Portrait or Warn the User */
if("screen" in window && "orientation" in screen) {
    const notPortraitWarning = () => {
        (screen.orientation.type !== "portrait-primary") && showToast("Use in portrait mode for best experience", 2000);
    }

    screen.orientation.lock("portrait").catch(() => {});

    notPortraitWarning();
    screen.orientation.addEventListener("change", notPortraitWarning);
}

/** Web API #3 : Request Location */
function getLocation(callback) {
    if ("geolocation" in navigator) {
        navigator.permissions.query({name:'geolocation'}).then(permissionStatus => {
            if (permissionStatus.state !== 'denied') {
                
                navigator.geolocation.getCurrentPosition(
                    position => callback({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                    () => callback(null)
                );
            } 
            else callback(null);
        })
        .catch((err) => callback(null));
    } 
    else  callback(null);
}

const headerCountryTextElement = document.getElementById("headerCountryText");


function changeTabTo(tabNumber) {
    document.getElementById("mainTabBar").setActiveTab(tabNumber)
}

function showToastAndNotification(message, timeout) {
    if(Notification.permission === "granted") new Notification(message);
    ons.notification.toast(message, { timeout: timeout });
}

function showToast(message, timeout) {
    ons.notification.toast(message, { timeout: timeout });
}

function toggleOfflineIndicator(shouldShow) {
    const indicatorOffline = document.getElementsByClassName("indicatorOffline")
    const indicatorOfflineElements = Array.from(indicatorOffline);
    
    indicatorOfflineElements.forEach(element => element.style.display = shouldShow ? "flex" : "none");
}