// Example weather API call (using OpenWeatherMap API for demonstration)
// You will need to replace 'YOUR_API_KEY' with your actual API key.

const apiKey = '41db8b032208cd83589ccd20529b4a91'; // Replace with your weather API key
const apiBaseUrl = 'https://api.openweathermap.org/data/2.5/';

// Initial city for demonstration
let currentCity = 'Bremerton';

const unitToggle = document.getElementById('unit-toggle');
const citySearch = document.getElementById('city-search');
let isFahrenheit = true;

// Adding input validation for the search bar
citySearch.addEventListener("keypress", function(event) {
  if (event.key === "Enter") { // Detect 'Enter' keypress
    event.preventDefault();
    const input = event.target.value.trim();

    // Basic validation: Check if input is empty or contains non-alphanumeric characters
    if (!input || !/^[a-zA-Z0-9\s]+$/.test(input)) {
      showError("Please enter a valid city name (letters and numbers only).");
    } else {
      // Proceed with the API call or other actions
      clearError(); // Clears any previous error message
      currentCity = input; // Update current city with validated input
      fetchWeatherData(currentCity); // Assuming this function exists in your code
    }
  }
});

function showError(message) {
  let errorElement = document.getElementById("search-error");
  if (!errorElement) {
    errorElement = document.createElement("p");
    errorElement.id = "search-error";
    errorElement.style.color = "red"; // Or add a CSS class for styling
    document.querySelector("header").appendChild(errorElement); // Add error message to the header
  }
  errorElement.textContent = message;
}

function clearError() {
  const errorElement = document.getElementById("search-error");
  if (errorElement) errorElement.remove();
}

// Function to fetch weather data (placeholder for actual implementation)
function fetchWeatherData(city) {
  const url = `${apiBaseUrl}weather?q=${city}&appid=${apiKey}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== 200) {
        showError("City not found. Please try another.");
      } else {
        clearError();
        // Update weather info here with data received from API
        updateWeatherInfo(data);
      }
    })
    .catch(error => showError("Failed to fetch weather data. Please try again."));
}

// Function to update the weather information (placeholder for actual implementation)
function updateWeatherInfo(data) {
  // Update DOM elements with weather data
  document.getElementById("city-name").textContent = data.name;
  document.getElementById("temp").textContent = `${Math.round(data.main.temp - 273.15)}°C`; // Converts Kelvin to Celsius
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("high-low").textContent = `${Math.round(data.main.temp_max - 273.15)}° / ${Math.round(data.main.temp_min - 273.15)}°`;
  document.getElementById("wind-speed").textContent = `${data.wind.speed} m/s`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("date").textContent = new Date().toLocaleDateString();
}

// Toggle between Fahrenheit and Celsius
unitToggle.addEventListener("click", () => {
  isFahrenheit = !isFahrenheit;
  const tempElement = document.getElementById("temp");
  const currentTemp = parseFloat(tempElement.textContent);
  
  if (isFahrenheit) {
    tempElement.textContent = `${Math.round(currentTemp * 9/5 + 32)}°F`;
  } else {
    tempElement.textContent = `${Math.round((currentTemp - 32) * 5/9)}°C`;
  }
});
