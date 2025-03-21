from flask import Flask, request, jsonify
import requests
import pandas as pd
from flask_cors import CORS
from geopy.geocoders import Nominatim

app = Flask(__name__)
CORS(app)

# OpenWeather API Key
API_KEY = "7eeba6a8fe29e05163a9d8011bffcba3"

# Open-Meteo API (Free historical weather data)
WEATHER_API_URL = "https://archive-api.open-meteo.com/v1/archive"

# Define a fixed date range for historical data
START_DATE = "2024-03-10"
END_DATE = "2024-03-19"

# Default cities for rankings
DEFAULT_CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"]

# Geocoder for fetching latitude and longitude
geolocator = Nominatim(user_agent="weather_correlation_app", timeout=15)

# ----------------------------- Helper Functions -----------------------------

def fetch_current_weather(lat, lon):
    """Fetch current weather data from OpenWeather API using latitude and longitude."""
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None

def fetch_weather(city):
    """Fetch current weather data from OpenWeather API for a city."""
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        weather = {
            "city": city,
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "wind_speed": data["wind"]["speed"] if "wind" in data else 0,
            "cloudiness": data["clouds"]["all"] if "clouds" in data else 0,
            "precipitation": data["rain"]["1h"] if "rain" in data and "1h" in data["rain"] else 0
        }
        return weather
    return None

def rank_cities(cities):
    """Fetch weather data for each city, normalize parameters, and calculate a weighted score."""
    city_data = [fetch_weather(city) for city in cities]
    city_data = [c for c in city_data if c]  # Remove cities that returned no data
    if not city_data:
        return []

    # Weights for each parameter
    weights = {
        "temperature": 0.25,   # higher temperature is better
        "pressure": 0.10,      # higher pressure is considered better
        "precipitation": 0.25, # lower precipitation is better
        "humidity": 0.15,      # lower humidity is better
        "wind_speed": 0.15,    # lower wind speed is better
        "cloudiness": 0.10,    # lower cloudiness is better
    }

    # Normalize positive parameters: temperature and pressure (higher is better)
    for key in ["temperature", "pressure"]:
        values = [c[key] for c in city_data]
        min_val, max_val = min(values), max(values)
        for c in city_data:
            c[f"norm_{key}"] = (c[key] - min_val) / (max_val - min_val) if max_val > min_val else 1

    # Normalize negative parameters: precipitation, humidity, wind_speed, cloudiness (lower is better)
    for key in ["precipitation", "humidity", "wind_speed", "cloudiness"]:
        values = [c[key] for c in city_data]
        min_val, max_val = min(values), max(values)
        for c in city_data:
            c[f"norm_{key}"] = (max_val - c[key]) / (max_val - min_val) if max_val > min_val else 1

    # Compute weighted score
    for c in city_data:
        score = 0
        for key, weight in weights.items():
            score += weight * c[f"norm_{key}"]
        c["score"] = score

    # Sort by score (highest first) and add ranking
    city_data.sort(key=lambda x: x["score"], reverse=True)
    return [{"rank": idx + 1, **city} for idx, city in enumerate(city_data)]

def get_coordinates(city):
    """Fetch latitude & longitude of a city using geopy (Nominatim)."""
    try:
        location = geolocator.geocode(city, exactly_one=True)
        if location:
            print(f"✅ {city}: Latitude={location.latitude}, Longitude={location.longitude}")
            return location.latitude, location.longitude
        else:
            print(f"❌ No results found for {city}")
            return None, None
    except Exception as e:
        print(f"⚠ Geocoding error for {city}: {e}")
        return None, None

def fetch_historical_weather(city):
    """Fetch historical weather data for a city."""
    lat, lon = get_coordinates(city)
    if lat is None or lon is None:
        return None

    print(f"✅ {city}: Latitude={lat}, Longitude={lon}")

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": START_DATE,
        "end_date": END_DATE,
        "daily": [
            "temperature_2m_max", "temperature_2m_min", "precipitation_sum",
            "relative_humidity_2m_mean", "windspeed_10m_max"
        ],  # Removed "pressure" (not available in Open-Meteo)
        "timezone": "Asia/Kolkata"
    }

    response = requests.get(WEATHER_API_URL, params=params)

    if response.status_code != 200:
        print(f"❌ Failed to fetch weather data for {city}: {response.text}")
        return None

    weather_data = response.json()
    if "daily" not in weather_data:
        print(f"❌ No daily weather data found for {city}")
        return None

    print(f"🌤 Weather data received for {city}")

    daily = weather_data["daily"]
    df = pd.DataFrame({
        "date": daily["time"],
        "temperature": [(max_t + min_t) / 2 for max_t, min_t in zip(daily["temperature_2m_max"], daily["temperature_2m_min"])],
        "precipitation": daily["precipitation_sum"],
        "humidity": daily["relative_humidity_2m_mean"],
        "windspeed": daily["windspeed_10m_max"]
    })

    return df

# ----------------------------- Endpoints -----------------------------

@app.route("/weather", methods=["GET"])
def get_weather():
    """Endpoint to fetch current weather data using latitude and longitude."""
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if not lat or not lon:
        return jsonify({"error": "Missing latitude or longitude"}), 400

    weather_data = fetch_current_weather(lat, lon)
    if weather_data:
        return jsonify(weather_data)
    else:
        return jsonify({"error": "Failed to fetch weather data"}), 500

@app.route("/rankings/default", methods=["GET"])
def get_default_rankings():
    """Endpoint to fetch rankings for default cities."""
    rankings = rank_cities(DEFAULT_CITIES)
    return jsonify(rankings)

@app.route("/rankings/custom", methods=["POST"])
def get_custom_rankings():
    """Endpoint to fetch rankings for custom cities."""
    data = request.json
    selected_cities = data.get("cities", [])
    if not selected_cities:
        return jsonify({"error": "No cities provided"}), 400
    rankings = rank_cities(selected_cities)
    return jsonify(rankings)

@app.route('/correlation', methods=['POST'])
def get_correlation():
    """Endpoint to compute correlation between weather attributes for two cities."""
    print("🔍 Received request at /correlation")
    
    data = request.json
    city1, city2, attribute = data.get("city1"), data.get("city2"), data.get("attribute")

    print(f"📌 Data received: city1={city1}, city2={city2}, attribute={attribute}")

    if not city1 or not city2 or not attribute:
        return jsonify({"error": "Missing required parameters"}), 400

    df1 = fetch_historical_weather(city1)
    df2 = fetch_historical_weather(city2)

    if df1 is None or df2 is None:
        return jsonify({"error": "One or both cities not found!"}), 404

    if attribute not in df1.columns or attribute not in df2.columns:
        return jsonify({"error": "Invalid attribute"}), 400

    df = pd.merge(df1, df2, on="date", suffixes=(f"{city1}", f"{city2}"))

    if df.empty:
        return jsonify({"error": "No common data available"}), 404

    print("📊 Weather Data:")
    print(df)

    correlation = df[f"{attribute}{city1}"].corr(df[f"{attribute}{city2}"])
    
    print(f"📈 Correlation between {city1} and {city2} ({attribute}): {correlation}")

    return jsonify({
        "city1": city1,
        "city2": city2,
        "attribute": attribute,
        "correlation": round(correlation, 2)
    })

# ----------------------------- Main -----------------------------

if __name__ == "__main__":
    app.run(debug=True)