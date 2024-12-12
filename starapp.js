let starCreationInterval;
let meteorCreationInterval;
const MeteorSection = document.querySelector('.meteor');
const numberofMeteors = 3;
let activeMeteors = 0;
const cloudsSection = document.querySelector('.clouds');
const numberOfClouds = 20;

// Start of cursor function
const starCursor = document.createElement('div');
starCursor.classList.add('star-cursor');
document.body.appendChild(starCursor);

// Function to update the star position on mouse move
document.addEventListener('mousemove', (e) => {
    starCursor.style.left = `${e.pageX}px`;
    starCursor.style.top = `${e.pageY}px`;
}); 
//end of cursor                                

/* Checks if it is a good day for stargazing */
function isGoodStargazingDay(weatherId) {
    return weatherId === 800;
}

//Start of Meteor creation
function createMeteor() {
    if (activeMeteors >= numberofMeteors) {
        return; // Limits the number of Meteors
    }

    const Meteor = document.createElement('div');
    Meteor.classList.add('meteor-item');

    Meteor.style.top = `${Math.random() * 50}%`;
    Meteor.style.right = '-800px';

    // Random animation duration and delay
    const fallDuration = Math.random() * 3 + .5;
    const fallDelay = Math.random() * 1.5;
    Meteor.style.animationDuration = `${fallDuration}s`;
    Meteor.style.animationDelay = `${fallDelay}s`;

    MeteorSection.appendChild(Meteor);
    activeMeteors++

    setTimeout(() => {
        Meteor.remove();
        activeMeteors--;
    }, 1000 + fallDuration * 1000);
}

//Start of cloud creation
function createCloud() {
    const cloud = document.createElement('div')
    cloud.classList.add('cloud')

    //Random vertical position, only in the top 40% of the container
    cloud.style.top = `${Math.random() * 40}%`;

    //Random width and height for more variation in shapes
    const width = Math.random() * 200 + 300; 
    const height = Math.random() * 80 + 130;
    cloud.style.width = `${width}px`;
    cloud.style.height = `${height}px`;

    cloud.style.borderRadius = `${Math.random() * 50 + 50}% ${Math.random() * 50 + 50}% ${Math.random() * 50 + 50}% ${Math.random() * 50 + 50}%`;  
    
    // Random animation duration and delay
    const floatDuration = Math.random() * 50 + 15; // Random duration between 60s and 120s
    const floatDelay = Math.random() * .2; // Random delay up to 10s
    cloud.style.animationDuration = `${floatDuration}s`;
    cloud.style.animationDelay = `${floatDelay}s`;

    cloudsSection.appendChild(cloud);
}
//End of cloud

/* Creates a star in a random position on the screen */
function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * 50}vh`;
    star.style.left = `${Math.random() * 100}vw`;
    star.style.opacity = 0;
    document.getElementById('stars').appendChild(star);

    /* Makes the star fade in and out */
    setTimeout(() => {
        star.style.transition = 'opacity 1s';
        star.style.opacity = 1;
        setTimeout(() => {
            star.style.opacity = 0;
            setTimeout(() => star.remove(), 1000);
        }, 1000);
    }, Math.random() * 1000);
}
//end of star

/* Updates the stargazing conditions and toggles visibility of stars */
function updateStargazingConditions(weatherId) {
    const starsContainer = document.getElementById('stars');
    const checkingConditions = document.getElementById('checkingConditions');
    const message = document.getElementById('message');

    // Immediately hide checking message and update conditions
    checkingConditions.style.display = "none";

    const goodDay = isGoodStargazingDay(weatherId); // Check if it's a good day

    if (goodDay) {
        message.textContent = "Good Day to Stargaze! 🌟";
        starsContainer.style.display = "block"; // Show stars if a good day

        document.addEventListener('mousemove', function (e) {
            let trail = document.createElement('div');
            trail.className = 'mouse-trail';
            trail.style.left = `${e.pageX}px`;
            trail.style.top = `${e.pageY}px`;
            document.body.appendChild(trail);

            setTimeout(() => {
                trail.remove();
            }, 400); // Adjust the time for the trail to disappear
        });

        starCreationInterval = setInterval(() => {
            for (let i = 0; i < 20; i++) {
                createStar();
            }
        }, 200);

        meteorCreationInterval = setInterval(createMeteor, 100);

    } else {
        message.textContent = "Not a Good Day to Stargaze. ☁️";
        starsContainer.style.display = "block"; // Show stars even if not a good day

        starCreationInterval = setInterval(() => {
            for (let i = 0; i < 10; i++) {
                createStar();
            }
        }, 200);

        for (let i = 0; i < numberOfClouds; i++) {
            createCloud();
        }
    }

    // Display the result message immediately
    message.style.display = "block";
}

function resetStargazingConditions() {
    // Clear the stars and clouds from the screen
    const starsContainer = document.getElementById('stars');
    starsContainer.innerHTML = ''; // Remove all stars
    cloudsSection.innerHTML = ''; // Remove all clouds

    // Clear previous messages
    const message = document.getElementById('message');
    message.textContent = '';

    // Hide or reset stats display
    document.getElementById('cloudCoverage').textContent = 'Loading...';
    document.getElementById('humidity').textContent = 'Loading...';
    document.getElementById('sunsetTime').textContent = 'Loading...';

    // Clear any running intervals 
    clearInterval(starCreationInterval);
    clearInterval(meteorCreationInterval);

    // Hide checking conditions message if visible
    const checkingConditions = document.getElementById('checkingConditions');
    checkingConditions.style.display = 'none';
}

// Add keydown event listener for the Enter key
document.getElementById('city-search-container').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        const location = event.target.value.trim();

        if (!location) {
            alert("Please enter a location.");
            return;
        }

        // Validate input length
        if (location.length > 0 && location.length <= 30) {
            resetStargazingConditions(); // Reset previous results
            fetchWeatherData(location); // Fetch and display weather data
        } else {
            alert('Please enter a valid location (max 30 characters).'); // Alert if input is invalid
        }
    }
});

const apiKey = '38137b56cf796c2682119ac4af83a500'; // Replace with your weather API key
const apiBaseUrl = 'https://api.openweathermap.org/data/2.5/';
const city = `${location}`

async function fetchWeatherData(location) {
    try {
        const response = await fetch(`${apiBaseUrl}weather?q=${location}&appid=${apiKey}&units=imperial`);
        const data = await response.json();

        if (data.cod == 200) { // Check if the location is valid
            document.getElementById('locationname').textContent = data.name;
            document.getElementById('description').textContent = data.weather[0].description;
            document.getElementById('cloudCoverage').textContent = `${data.clouds.all}`;
            document.getElementById('temp').textContent = data.main.temp
            document.getElementById('humidity').textContent = data.main.humidity;
            document.getElementById('sunsetTime').textContent = new Date(
                (data.sys.sunset + data.timezone) * 1000
            ).toLocaleTimeString('en-US', {
                timeZone: 'UTC',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });            

            const weatherId = data.weather[0].id; // Extract weather ID
            updateStargazingConditions(weatherId); // Pass the weather ID to the update function
        } else {
            alert(`City not found: ${data.message}. Please enter a valid city name.`);
        }
    } catch (error) { // This is the catch block
        console.error("Error fetching data:", error);
        alert("Failed to retrieve weather data. Please try again later.");
    }
}
