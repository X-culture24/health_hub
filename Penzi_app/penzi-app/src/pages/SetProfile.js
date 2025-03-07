import React from "react";
import ProgressBar from "../components/ProgressBar";
import { Link } from "react-router-dom";
import "./SetProfile.css";

const SetProfile = () => {
  const profileComplete = 30; // Example: 30% complete

  return (
    <div className="set-profile-container">
      <h2>Complete Your Profile</h2>
      <ProgressBar progress={profileComplete} />
      <p>Your profile is {profileComplete}% complete.</p>
      <Link to="/complete-profile" className="btn-primary">
        Complete Profile
      </Link>
    </div>
  );
};

export default SetProfile;
