const cityNameElement = document.getElementById('city-name');
const tempElement = document.getElementById('temp');
const highLowElement = document.getElementById('high-low');
const windSpeedElement = document.getElementById('wind-speed');
const humidityElement = document.getElementById('humidity');
const weatherIconElement = document.getElementById('weather-icon');
const descriptionElement = document.getElementById('description');
const errorMessageElement = document.getElementById('error-message');
const dateElement = document.getElementById('date');

let unit = 'imperial'; // Globally defined unit for the F/C toggle button

const apiKey = `38137b56cf796c2682119ac4af83a500`; // OpenWeather API Key

// Fetch and display weather data
function displayWeatherData(data) {
  const { name, main, weather, wind, dt } = data;
  const date = new Date(dt * 1000);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

  const unitLabel = (unit === 'imperial') ? 'F°' : 'C°';
  const windSpeedUnit = (unit === 'imperial') ? 'mph' : 'm/s';

  cityNameElement.textContent = name;
  tempElement.textContent = `${Math.round(main.temp)} ${unitLabel}`;
  highLowElement.textContent = `${Math.round(main.temp_max)} ${unitLabel} / ${Math.round(main.temp_min)} ${unitLabel}`;
  windSpeedElement.textContent = `${(wind.speed)} ${windSpeedUnit}`;
  humidityElement.textContent = `${main.humidity}%`;
  descriptionElement.textContent = weather[0].description;
  weatherIconElement.src = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  dateElement.textContent = (date.toLocaleDateString(undefined, options));
}

// Toggle between Fahrenheit and Celsius
document.getElementById('unit-toggle').addEventListener('click', () => {
  unit = (unit === 'imperial') ? 'metric' : 'imperial';

  const cityName = document.getElementById('city-search').value.trim() || 'Bremerton';
  fetchWeatherData(cityName); // Re-fetch or re-render with new units
  fetchForecast(cityName);
});

// Event listener for city search bar functionality & updating forecast
document.getElementById('city-search').addEventListener('keydown', async function (event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchCity();
    const cityName = this.value.trim();
    }
  }
);

// Function for the city search bar
function searchCity() {
  const cityName = document.getElementById('city-search').value.trim();

  fetchWeatherData(cityName);
  fetchForecast(cityName);
}

// Function to update the forecast grid
async function updateWeatherForCity(cityName) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=${unit}`);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    // Clear any previous error message
    errorMessageElement.textContent = "";

    displayWeatherData(data);
    displayForecast(data.list);
  } catch (error) {
      errorMessageElement.textContent = "";
  }
}

// Fetch data from OpenWeather API with error handling
async function fetchWeatherData(city = 'Bremerton') {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`);

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

// Function to fetch forecast data
async function fetchForecast(city) {
  try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`);
      if (!response.ok) throw new Error("Failed to fetch forecast data");

      const data = await response.json();

      const dailyForecast = groupForecastByDay(data.list);
      displayForecast(dailyForecast);
  } catch (error) {
      console.error("Error fetching forecast:", error);
  }
}

// Helper function to group forecast data by day
function groupForecastByDay(list) {
  const dailyData = {};

  list.forEach(entry => {
      const date = new Date(entry.dt * 1000).toISOString().split("T")[0]; // Extract date in YYYY-MM-DD format

      if (!dailyData[date]) {
          dailyData[date] = {
              date: date,
              temps: [],
              weather: entry.weather[0]
          };
      }
      dailyData[date].temps.push(entry.main.temp);
  });

  return Object.values(dailyData).slice(0, 5).map(day => ({
      date: day.date,
      minTemp: Math.min(...day.temps),
      maxTemp: Math.max(...day.temps),
      weather: day.weather
  }));
}

// Function to display forecast data in the HTML
function displayForecast(forecastDays) {
  const forecastGrid = document.querySelector('.forecast-grid');
  forecastGrid.innerHTML = ''; // Clear any existing content

  // Dynamically determine temperature unit
  const unitLabel = (unit === 'imperial') ? '°F' : '°C';

  forecastDays.forEach(day => {
      const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const iconUrl = `https://openweathermap.org/img/wn/${day.weather.icon}.png`;
      const description = day.weather.description;

      // Create a div for each day's forecast
      const forecastItem = document.createElement('div');
      forecastItem.classList.add('forecast-item');
      forecastItem.innerHTML = `
          <p>${date}</p>
          <img src="${iconUrl}" alt="${description}">
          <p>${description}</p>
          <p>High: ${Math.round(day.maxTemp)}${unitLabel} / Low: ${Math.round(day.minTemp)}${unitLabel}</p>
      `;

      forecastGrid.appendChild(forecastItem);
  });
}

// Initial fetch with a default city
fetchForecast('Bremerton'); // Example default city
fetchWeatherData('Bremerton');
