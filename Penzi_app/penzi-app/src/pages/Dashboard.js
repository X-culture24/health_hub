import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Penzi Love ❤️</h2>
        <Link to="/profile" className="sidebar-link">
          Profile
        </Link>
        <Link to="/set-profile" className="sidebar-link">
          Set Profile
        </Link>
        <Link to="/complete-profile" className="sidebar-link">
          Complete Profile
        </Link>
        <Link to="/matches" className="sidebar-link">
          Matches
        </Link>
        <Link to="/edit-profile" className="sidebar-link">
          Edit Profile
        </Link>
        <Link to="/messages" className="sidebar-link">
          Messages
        </Link>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Welcome to Your Dashboard</h1>
        <p>Start exploring your matches today! ❤️</p>
      </div>
    </div>
  );
};

export default Dashboard;