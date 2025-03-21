import React, { useState } from "react";
import axios from "axios";
import "./ranking.css";

const API_URL = "http://127.0.0.1:5000";

const RankingList = ({ rankings }) => {
  // Sort rankings by rank before rendering
  const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="ranking-list">
      {sortedRankings.map((city, index) => (
        <div key={index} className="ranking-card">
          <div className="card-content">
            <span className="city-info">
              {city.rank}. {city.city} - <strong>{city.score.toFixed(2)}</strong>
            </span>
          </div>
          <div className="card-tooltip">
            <p><strong>Temperature:</strong> {city.temperature}°C</p>
            <p><strong>Pressure:</strong> {city.pressure} hPa</p>
            <p><strong>Precipitation:</strong> {city.precipitation} mm</p>
            <p><strong>Humidity:</strong> {city.humidity}%</p>
            <p><strong>Wind Speed:</strong> {city.wind_speed} m/s</p>
            <p><strong>Cloudiness:</strong> {city.cloudiness}%</p>
          </div>
        </div>
      ))}
    </div>
  );
};

function Ranking() {
  const [defaultRankings, setDefaultRankings] = useState([]);
  const [customRankings, setCustomRankings] = useState([]);
  const [cities, setCities] = useState("");

  const fetchDefaultRankings = async () => {
    try {
      const response = await axios.get(`${API_URL}/rankings/default`);
      setDefaultRankings(response.data);
    } catch (error) {
      console.error("Error fetching default rankings", error);
    }
  };

  const fetchCustomRankings = async () => {
    try {
      const selectedCities = cities.split(",").map(city => city.trim()).filter(city => city);
      const response = await axios.post(`${API_URL}/rankings/custom`, { cities: selectedCities });
      setCustomRankings(response.data);
    } catch (error) {
      console.error("Error fetching custom rankings", error);
    }
  };

  return (
    <div className="ranking-page">
      <header>
        <h1>City Weather Rankings</h1>
      </header>
      <main>
        <section className="section default-section">
          <button className="btn" onClick={fetchDefaultRankings}>Get Default Rankings</button>
          {defaultRankings.length > 0 && (
            <div className="ranking-container">
              <h2>Default City Rankings</h2>
              <RankingList rankings={defaultRankings} />
            </div>
          )}
        </section>

        <section className="section custom-section">
          <div className="custom-input">
            <input
              type="text"
              placeholder="Enter cities (comma separated)"
              value={cities}
              onChange={(e) => setCities(e.target.value)}
            />
            <button className="btn" onClick={fetchCustomRankings}>Get Custom Rankings</button>
          </div>
          {customRankings.length > 0 && (
            <div className="ranking-container">
              <h2>Custom City Rankings</h2>
              <RankingList rankings={customRankings} />
            </div>
          )}
        </section>
      </main>
      <footer>
        <p>Data from OpenWeather API</p>
      </footer>
    </div>
  );
}

export default Ranking;