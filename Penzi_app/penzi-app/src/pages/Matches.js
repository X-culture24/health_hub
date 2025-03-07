import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Matches.css";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [remainingMatches, setRemainingMatches] = useState(0);
  const [showMatches, setShowMatches] = useState(false);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  const loveQuotes = [
    "Love is not just a feeling; it's a choice. ❤️",
    "You are the missing piece to my puzzle. 🧩❤️",
    "In your smile, I find my happiness. 😊❤️",
    "Love is the bridge between two hearts. 🌉❤️",
    "You are my today and all of my tomorrows. 🌅❤️",
  ];

  const randomQuote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];

  useEffect(() => {
    const typeWriter = () => {
      const message = "Welcome to Penzi! To find a match for you, tap the Request Match button below. ❤️";
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < message.length) {
          setText((prev) => prev + message[i]);
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, 50); // Adjust typing speed here
    };

    typeWriter();
  }, []);

  const handleRequestMatches = async () => {
    try {
      const response = await axios.post("http://localhost:5000/match-request", {
        user_id: userId,
        age_range: "23-30", // Example age range (can be dynamic)
        town: "Nairobi", // Example town (can be dynamic)
      });
      setMatches(response.data.matches);
      setRemainingMatches(response.data.remaining_matches);
      setShowMatches(true);
    } catch (error) {
      console.error("Error requesting matches:", error);
    }
  };

  const handleRequestMoreMatches = async () => {
    try {
      const response = await axios.post("http://localhost:5000/match-request", {
        user_id: userId,
        age_range: "23-30", // Example age range (can be dynamic)
        town: "Nairobi", // Example town (can be dynamic)
      });
      setMatches(response.data.matches);
      setRemainingMatches(response.data.remaining_matches);
    } catch (error) {
      console.error("Error requesting more matches:", error);
    }
  };

  const handleRequestDetails = (matchedUserId) => {
    navigate(`/match-details/${matchedUserId}`);
  };

  return (
    <div className="matches-container">
      <h1>Find Your Match ❤️</h1>
      <div className="typewriter">
        <p>{text}</p>
        {!isTyping && <p className="love-quote">{randomQuote}</p>}
      </div>
      <button onClick={handleRequestMatches} className="btn-primary">
        Request Matches
      </button>

      {showMatches && (
        <div className="matches-list">
          <h2>Your Matches ❤️</h2>
          {matches.length > 0 ? (
            <ul>
              {matches.map((match) => (
                <li key={match.id}>
                  {match.name}
                  <button
                    onClick={() => handleRequestDetails(match.id)}
                    className="btn-secondary"
                  >
                    Request Details
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No matches found. Try again later. ❤️</p>
          )}
          {remainingMatches > 0 && (
            <button onClick={handleRequestMoreMatches} className="btn-primary">
              Request More Matches
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Matches;