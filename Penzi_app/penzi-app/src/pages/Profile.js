import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userId]);

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  return (
    <div className="profile-container">
      <h1>Your Profile ❤️</h1>
      {user ? (
        <div className="profile-details">
          <h2>{user.name}</h2>
          <p>Age: {user.age}</p>
          <p>Gender: {user.gender}</p>
          <p>County: {user.county}</p>
          <p>Town: {user.town}</p>
          {user.details && (
            <div>
              <h3>Profile Details</h3>
              <p>Education: {user.details.level_of_education}</p>
              <p>Profession: {user.details.profession}</p>
              <p>Marital Status: {user.details.marital_status}</p>
              <p>Religion: {user.details.religion}</p>
              <p>Ethnicity: {user.details.ethnicity}</p>
            </div>
          )}
          {user.self_description && (
            <div>
              <h3>Self Description</h3>
              <p>{user.self_description.description}</p>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* Buttons */}
      <div className="profile-buttons">
        <Link to="/edit-profile" className="btn-primary">
          Edit Profile
        </Link>
        <button onClick={toggleDarkMode} className="btn-secondary">
          Toggle Dark Mode
        </button>
      </div>
    </div>
  );
};

export default Profile;