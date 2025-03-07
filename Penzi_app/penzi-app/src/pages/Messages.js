import React, { useState } from "react";
import Chat from "../components/Chat";
import "./Messages.css";

const Messages = () => {
  const [selectedMatch, setSelectedMatch] = useState({
    id: localStorage.getItem("chosen_match_id"),
    name: localStorage.getItem("chosen_match_name"),
  });

  // Example list of approved matches (you can fetch this from the backend)
  const approvedMatches = [
    { id: 1, name: "Lina Moraa" },
    { id: 2, name: "Dorine Gakii" },
    { id: 3, name: "Aisha Bahati" },
  ];

  return (
    <div className="messages-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Approved Matches ❤️</h2>
        <ul>
          {/* Display the chosen match */}
          {selectedMatch.id && (
            <li className="active">
              {selectedMatch.name}
            </li>
          )}
          {/* Display other approved matches */}
          {approvedMatches.map((match) => (
            <li
              key={match.id}
              className={selectedMatch?.id === match.id ? "active" : ""}
              onClick={() => setSelectedMatch(match)}
            >
              {match.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        {selectedMatch ? (
          <Chat matchId={selectedMatch.id} matchName={selectedMatch.name} />
        ) : (
          <p>Select a match to start chatting. 💬</p>
        )}
      </div>
    </div>
  );
};

export default Messages;