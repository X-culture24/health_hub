import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./MatchDetails.css";

const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matchDetails, setMatchDetails] = useState(null);
  const [moreDetails, setMoreDetails] = useState(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/${id}`);
        setMatchDetails(response.data);
      } catch (error) {
        console.error("Error fetching match details:", error);
      }
    };
    fetchMatchDetails();
  }, [id]);

  const handleRequestMoreDetails = async () => {
    try {
      const response = await axios.post("http://localhost:5000/describe_match", {
        matched_user_id: id,
      });
      setMoreDetails(response.data.description);
    } catch (error) {
      console.error("Error requesting more details:", error);
    }
  };

  const handleGoToMessages = () => {
    // Save the chosen match's name and ID in localStorage
    localStorage.setItem("chosen_match_id", id);
    localStorage.setItem("chosen_match_name", matchDetails.name);
    navigate("/messages");
  };

  return (
    <div className="match-details-container">
      <h1>Match Details ❤️</h1>
      {matchDetails ? (
        <div>
          <p>Name: {matchDetails.name}</p>
          <p>Age: {matchDetails.age}</p>
          <p>Gender: {matchDetails.gender}</p>
          <p>Town: {matchDetails.town}</p>
          {moreDetails && (
            <div>
              <h3>More Details</h3>
              <p>Profession: {matchDetails.details?.profession}</p>
              <p>Education: {matchDetails.details?.level_of_education}</p>
              <p>Description: {moreDetails}</p>
            </div>
          )}
          <button onClick={handleRequestMoreDetails} className="btn-primary">
            Request More Details
          </button>
          <button onClick={handleGoToMessages} className="btn-primary">
            Send Message
          </button>
          <button onClick={() => navigate("/matches")} className="btn-secondary">
            Request More Matches
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <button onClick={() => navigate(-1)} className="btn-secondary">
        Back
      </button>
    </div>
  );
};

export default MatchDetails;