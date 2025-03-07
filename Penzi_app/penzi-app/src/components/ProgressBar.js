import React from "react";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";


const Dashboard = () => {
  const profileComplete = 70; // Example: 70% complete

  return (
    <div className="dashboard-container">
      <h1>Welcome to Penzi Love ❤️</h1>
      <p>Find your perfect match today!</p>
      <ProgressBar progress={profileComplete} />
      <p>Your profile is {profileComplete}% complete.</p>
      {profileComplete < 100 && (
        <Link to="/complete-profile" className="btn-primary">
          Complete Your Profile
        </Link>
      )}
      <div className="dashboard-buttons">
        <Link to="/matches" className="btn-secondary">
          View Matches
        </Link>
        <Link to="/profile" className="btn-secondary">
          Edit Profile
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
