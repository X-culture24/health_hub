import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CompleteProfile.css";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    user_id: localStorage.getItem("user_id"),
    level_of_education: "",
    profession: "",
    marital_status: "",
    religion: "",
    ethnicity: "",
  });
  const [description, setDescription] = useState("");

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send user details
      await axios.post("http://localhost:5000/details", profileData);
      // Send self-description
      await axios.post("http://localhost:5000/describe", {
        user_id: profileData.user_id,
        description: description,
      });
      console.log("Profile completed successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing profile:", error);
    }
  };

  return (
    <div className="profile-container">
      <h2>Complete Your Profile ❤️</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="level_of_education" placeholder="Education Level" onChange={handleChange} required />
        <input type="text" name="profession" placeholder="Profession" onChange={handleChange} required />
        <select name="marital_status" onChange={handleChange} required>
          <option value="">Marital Status</option>
          <option value="Single">Single</option>
          <option value="Divorced">Divorced</option>
        </select>
        <input type="text" name="religion" placeholder="Religion" onChange={handleChange} required />
        <input type="text" name="ethnicity" placeholder="Ethnicity" onChange={handleChange} required />
        <textarea name="description" placeholder="Describe Yourself" onChange={(e) => setDescription(e.target.value)} required></textarea>
        <button type="submit" className="btn-primary">Save Profile</button>
      </form>
    </div>
  );
};

export default CompleteProfile;