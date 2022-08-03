import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import video from "../../assets/bgvid.mp4";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="page" id="home">
      <div id="bgvid">
        <video autoPlay muted>
          <source src={video} type="video/mp4" />
        </video>
      </div>
      <h1 id="title">
        Welcome to <span className="emphasis">Panorama</span>
      </h1>
      <h3 id="slogan">
        An collaboration tool to level up your whiteboarding sessions.
      </h3>
      <br />
      <br />
      <Button
        className="action-btn"
        variant="contained"
        size="large"
        onClick={() => navigate("/signin")}
      >
        Get Started
      </Button>
    </div>
  );
};

export default Home;
