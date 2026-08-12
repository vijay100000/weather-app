import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1&language=en&format=json`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results) {
        throw new Error("City not found");
      }

      const location = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
      );

      const data = await weatherResponse.json();

      setWeather({
        city: location.name,
        country: location.country,
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        code: data.current.weather_code,
      });
    } catch (error) {
      setError("City not found. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherText = (code) => {
    if (code === 0) return "☀️ Clear Sky";
    if ([1, 2, 3].includes(code)) return "🌤️ Cloudy";
    if ([45, 48].includes(code)) return "🌫️ Foggy";
    if ([51, 53, 55].includes(code)) return "🌦️ Drizzle";
    if ([61, 63, 65].includes(code)) return "🌧️ Rain";
    if ([71, 73, 75].includes(code)) return "❄️ Snow";
    if ([95, 96, 99].includes(code)) return "⛈️ Thunderstorm";

    return "🌍 Unknown";
  };

  return (
    <div className="app">
      <div className="weather-container">
        <h1>🌤️ Weather App</h1>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchWeather();
              }
            }}
          />

          <button onClick={searchWeather}>Search</button>
        </div>

        {loading && <p className="message">Loading weather...</p>}

        {error && <p className="error">{error}</p>}

        {weather && !loading && (
          <div className="weather-card">
            <h2>
              {weather.city}, {weather.country}
            </h2>

            <div className="temperature">
              {weather.temperature}°C
            </div>

            <p className="condition">
              {getWeatherText(weather.code)}
            </p>

            <div className="details">
              <div>
                <span>💧</span>
                <p>Humidity</p>
                <strong>{weather.humidity}%</strong>
              </div>

              <div>
                <span>💨</span>
                <p>Wind Speed</p>
                <strong>{weather.wind} km/h</strong>
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && !error && (
          <p className="message">
            Search for a city to see its weather.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;