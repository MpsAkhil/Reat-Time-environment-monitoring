import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Corelation from './pages/Corelationpage';
function App() {
    return (
        
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/corelation" element={<Corelation />} />
                </Routes>
            </Router>
       
    );
}

export default App;
