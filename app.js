const cityNameElement = document.getElementById('city-name');
const tempElement = document.getElementById('temp');
const highLowElement = document.getElementById('high-low');
const windSpeedElement = document.getElementById('wind-speed');
const humidityElement = document.getElementById('humidity');
const weatherIconElement = document.getElementById('weather-icon');
const descriptionElement = document.getElementById('description');
const errorMessageElement = document.getElementById('error-message');
const dateElement = document.getElementById('date');
const backgroundElement = document.getElementById('background');
const weatherConditions = {
  thunderstorm: 'thunderstorm',
  rain: 'rain',
  snow: 'snow',
  fog: 'fog',
  cloudy: 'cloudy',
  clearSky: 'clear-sky',
};
const animationsContainer = document.getElementById('animations');

let unit = 'imperial'; // Globally defined unit for the F/C toggle button

const apiKey = `38137b56cf796c2682119ac4af83a500`; // OpenWeather API Key

// Fetch and display weather data
function displayWeatherData(data) {
  const { weather, main, wind, dt } = data;
  const weatherCode = weather[0].id;  // Use the weather code for the background
  const unitLabel = (unit === 'imperial') ? 'F°' : 'C°';
  const windSpeedUnit = (unit === 'imperial') ? 'mph' : 'm/s';
  
  // Update background based on weather condition
  updateBackground(weatherCode);
  
  // Display logic
  const date = new Date(dt * 1000);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};

  cityNameElement.textContent = data.name;
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

// Function to update the background based on weather condition
function updateBackground(weatherCode) {
  let backgroundImage = '';
  let weatherCondition = '';

  // Determine background and weather condition based on weather code
  if (weatherCode >= 200 && weatherCode <= 299) {
    backgroundImage = 'url("images/thunderstorm.jpg")';
    weatherCondition = 'thunderstorm';
  } else if (weatherCode >= 300 && weatherCode <= 399) {
    backgroundImage = 'url("images/rain.jpg")';
    weatherCondition = 'rain';
  } else if (weatherCode >= 500 && weatherCode <= 599) {
    backgroundImage = 'url("images/rain.jpg")';
    weatherCondition = 'rain';
  } else if (weatherCode >= 600 && weatherCode <= 699) {
    backgroundImage = 'url("images/snow.jpg")';
    weatherCondition = 'snow';
  } else if (weatherCode >= 700 && weatherCode <= 799) {
    backgroundImage = 'url("images/fog.jpg")';
    weatherCondition = 'fog';
  } else if (weatherCode === 800) {
    backgroundImage = 'url("images/clear-sky.jpg")';
    weatherCondition = 'clearSky';
  } else if (weatherCode >= 801 && weatherCode <= 804) {
    backgroundImage = 'url("images/cloudy.jpg")';
    weatherCondition = 'cloudy';
  }

  // Apply the background image
  backgroundElement.style.backgroundImage = backgroundImage;

  // Trigger the appropriate animation
  updateWeatherAnimation(weatherCondition);
}

// Function to update weather animations
function updateWeatherAnimation(weatherCondition) {
  // Clear existing animations
  clearAnimations();

  // Apply the animation based on the current weather condition
  switch (weatherCondition) {
    case 'thunderstorm':
      createLightning();
      createRain();
      break;
    case 'rain':
      createRain();
      break;
    case 'snow':
      createSnow();
      break;
    case 'fog':
      createFog();
      break;
    case 'cloudy':
      createClouds();
      break;
    case 'clearSky':
      // No animations for clear skies
      break;
    default:
      console.warn('Unknown weather condition:', weatherCondition);
  }
}

// Function to clear all animations, including rain and lightning
function clearAnimations() {
  while (animationsContainer.firstChild) {
    animationsContainer.removeChild(animationsContainer.firstChild);
  }

  // Clear all active timeouts
  activeTimeouts.forEach((timeout) => clearTimeout(timeout));
  activeTimeouts = [];

  // Clear any lingering elements
  document.querySelectorAll('.raindrop, .lightning, .lightning-flash').forEach((element) => {
    if (element.parentNode) element.remove();
  });
}

// Function to create rain effect
function createRain() {
  const numberOfRaindrops = 100;

  for (let i = 0; i < numberOfRaindrops; i++) {
    const raindrop = document.createElement('div');
    raindrop.classList.add('raindrop');
    raindrop.style.left = `${Math.random() * 100}vw`; // Random horizontal position
    raindrop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`; // Random speed
    animationsContainer.appendChild(raindrop);
  }
}

// Function to create snow effect
function createSnow() {
  const numberOfSnowflakes = 60;

  for (let i = 0; i < numberOfSnowflakes; i++) {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.style.left = `${Math.random() * 100}vw`; // Random horizontal position
    snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`; // Random speed
    animationsContainer.appendChild(snowflake);
  }
}

let activeTimeouts = [];

