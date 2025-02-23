const weatherIconContainer = document.querySelector('#weatherIconContainerDiv');
const strWeatherDescriptor = document.querySelector('#txtWeatherDescriptor');
const strWeatherInfo = document.querySelector('#WeatherInfoDiv')

// Function to retrieve and parse weather information from the Open-Meteo API
async function getWeatherInfo() {
    const strResponse = await fetch('https://api.open-meteo.com/v1/forecast?latitude=36.1628&longitude=-85.5016&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago&forecast_days=1');
    const strWeatherData = await strResponse.json();
    console.log(strWeatherData);

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
        daily: strWeatherData.daily
    }
}


// Function to display the appropriate weather icon and descriptor based on the weather code
function displayWeatherIcon(strWeatherData) {
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
    //Rainy weather
    else if (strWeatherCode == '51' || strWeatherCode == '53' || strWeatherCode == '55' || strWeatherCode == '61' || strWeatherCode == '63' 
        || strWeatherCode == '65' || strWeatherCode == '80' || strWeatherCode == '81' || strWeatherCode == '82'
    ) {
        strWeatherInfo.innerHTML = '<h2 class="text-center mb-0">Rain</h2>';
        weatherIconContainer.innerHTML = '<i class="bi bi-cloud-rain icon-200"></i>';
    }
    else {
        weatherIconContainer.innerHTML = '<i class="bi bi-cloud-slash icon-200"></i>';
    }
}


// Function to display weather information
async function displayWeatherInfo() {
    const strWeatherData = await getWeatherInfo();
    const strCurrentWeather = strWeatherData.current;
    const strDailyWeather = strWeatherData.daily;
    const strTemperature = parseInt(strCurrentWeather.temperature_2m);
    const strHumidity = strCurrentWeather.relative_humidity_2m;
    const strApparentTemperature = parseInt(strCurrentWeather.apparent_temperature);
    const strHighTemperature = parseInt(strDailyWeather.temperature_2m_max);
    const strLowTemperature = parseInt(strDailyWeather.temperature_2m_min);
    const strChancePrecipitation = parseInt(strDailyWeather.precipitation_probability_max);
    const strCloudCover = parseInt(strCurrentWeather.cloud_cover);
    displayWeatherIcon(strWeatherData.current);

    // Display the current temperature
    strWeatherInfo.innerHTML += `<p class="text-center temp-text mb-0">${strTemperature}°F</p>`;
    strWeatherInfo.innerHTML += `<div class="d-flex justify-content-around"><h5>High: ${strHighTemperature}°F</h5><h5>Low: ${strLowTemperature}°F</h5><h5 class="text-center">Feels like: ${strApparentTemperature}°F</h5></div>`;
    strWeatherInfo.innerHTML += `<table class="table mt-4" id="weatherTable" aria-label="Weather Information">
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
