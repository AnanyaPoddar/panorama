import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="page" id="home">
      <h1 id="title">Welcome to Panorama</h1>
      <h3>
        An all-inclusive collaboration tool to level up your whiteboarding
        sessions.
      </h3>
      <Button variant="outlined" onClick={() => navigate("/signin")}>
        Get Started
      </Button>
    </div>
  );
};

export default Home;
