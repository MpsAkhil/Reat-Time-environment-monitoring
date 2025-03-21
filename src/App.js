import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Corelation from './pages/Corelationpage';
import Ranking from './pages/RankingPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/corelation" element={<Corelation />} />
                <Route path="/ranking" element={<Ranking />} />
            </Routes>
        </Router>
    );
}

export default App;
