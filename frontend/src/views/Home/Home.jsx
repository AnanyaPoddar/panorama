import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="page" id="home">
      <h1>Welcome to Panorama</h1>
      <h4>
        An all-inclusive collaboration tool that brings the advantages of
        technology to traditional whiteboarding.
      </h4>
      <Button variant="outlined" onClick={() => navigate("/signin")}>
        Get Started
      </Button>
    </div>
  );
};

export default Home;
