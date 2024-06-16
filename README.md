# Prototype
![Invest](https://github.com/abhaymlimaye/mutual-fund_pwa/assets/32418776/9bd1a916-0c9a-446d-a3c0-8dd6e0c6a493)
![Portfolio](https://github.com/abhaymlimaye/mutual-fund_pwa/assets/32418776/c3199a3b-1c16-460a-ab83-100e77582a4b)
![Transactions](https://github.com/abhaymlimaye/mutual-fund_pwa/assets/32418776/a6edf827-3613-4c57-9325-8ca36e39c620)

# Vision
# 1.	Aim of the project is to make Mutual Fund Investing easy.
   * The app will allow users to buy a mutual fund, view existing investments and sell the investment.
   * The app will need 3 pages
        - Invest
            User will browse through a List of Mutual Funds. The Funds shown will be from the Country detected from device. User will make a Buy Transaction from this screen.
     -	Portfolio
            This will show the Funds user has already invested in. User will be able to make a Sell Transaction of a held fund from this screen.
         *	Transactions
            All the Buy and Sell type of transaction will show up here. User will be redirected to this screen from Invest or Portfolio screen after making a purchase or a sell.
  *	The types of data needed:-
        *	List of Mutual Funds – Third party API twelvedata.com
        *	Country Name – Browser’s Geolocation API and geonames.org to get country name from latitude and longitude.
        *	Portfolio – Firebase Realtime Database
        *	Transactions – Firebase Realtime Database
  *	Offline Mode
        *	Latest list of Mutual Funds will be stored in IndexedDB whenever connection is available
        *	Country Name will be stored in Local Storage whenever connection is available.
        *	Portfolio items will be stored in IndexedDB. 
        *	Already made Transactions will not be stored offline, however any new Transaction made when offline will be stored in IndexedDB
        *	Whenever Sync event is triggered and connection is available, the Transactions from IndexedDB will be moved to FirebaseDB. Also, the Portfolio Items will be updated to reflect the transaction. This will ensure the Data Integrity of Portfolio Items.
        *	User will also get an indication about device being offline while making any Transaction with information that the data will be updated once online. 
        *	All the HTML Pages, CSS, Scripts, Images and Onsen UI Components are cached using Stale While Revalidate Strategy.

# 2.	Web APIs used:-
   *	Notification API
        Used to show user the Notification whenever a Buy or Sell Transaction is made.
    *	Screen Rotation API
        Used to lock screen orientation to portrait. In case the rotation lock is not available, user will show a recommendation toast whenever device is rotated to landscape mode.
    *	Geo Location API
        Used to detect device’s location. This location is used to get country name required to only fetch Mutual Funds from user’s country.
    *	Push Message API
        Used to communicated sync event received by Service Worker to the main thread i.e. client app.

# 3.	Risks:-
   *	Data about the Mutual Funds is very valuable and hence it is not easily available. Especially the free version provided by third party venders are extremely limited in terms of amount of useful data provided and number of free API calls.
  *	Ensuring data integrity in case of any kind of failure while making a Buy or Sell Transaction is crucial. This requires us to limit some of the offline functionality such as seeing the offline transaction reflected in user’s Portfolio.
