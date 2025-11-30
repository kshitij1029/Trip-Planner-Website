
let body = document.querySelector("body");
let content = document.querySelector("#content-4");
let form = document.querySelector("#forming");
let cancel = document.getElementById("cancel");
const descResults=document.getElementById("text1");

form.addEventListener("submit",(event)=>{
    event.preventDefault();
    let popup = document.getElementById("popup");
    popup.style.display="block";
    content.style.filter="blur(5px)";
});
cancel.addEventListener("click",()=>{
    popup.style.display="none";
    content.style.filter="none";
});

// --- 1. SETUP ELEMENTS ---
const addressInput = document.getElementById("askplace");
const searchBtn = document.getElementById("submitplace");
const addressResults = document.getElementById("locationinfo");
const weatherResults= document.getElementById("weatherinfo");
const imageResults=document.getElementById("apiImage");
const loc = document.querySelector("#location");



// --- 2. INITIALIZE MAP (Fix: Do this immediately with default coords) ---
// We start at a default location (e.g., London 51.5, -0.09) so the map isn't empty.
const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Variable to store the marker so we can remove it later
let currentMarker = null;

// --- 3. EVENT LISTENER ---
let address = "london";
getCoordinates(address);

searchBtn.addEventListener("click", () => {
    address = addressInput.value;
    if (address) {
        getCoordinates(address);
        
    } else {
        alert("Please enter an address.");
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {     // Check if Enter key is pressed
       searchBtn.click();   // Trigger the button click
    }
});
// --- 4. FETCH FUNCTION ---
async function getCoordinates(address) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.length > 0) {
            displayCoordinates(data);
        } else {
            addressResults.innerHTML = "<p style='color:red'>Location not found.</p>";
        }
    } catch (error) {
        addressResults.innerHTML = `<p style='color:red'>${error.message}</p>`;
    }
}

// --- 5. DISPLAY & UPDATE MAP FUNCTION ---
async function displayCoordinates(data) {
    addressResults.innerHTML = "";
    weatherResults.innerHTML="";

    //for latitude , longitude
    const place = data[0];
    const lat = parseFloat(place.lat); // Convert string to number
    const lon = parseFloat(place.lon);
    const actualAddress = place.display_name;

    //for weather
    getWeather(lat,lon);
    
    //for Photo
    getImage(actualAddress);

    //for description
    getDescription(actualAddress);

    // A. Update Text
    const addressHTML = `
        <p><strong>Latitude:</strong> ${lat} </p>
        <p><strong>Longitude:</strong> ${lon} </p>
        <p><strong>Address:</strong> ${actualAddress} </p>
    `;
    addressResults.innerHTML = addressHTML;

    // B. Update Map (The Fix!)
    // 1. Move the camera to the new location
    map.setView([lat, lon], 13);

    // 2. Remove previous marker if it exists
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // 3. Add new marker
    currentMarker = L.marker([lat, lon]).addTo(map);
}

