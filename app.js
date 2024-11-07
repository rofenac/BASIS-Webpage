const cityNameElement = document.getElementById('city-name');
const tempElement = document.getElementById('temp');
const highLowElement = document.getElementById('high-low');
const windSpeedElement = document.getElementById('wind-speed');
const humidityElement = document.getElementById('humidity');
const weatherIconElement = document.getElementById('weather-icon');
const descriptionElement = document.getElementById('description');
const errorMessageElement = document.getElementById('error-message');
const dateElement = document.getElementById('date');

let isFahrenheit = true; // Default unit

// Function to convert Kelvin to Fahrenheit or Celsius
function convertTemp(kelvin, unit) {
  return unit === 'F'
    ? Math.round((kelvin - 273.15) * 9/5 + 32)
    : Math.round(kelvin - 273.15);
}

// Function to convert windspeed from m/s to mph
function convertWindSpeed(metricWindSpeed) {
  return Math.round(metricWindSpeed * 2.23694);
}

// Fetch and display weather data
function displayWeatherData(data) {
  const { name, main, weather, wind, dt } = data;

  const date = new Date(dt * 1000);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

  cityNameElement.textContent = name;
  tempElement.textContent = `${convertTemp(main.temp, isFahrenheit ? 'F' : 'C')}°${isFahrenheit ? 'F' : 'C'}`;
  highLowElement.textContent = `${convertTemp(main.temp_max, isFahrenheit ? 'F' : 'C')}° / ${convertTemp(main.temp_min, isFahrenheit ? 'F' : 'C')}°`;
  windSpeedElement.textContent = `${convertWindSpeed(wind.speed)} mph`;
  humidityElement.textContent = `${main.humidity}%`;
  descriptionElement.textContent = weather[0].description;
  weatherIconElement.src = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  dateElement.textContent = (date.toLocaleDateString(undefined, options));
}

// Toggle between Fahrenheit and Celsius
document.getElementById('unit-toggle').addEventListener('click', () => {
  isFahrenheit = !isFahrenheit;
  const cityName = document.getElementById('city-search').value.trim();
  fetchWeatherData(cityName); // Re-fetch or re-render with new units
});

// Event listener for city search bar functionality
document.getElementById('city-search').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchCity();
  }
});

// Function for the city search bar
function searchCity() {
  const cityName = document.getElementById('city-search').value.trim();

  if (cityName === "") {
    alert("Please enter a city name.");
    return;
  }

  fetchWeatherData(cityName);
}

// Fetch data from OpenWeather API with error handling
async function fetchWeatherData(city = 'Bremerton') {
  const apiKey = '41db8b032208cd83589ccd20529b4a91';
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
    
    if (!response.ok) {
      // If response is not OK, trigger error message
      errorMessageElement.textContent = "City not found or invalid input. Please try again.";
      return;
    }

    const data = await response.json();

    // If API returned bad data
    if (!data || data.error) {
      errorMessageElement.textContent = "Unable to retrieve data. Please check your input and try again.";
      return;
    }

    // Clear any previous error message and display the data
    errorMessageElement.textContent = "";
    displayWeatherData(data);
    
  } catch (error) {
    // Display a generic error message for network or other errors
    errorMessageElement.textContent = "Network error. Please check your connection and try again.";
    console.error("Error fetching weather data:", error);
  }
}

// Initial fetch
fetchWeatherData();
