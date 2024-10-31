// Example weather API call (using OpenWeatherMap API for demonstration)
// You will need to replace 'YOUR_API_KEY' with your actual API key.

const apiKey = '41db8b032208cd83589ccd20529b4a91'; // Replace with your weather API key
const apiBaseUrl = 'https://api.openweathermap.org/data/2.5/';

// Initial city for demonstration
let currentCity = 'Bremerton';

const unitToggle = document.getElementById('unit-toggle');
const citySearch = document.getElementById('city-search');
let isFahrenheit = true;

// Fetch weather data
function fetchWeatherData(city) {
  const unit = isFahrenheit ? 'imperial' : 'metric';
  const url = `${apiBaseUrl}weather?q=${city}&units=${unit}&appid=${apiKey}`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => updateWeatherUI(data))
    .catch(error => console.log('Error fetching weather data:', error));
}

// Update weather UI
function updateWeatherUI(data) {
  document.getElementById('city-name').textContent = data.name;
  document.getElementById('date').textContent = new Date().toLocaleDateString();
  document.getElementById('temp').textContent = `${Math.round(data.main.temp)}° ${isFahrenheit ? 'F' : 'C'}`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  document.getElementById('high-low').textContent = `${Math.round(data.main.temp_max)}° / ${Math.round(data.main.temp_min)}°`;
  document.getElementById('wind-speed').textContent = `${data.wind.speed} ${isFahrenheit ? 'mph' : 'm/s'}`;
  document.getElementById('rain').textContent = data.rain ? `${data.rain['1h']} mm` : '0 mm';
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
}

// Toggle units between Fahrenheit and Celsius
unitToggle.addEventListener('click', () => {
  isFahrenheit = !isFahrenheit;
  fetchWeatherData(currentCity);
});

// Search for a new city
citySearch.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    currentCity = citySearch.value;
    fetchWeatherData(currentCity);
  }
});

// Fetch initial data on page load
fetchWeatherData(currentCity);
