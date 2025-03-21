import React, { useState } from "react";
import axios from "axios";
import "./ImageClassify.css";

function ImageClassify() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPrediction("");
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    console.log("📤 Uploading image...");

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Response received:", response.data);
      
      if (response.data.prediction) {
        setPrediction(response.data.prediction);
        setError("");
      } else {
        setError("Unexpected response format.");
      }
    } catch (error) {
      console.error("❌ Error sending request:", error);
      setError("Error uploading image. Check console for details.");
    }
  };

  return (
    <div className="ImageClassify">
      <h1>Weather Image Recognition</h1>
      <div className="upload-container">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="Preview" className="preview" />}
        <button onClick={handleUpload} className="upload-btn">Predict Weather</button>
      </div>
      {prediction && <div className="result">Predicted Weather: <strong>{prediction}</strong></div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default ImageClassify;
