class Apis {
    defaultCountryName = localStorage.getItem('countryName');   //default country is previously stored country or null
    currentCountryName = null;

    fundsApi = {
        apiKey: "7ea73364a0ff42b097cf4fc044d4bbfb",
        baseUrl: "https://api.twelvedata.com/mutual_funds/list",
    
        countryParam: country => country && `&country=${country}`,  //if country is null, funds from all countries are fetched
        countParam: "outputsize=10",
    
        getUrl(countryName = this.defaultCountryName) {
            return `${this.baseUrl}?apikey=${this.apiKey}${this.countryParam(countryName)}`;
        }
    };
    async getAllFunds() {
        this.currentCountryName = await this.getCountryName();
    
        //headerCountryTextElement.innerText = this.currentCountryName;
        localStorage.setItem('countryName', this.currentCountryName);
    
        return fetch(this.fundsApi.getUrl(this.currentCountryName))
            .then(response => response.json())
            .then(data => {
                const funds = data?.result?.list;
                if(funds && funds.length) indexedDb.addAllFunds(funds); //save funds in indexedDb for offline use
                return funds;
            });
    }

    geoApi = {
        baseUrl: "http://api.geonames.org/countryCodeJSON",
        
        latParam: lat => `lat=${lat}`,
        lngParam: lng => `lng=${lng}`,
        usernameParam: "username=abhayrocks3",
    
        getUrl(lat, lng) {
            return `${this.baseUrl}?${this.latParam(lat)}&${this.lngParam(lng)}&${this.usernameParam}`;
        }
    }
    getCountryName() {
        return new Promise(resolve => {
            getLocation(locationObject => {
                if (!locationObject) {
                    resolve(this.defaultCountryName);
                    return;
                }
                const { latitude, longitude } = locationObject;
                fetch(this.geoApi.getUrl(latitude, longitude))
                    .then(response => {
                        if (!response.ok) throw new Error();
                        return response.json();
                    })
                    .then(data => resolve(data.countryName || this.defaultCountryName))
                    .catch(() => resolve(this.defaultCountryName));
            });
        });
    }
}

const apis = new Apis();
