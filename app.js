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
  const apiKey = '38137b56cf796c2682119ac4af83a500';
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

// Example function to fetch 7-day weather forecast
async function fetchForecast(city) {
  try {
      const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=38137b56cf796c2682119ac4af83a500=${city}&days=7`);
      if (!response.ok) throw new Error("Failed to fetch forecast data");

      const data = await response.json();
      displayForecast(data.forecast.forecastday);
  } catch (error) {
      console.error("Error fetching forecast:", error);
  }
}

// Function to display forecast data in the HTML
function displayForecast(forecastDays) {
  const forecastGrid = document.querySelector('.forecast-grid');
  forecastGrid.innerHTML = ''; // Clear any existing content

  forecastDays.forEach(day => {
      const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const iconUrl = day.day.condition.icon;
      const maxTemp = Math.round(day.day.maxtemp_c);
      const minTemp = Math.round(day.day.mintemp_c);
      const description = day.day.condition.text;

      // Create a div for each day's forecast
      const forecastItem = document.createElement('div');
      forecastItem.classList.add('forecast-item');
      forecastItem.innerHTML = `
          <p>${date}</p>
          <img src="${iconUrl}" alt="Weather icon">
          <p>${description}</p>
          <p>High: ${maxTemp}°C / Low: ${minTemp}°C</p>
      `;

      forecastGrid.appendChild(forecastItem);
  });
}

// Call fetchForecast with a default city or based on user input
fetchForecast('San Francisco'); // Example default city

// Initial fetch
fetchWeatherData();
