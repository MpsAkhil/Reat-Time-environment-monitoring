import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Corelation from './pages/Corelationpage';
import Ranking from './pages/RankingPage';
import Image from './pages/imageclassifier';
import Mapping from './pages/Map';
import Forecasting from './pages/Forecast';
import Trend from './pages/Trendanalysis';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/corelation" element={<Corelation />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/mapping" element={<Mapping />} />
                <Route path="/image" element={<Image />} />
                <Route path="/forecast" element={<Forecasting />} />
                <Route path="/trend" element={<Trend />} />
            </Routes>
        </Router>
    );
}

export default App;
