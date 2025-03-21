// src/components/Gps.js
import React, { useState, useEffect } from "react";
import GaugeComponent from "./GaugeComponent";
import "./Gps.css"; // Import CSS file

const Gps = () => {
  const [weather, setWeather] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [city, setCity] = useState("");

  useEffect(() => {
    const fetchWeather = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `http://localhost:5000/weather?lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        setWeather(data);
        setCity(data.name);
        setTimestamp(new Date().toLocaleTimeString());
        console.log("Weather updated at:", new Date().toLocaleTimeString(), data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLat(latitude);
            setLon(longitude);
            fetchWeather(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    getLocation();
    const interval = setInterval(getLocation, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="weather-dashboard">
      <h1>Weather Dashboard</h1>
      {weather ? (
        <div>
          <h3>Last Updated: {timestamp}</h3>
          <h2>📍 {city}</h2>
          <p>Coordinates: {lat}, {lon}</p>

          <div className="gauges-container">
            {/* Temperature Gauge */}
            <div className="gauge-item">
              <h4>Temperature</h4>
              <GaugeComponent id="tempGauge" value={weather.main.temp} unit="°C" min={-10} max={50} />
              <p>{weather.main.temp} °C</p>
            </div>

            {/* Humidity Gauge */}
            <div className="gauge-item">
              <h4>Humidity</h4>
              <GaugeComponent id="humidityGauge" value={weather.main.humidity} unit="%" min={0} max={100} />
              <p>{weather.main.humidity} %</p>
            </div>

            {/* Wind Speed Gauge */}
            <div className="gauge-item">
              <h4>Wind Speed</h4>
              <GaugeComponent id="windGauge" value={weather.wind.speed} unit="m/s" min={0} max={20} />
              <p>{weather.wind.speed} m/s</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="loading-message">Loading weather data...</p>
      )}
    </div>
  );
};

export default Gps;