async function getWeather(lat,lon){
        // const apiUrl=https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric;
        const apiKey='1d8c9adaa8467953df3e18ab04fa1f0d';
       const apiUrl=` https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    try{
        weatherResults.innerHTML=`<p>Fetching weather data...</p>`;
        const response = await fetch(apiUrl);
        if(!response.ok){
            throw new Error('City Not found. Please check the spelling.');
        }
        const data = await response.json();
        displayWeather(data);
    }
    catch(error){
        weatherResults.innerHTML = `<p class="error-message">${error.message}</p>`;
    }    
}
function displayWeather(data){

        //clearing the innerHTML first
        weatherResults.innerHTML='';

        const cityName=data.name;
        const iconCode = data.weather[0].icon;
        const country=data.sys.country;
        const temperature=data.main.temp;
        const feelsLike=data.main.feels_like;
        const description= data.weather[0].description;
        const humidity=data.main.humidity;
        const windSpeed= data.wind.speed;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        //create html content
        const weatherHTML=`
        <div>
        <div id="temp"><img src="${iconUrl}" alt="weather icon">
        <h4 style="margin:0; display:inline; color: rgb(70, 44, 32);"> ${temperature.toFixed(1)}°C</h4></div>
        <p style="color: rgb(70, 44, 32);"><strong>${description.charAt(0).toUpperCase() + description.slice(1)}</strong></p>
        </div>
        
        <div class="vertical1"  style="margin-top:3px;"><p><strong>Humidity</strong><i class="fa-solid fa-droplet"style="font-size:17.5px;"></i> 
        <br>
         ${humidity}%</p>
        <p><strong>Wind Speed</strong> <i class="fa-solid fa-wind" style="color:black;"></i>
        <br>
        ${windSpeed.toFixed(1)} m/s</p></div>
        `;

        //insert created html into dom
        weatherResults.innerHTML=weatherHTML;
        
}

async function getImage(actualAddress) {
    const unsplashKey = "U0uXSt68ZS8fjwxqYOEwFkpHy98lCnOkas_1pPlSpfg";
    const cleanQuery = actualAddress.split(',')[0];
    // Request 15 images instead of default 10 for a better scroll effect
    const apiUrl = `https://api.unsplash.com/search/photos?per_page=15&query=${encodeURIComponent(cleanQuery)}&client_id=${unsplashKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.results.length > 0) {
            // 1. Setup references to the first image data
            const firstPhoto = data.results[0];
            const firstImageFullUrl = firstPhoto.urls.regular;
            const photographerName = firstPhoto.user.name;

            // 2. Build the Basic HTML Structure (Main Image + Thumbnail Container)
            imageResults.innerHTML = `
                <div class="gallery-wrapper">
                    <img id="main-image-display" src="${firstImageFullUrl}" alt="mountains">
                    <div class="thumbnail-nav-container">
                        <div class="nav-arrow" id="scroll-left">&#10094;</div>
                         <div class="thumbnail-scroll-container" id="thumb-container">
                            </div>
                        
                        <div class="nav-arrow" id="scroll-right">&#10095;</div> 
                        </div>
                </div>
            `;

            // 3. Get references to the elements we just created in the DOM
            const mainImage = document.getElementById('main-image-display');
            const thumbContainer = document.getElementById('thumb-container');
            const scrollLeftBtn = document.getElementById('scroll-left');
            const scrollRightBtn = document.getElementById('scroll-right');

            // 4. Loop through ALL results to create thumbnail images
            data.results.forEach((photo, index) => {
                const thumb = document.createElement('img');
                thumb.src = photo.urls.small; // Use smaller image for thumbnails so they load fast
                thumb.classList.add('thumb-img');
                
                // Set the first thumbnail as active initially
                if (index === 0) thumb.classList.add('active-thumb');

                // --- CLICK EVENT FOR THUMBNAIL ---
                thumb.addEventListener('click', function() {
                    // a. Update Main Image source
                    mainImage.style.opacity = 0; // Quick fade effect
                    setTimeout(() => {
                        mainImage.src = photo.urls.regular;
                        mainImage.style.opacity = 1;
                    }, 200);

                    // b. Update active class styling
                    document.querySelectorAll('.thumb-img').forEach(img => img.classList.remove('active-thumb'));
                    this.classList.add('active-thumb');
                });

                // Add thumb to the container
                thumbContainer.appendChild(thumb);
            });

            // 5. --- SCROLL ARROW EVENTS ---
            // Scroll 300px left or right when arrows are clicked
            scrollLeftBtn.addEventListener('click', () => {
                thumbContainer.scrollBy({ left: -300, behavior: 'smooth' });
            });

            scrollRightBtn.addEventListener('click', () => {
                thumbContainer.scrollBy({ left: 300, behavior: 'smooth' });
            });


        } else {
            imageResults.innerHTML = "<p>No images found for this location.</p>";
        }
    } catch (error) {
        console.error(error);
        imageResults.innerHTML = "Error loading gallery.";
    }
}



async function getDescription(actualAddress){
    descResults.innerHTML="Fetching details....";
    const cleanQuery = actualAddress.split(',')[0];
    try{
        descResults.innerHTML="";
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`);
        const data= await response.json();

        if(!response.ok){
            throw new Error("Network gone wrong");
        }
        const desc= data.extract;

        const descHTML=`<p>${desc}</p>`;

        descResults.innerHTML= descHTML;

    }
    catch(error){
        descResults.innerHTML=`<p>${error.message}</p>`;
    }
}