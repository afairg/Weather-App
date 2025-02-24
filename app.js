const weatherIconContainer = document.querySelector('#weatherIconContainerDiv');
const strWeatherDescriptor = document.querySelector('#txtWeatherDescriptor');
const strWeatherInfo = document.querySelector('#weatherInfoDiv');
const strCityState = document.querySelector('#txtCityState');


// Function to retrieve the user's location using OpenStreetMap's Nominatim API
async function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async function (position) {
                try {
                    const strLat = position.coords.latitude.toString();
                    const strLong = position.coords.longitude.toString();
                    let url = `https://nominatim.openstreetmap.org/reverse?lat=${strLat}&lon=${strLong}&format=json`;

                    let objResponse = await fetch(url);
                    let objData = await objResponse.json();
                    let strCity = objData.address.city || objData.address.town || objData.address.village || "Unknown Location";
                    let strState = objData.address.state;

                    console.log("Location Data:", objData);

                    resolve({
                        lat: strLat,
                        long: strLong,
                        city: strCity,
                        state: strState
                    });

                } catch (error) {
                    console.error("Error retrieving city name:", error);
                    reject(error);
                }
            },
            (error) => {
                console.error("Error retrieving user location data:", error);
                reject(error);
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
            reject(new Error("Geolocation not supported"));
        }
    });
}

// Function to retrieve and parse weather information from the Open-Meteo API
async function getWeatherInfo() {
    const objLocation = await getLocation();
    const strLat = objLocation.lat;
    const strLong = objLocation.long;
    const strCity = objLocation.city;
    const strState = objLocation.state;
    console.log("objLocation: ", objLocation);
    const strResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${strLat}&longitude=${strLong}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago&forecast_days=1`);
    const strWeatherData = await strResponse.json();
    // Error case, data could not be retrieved
    if (strWeatherData.error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while trying to get the weather information. Please try again later.'
        })
    }
    // Return the current and daily weather data
    return {
        current: strWeatherData.current,
        daily: strWeatherData.daily,
        city: strCity,
        state: strState
    }
}


// Function to display the appropriate weather icon and descriptor based on the weather code
function displayWeatherImages(strWeatherData) {
    const strWeatherCode = strWeatherData.weather_code;
    // Clear weather
    if (strWeatherCode == '0') {
        strWeatherInfo.innerHTML = '<h2 class="text-center mb-0">Clear Skies</h2>';
        if (strWeatherData.is_day == '1') {
            weatherIconContainer.innerHTML = '<i class="bi bi-sun icon-200"></i>';
        }
        else {
            weatherIconContainer.innerHTML = '<i class="bi bi-moon icon-200"></i>';
        }
    }
    // Partly cloudy weather
    else if (strWeatherCode == '1' || strWeatherCode == '2') {
        strWeatherInfo.innerHTML = '<h2 class="text-center mb-0">Partly Cloudy</h2>';
        if (strWeatherData.is_day == '1') {
            weatherIconContainer.innerHTML = '<i class="bi bi-cloud-sun icon-200"></i>';
        }
        else {
            weatherIconContainer.innerHTML = '<i class="bi bi-cloud-moon icon-200"></i>';
        }
    }
    // Cloudy weather
    else if (strWeatherCode == '3') {
        strWeatherInfo.innerHTML = '<h2 class="text-center mb-0">Cloudy</h2>';
        weatherIconContainer.innerHTML = '<i class="bi bi-cloud icon-200"></i>';
    }
    // Foggy weather
    else if (strWeatherCode == '45' || strWeatherCode == '48') {
        strWeatherInfo.innerHTML = '<h2 class="text-center mb-0">Fog</h2>';
        weatherIconContainer.innerHTML = '<i class="bi bi-cloud-fog icon-200"></i>';
    }
    //Rainy weather
    else if (strWeatherCode == '51' || strWeatherCode == '53' || strWeatherCode == '55' || strWeatherCode == '61' || strWeatherCode == '63' 
        || strWeatherCode == '65' || strWeatherCode == '80' || strWeatherCode == '81' || strWeatherCode == '82'
    ) {
        strWeatherInfo.innerHTML = '<h2 class="text-center mb-0">Rain</h2>';
        weatherIconContainer.innerHTML = '<i class="bi bi-cloud-rain icon-200"></i>';
    }
    //Stormy weather
    else if (strWeatherCode == '95') {
        strWeatherInfo.innerHTML = '<h2 class="text-center mb-0">Thunderstorms</h2>';
        weatherIconContainer.innerHTML = '<i class="bi bi-cloud-lightning-rain icon-200"></i>';
    }
    //Snowy weather
    else if (strWeatherCode == '71' || strWeatherCode == '73' || strWeatherCode == '75' || strWeatherCode == '77' || strWeatherCode == '85' 
        || strWeatherCode == '86'
    ) {
        strWeatherInfo.innerHTML = '<h2 class="text-center mb-0">Snow</h2>';
        weatherIconContainer.innerHTML = '<i class="bi bi-cloud-snow icon-200"></i>';
    }
    // "Unknown" weather
    else {
        weatherIconContainer.innerHTML = '<i class="bi bi-cloud-slash icon-200"></i>';
    }
}


// Function to display weather information
async function displayWeatherInfo() {
    const strWeatherData = await getWeatherInfo();
    console.log("getWeatherInfo: ", strWeatherData);
    const strCurrentWeather = strWeatherData.current;
    const strDailyWeather = strWeatherData.daily;
    const strCity = strWeatherData.city;
    const strState = strWeatherData.state;
    const strTemperature = parseInt(strCurrentWeather.temperature_2m);
    const strHumidity = strCurrentWeather.relative_humidity_2m;
    const strApparentTemperature = parseInt(strCurrentWeather.apparent_temperature);
    const strHighTemperature = parseInt(strDailyWeather.temperature_2m_max);
    const strLowTemperature = parseInt(strDailyWeather.temperature_2m_min);
    const strChancePrecipitation = parseInt(strDailyWeather.precipitation_probability_max);
    const strCloudCover = parseInt(strCurrentWeather.cloud_cover);
    displayWeatherImages(strWeatherData.current);

    strCityState.innerText = `${strCity}, ${strState}`;
    // Display the current weather conditions
    strWeatherInfo.innerHTML += `<p class="text-center temp-text mb-0">${strTemperature}°F</p>`;
    strWeatherInfo.innerHTML += `<div class="d-flex justify-content-around"><h5>High: ${strHighTemperature}°F</h5><h5>Low: ${strLowTemperature}°F</h5><h5 class="text-center">Feels like: ${strApparentTemperature}°F</h5></div>`;
    strWeatherInfo.innerHTML += `<table class="table mt-4" id="weatherTable" aria-label="Weather Information Table">
                                    <tbody>
                                        <tr>
                                            <td>Humidity</td>
                                            <td><i class="bi bi-moisture"></i></td>
                                            <td>${strHumidity}%</td>
                                        </tr>
                                        <tr>
                                            <td>Chance of Precipitation</td>
                                            <td><i class="bi bi-droplet"></i></td>
                                            <td>${strChancePrecipitation}%</td>
                                        </tr>
                                        <tr>
                                            <td>Cloud Cover</td>
                                            <td><i class="bi bi-clouds"></i></td>
                                            <td>${strCloudCover}%</td>
                                        </tr>
                                    </tbody>
                                </table>`;
}

displayWeatherInfo();
