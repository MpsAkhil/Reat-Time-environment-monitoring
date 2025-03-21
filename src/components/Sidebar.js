// src/components/Sidebar.js
import React from 'react';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="text">
        <i className="fas fa-bars"></i>Menu
      </div>
      <ul>
        <li><a href="#">🏆 Ranking</a></li>
        <li><a href="#">📈 Trend Analysis</a></li>
        <li><a href="#">📊 Visualization</a></li>
        <li><a href="#">📍 Monitor Multiple Locations</a></li>
        <li><a href="#">🚨 Alert Management</a></li>
        <li><a href="#">🔔 Notifications</a></li>
        <li><a href="#">💬 Feedback</a></li>
      </ul>
    </div>
  );
}

export default Sidebar;