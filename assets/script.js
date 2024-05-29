document.addEventListener("DOMContentLoaded", async function () {
    const weatherElement = document.getElementById('weather-display');
    const newsList = document.getElementById('news-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const weatherResults = document.getElementById('weatherResults');

    const weatherApiKey = '8b5197e33de4d2ab503208b076814a9e';
    const newsApiKey = '92eAk2h5NotfAJuwLDQj83mQJ7bAcpCK';

    // Function to fetch news articles
    async function fetchNewsArticles(searchKeyword) {
        const newsApiUrl = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${searchKeyword}&api-key=${newsApiKey}`;
        try {
            const response = await fetch(newsApiUrl);
            const data = await response.json();
            return data.response.docs; // assuming 'articles' is an array in 'response'
        } catch (error) {
            console.error('Error fetching news:', error);
            newsList.innerHTML = '<p>Error fetching news</p>';
            return [];
        }
    }

    // Function to render articles in the list
    function renderArticles(articles) {
        const newsList = document.getElementById('news-list'); // Get the news list div
        newsList.innerHTML = ''; // Clear previous content

        articles.forEach((article) => {
            const articleElement = document.createElement('div');
            articleElement.classList.add('article');

            const titleElement = document.createElement('h2');
            titleElement.textContent = article.headline.main;

            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = article.abstract;

            const sourceElement = document.createElement('p');
            sourceElement.textContent = `Source: ${article.source}`;

            const imageElement = document.createElement('img');
            imageElement.alt = "Article Image"; // Add alt text for accessibility

            // Check if the article has an image
            if (article.multimedia && article.multimedia.length > 0) {
                // Get the URL of the first image
                const imageUrl = `https://www.nytimes.com/${article.multimedia[0].url}`;
                imageElement.src = imageUrl;
            } else {
                // If there's no image, leave the blank
                imageElement.src = '';
            }

            const linkElement = document.createElement('a');
            linkElement.textContent = 'Read more';
            linkElement.href = article.web_url;
            linkElement.target = '_blank';

            articleElement.appendChild(titleElement);
            articleElement.appendChild(descriptionElement);
            articleElement.appendChild(sourceElement);
            articleElement.appendChild(imageElement);
            articleElement.appendChild(linkElement);

            newsList.appendChild(articleElement);
        });
    }

    // Function to handle search button click
    async function handleSearchButtonClick() {
        const searchKeyword = searchInput.value.trim();
        if (searchKeyword !== '') {
            const articles = await fetchNewsArticles(searchKeyword);
            renderArticles(articles);
        }
    }

    // Function to handle weather display based on user's location
    function displayWeatherByLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    updateWeather(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    weatherResults.innerHTML = '<p>Geolocation denied for Weather info</p>';
                }
            );
        } else {
            weatherResults.innerHTML = '<p>Geolocation is not supported by this browser</p>';
        }
    }

    // Function to update weather data
    async function updateWeather(latitude, longitude) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`);
            
            if (!response.ok) {
                throw new Error('Weather data not found');
            }
    
            const data = await response.json();
    
            // Extract relevant weather information from the response
            var currentIcon = document.createElement('img');
            currentIcon.src = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
            document.getElementById('weather-description').appendChild(currentIcon);
           
            var currentDescription = document.createElement("p");
            currentDescription.textContent = data.weather[0].description
            document.getElementById('weather-description').appendChild(currentDescription);
   
            document.getElementById('temperature').textContent = `Temperature: ${data.main.temp} °C Humidity: ${data.main.humidity} %`;
            document.getElementById('location').textContent = `Location: ${data.name}, ${data.sys.country}`;
        } catch (error) {
            console.error('Error fetching weather:', error);
            weatherResults.innerHTML = '<p>Error fetching weather</p>';
        }
    }

    // Load some default articles when the page loads
    const defaultArticles = await fetchNewsArticles("tech"); // You can use any default keyword
    renderArticles(defaultArticles);

    // Event listeners
    searchButton.addEventListener('click', handleSearchButtonClick);
    displayWeatherByLocation();
});
