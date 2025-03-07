import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const isAuthenticated = !!localStorage.getItem("user_id");

  return (
    <div className="home-container">
      <h1>Welcome to Penzi Love ❤️</h1>
      <p>Find your perfect match today!</p>
      {isAuthenticated ? (
        <Link to="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      ) : (
        <div>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn-secondary">
            Register
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;