// Function to create lightning effect
function createLightning() {
  function triggerLightning() {
    const flash = document.createElement('div');
    flash.classList.add('lightning-flash');
    animationsContainer.appendChild(flash);

    const startX = Math.random() * window.innerWidth;
    const path = generateLightningPath(startX);

    path.forEach((segment) => {
      const segmentElement = document.createElement('div');
      segmentElement.classList.add('lightning');

      const deltaX = segment.endX - segment.startX;
      const deltaY = segment.endY - segment.startY;
      const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      segmentElement.style.width = `${length}px`;
      segmentElement.style.height = "4px";
      segmentElement.style.left = `${segment.startX}px`;
      segmentElement.style.top = `${segment.startY}px`;
      segmentElement.style.transform = `rotate(${angle}deg)`;
      segmentElement.style.transformOrigin = "0 50%";

      animationsContainer.appendChild(segmentElement);

      // Track timeout for segment removal
      const segmentTimeout = setTimeout(() => {
        if (segmentElement.parentNode) segmentElement.remove();
      }, 300);
      activeTimeouts.push(segmentTimeout);
    });

    // Track timeout for flash removal
    const flashTimeout = setTimeout(() => {
      if (flash.parentNode) flash.remove();
    }, 200);
    activeTimeouts.push(flashTimeout);
  }

  function tripleLightningStrike() {
    for (let i = 0; i < 3; i++) {
      const strikeTimeout = setTimeout(() => {
        triggerLightning();
      }, i * 300);
      activeTimeouts.push(strikeTimeout);
    }
  }

  function startLightningSequence() {
    tripleLightningStrike();
    const sequenceTimeout = setTimeout(startLightningSequence, Math.random() * 2000 + 3000);
    activeTimeouts.push(sequenceTimeout);
  }

  startLightningSequence();
}

// Generate a lightning path spanning the entire screen
function generateLightningPath(startX) {
  const segments = [];
  let currentX = startX;
  let currentY = 0; // Start at the top

  while (currentY < window.innerHeight) {
    // Limit horizontal deviation to ±20 pixels
    const nextX = currentX + (Math.random() - 0.5) * 40; // Slight jaggedness
    const nextY = currentY + Math.random() * 120 + 60; // Strong vertical progression

    segments.push({ startX: currentX, startY: currentY, endX: nextX, endY: nextY });

    // Update current position
    currentX = nextX;
    currentY = nextY;
  }

  return segments;
}

// Flash the entire screen during lightning strikes
function flashScreen() {
  const flash = document.createElement('div');
  flash.classList.add('lightning-flash');
  document.body.appendChild(flash);

  setTimeout(() => flash.remove(), 200); // Remove flash after animation
}

// Function to create cloud movement
function createClouds() {
  const numberOfClouds = 20; // Adjust the number of clouds
  const shades = ['#e0e0e0', '#d8d8d8', '#c8c8c8', '#b8b8b8']; // Shades for depth

  for (let i = 0; i < numberOfClouds; i++) {
    const cloud = document.createElement('div');
    cloud.classList.add('cloud');

    // Randomize size for depth
    const width = Math.random() * 150 + 100; // Width between 100px and 250px
    const height = width / 2; // Maintain proportion for natural cloud shapes
    cloud.style.width = `${width}px`;
    cloud.style.height = `${height}px`;

    // Randomize shading
    cloud.style.backgroundColor = shades[Math.floor(Math.random() * shades.length)];

    // Determine if the cloud starts from the left or right
    const isFromLeft = Math.random() > 0.5;
    if (isFromLeft) {
      cloud.style.left = `-${width}px`; // Start off-screen to the left
      cloud.style.animation = `moveCloudsRight ${Math.random() * 20 + 20}s linear infinite`;
    } else {
      cloud.style.left = `100vw`; // Start off-screen to the right
      cloud.style.animation = `moveCloudsLeft ${Math.random() * 20 + 20}s linear infinite`;
    }

    // Randomize vertical position
    cloud.style.top = `${Math.random() * 100}vh`; // Random vertical position

    // Add the cloud to the background
    animationsContainer.appendChild(cloud);
  }
}

// Function to create eerie fog blobs with dynamic shapes
function createFog() {
  const numberOfBlobs = 50;

  for (let i = 0; i < numberOfBlobs; i++) {
    const fogBlob = document.createElement('div');
    fogBlob.classList.add('fog-blob');

    // Randomize size and position
    const size = Math.random() * 300 + 200; // Blob size between 200px and 500px
    fogBlob.style.width = `${size}px`;
    fogBlob.style.height = `${size}px`;
    fogBlob.style.top = `${Math.random() * 100}vh`; // Random vertical position

    // Alternate direction: left-to-right or right-to-left
    const isFromLeft = Math.random() > 0.5;
    if (isFromLeft) {
      fogBlob.style.left = `-${size}px`; // Start off-screen to the left
      fogBlob.style.animation = `fogDriftRight ${Math.random() * 20 + 15}s linear infinite, fogMorph ${Math.random() * 5 + 5}s ease-in-out infinite`;
    } else {
      fogBlob.style.left = `100vw`; // Start off-screen to the right
      fogBlob.style.animation = `fogDriftLeft ${Math.random() * 20 + 15}s linear infinite, fogMorph ${Math.random() * 5 + 5}s ease-in-out infinite`;
    }

    // Append to the animations container
    animationsContainer.appendChild(fogBlob);
  }
}

//Code for solar data box at the bottom of the page
document.addEventListener("DOMContentLoaded", () => {
  const solarImg = document.getElementById("solar-data-img");
  const loader = document.getElementById("solar-data-loader");
  const container = document.getElementById("solar-data-container");

  // Show loader while the image is loading
  loader.style.display = "block";

  // Hide loader and show the image when it has loaded
  solarImg.onload = () => {
    loader.style.display = "none";
    solarImg.style.display = "block";
  };

  // Handle errors gracefully
  solarImg.onerror = () => {
    loader.textContent = "Failed to load solar data.";
    loader.style.color = "red";
  };

  // Add click event for custom behavior
  container.addEventListener("click", () => {
    alert("Redirecting to Solar Data Source!");
  });
});

// Initial fetch with a default city
fetchForecast('Bremerton'); // Example default city
fetchWeatherData('Bremerton');
