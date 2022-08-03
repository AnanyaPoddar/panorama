import { Button, TextField } from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import "../../components/Form.css";
import errorIcon from "../../assets/exclamation-mark.png";
import linkedinButton from "../../assets/linkedin-button.png";
import validator from "validator";
import "../Signup/Signup.css";

function Login() {
  const { user, setUser } = useContext(AuthContext);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isSubmitted, setSubmit] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = e => {
    //Prevent page reload
    e.preventDefault();

    if (!validator.isEmail(email)) {
      setErrorMessage("Enter a valid email");
      return;
    }
    if (pass === "") {
      setErrorMessage("Missing password");
      return;
    }
    const creds = { identity: email.toLowerCase().trim(), password: pass };

    // Fetch call to sign user in
    fetch(`https://api.panoramas.social/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(creds)
    })
      .then(response => {
        if (response.status == 401) {
          setErrorMessage("Invalid credentials");
        } else if (response.status === 403) {
          setErrorMessage("Email not verified");
        } else {
          return response.json();
        }
      })
      //TODO: Possibly check status is ok before rendering
      .then(json => {
        if (json) {
          setUser({ email: json.email });
          navigate("/lobby");
        }
      })
      .catch(error => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="inner">
      <div className="page-heading"> Welcome back! </div>
      <div className="page-heading">Log in to get started. </div>
      <form onSubmit={handleSubmit} className="form">
        <br />
        {errorMessage && (
          <p className="error">
            {" "}
            <img className="errorIcon" src={errorIcon}></img> {errorMessage}{" "}
          </p>
        )}

        <TextField
          variant="standard"
          placeholder="Enter email"
          value={email}
          inputProps={{ style: { fontSize: 20, fontFamily: "Avenir" } }}
          onChange={e => setEmail(e.target.value.trim())}
        />
        <br />
        <TextField
          variant="standard"
          type="password"
          placeholder="Enter password"
          value={pass}
          inputProps={{ style: { fontSize: 20, fontFamily: "Avenir" } }}
          onChange={e => setPass(e.target.value)}
        />
        <br />
        <Button variant="outlined" type="submit">
          Log In
        </Button>
        <br />
        <a href="https://api.panoramas.social/api/linkedin/auth">
          <img alt="linkedin" className="linkedinButton" src={linkedinButton} />
        </a>
      </form>
    </div>
  );
}

export default Login;
