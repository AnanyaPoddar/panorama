import { Button, TextField } from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import "../Form.css";
import linkedinButton from "../../assets/linkedin-button.png";

function Login() {
  const { user, setUser } = useContext(AuthContext);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setSubmit] = useState(false);

  const [username, setUsername] = useState("");

  const [pass, setPass] = useState("");

  const handleSubmit = e => {
    //Prevent page reload
    e.preventDefault();
    const creds = { username: username, password: pass };

    // Fetch call to sign user in
    fetch(`https://panoramas.social:5000/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(creds)
    })
      .then(response => response.json())
      //TODO: Possibly check status is ok before rendering
      .then(json => {
        setUser({ id: json._id, name: json.username });
      })
      .catch(error => {
        console.error("Error:", error);
      });
  };

  const renderErrorMessage = message => <div className="error">{message}</div>;

  // JSX code for login form
  const renderForm = (
    <div>
      <form onSubmit={handleSubmit} className="form">
        <TextField
          variant="standard"
          placeholder="Enter username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <TextField
          variant="standard"
          type="password"
          placeholder="Enter password"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
        <Button variant="outlined" type="submit">
          Log In
        </Button>
      </form>
    </div>
  );

  return (
    <div>
      <form onSubmit={handleSubmit} className="form">
        <TextField
          variant="standard"
          placeholder="Enter username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <br />
        <TextField
          variant="standard"
          type="password"
          placeholder="Enter password"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
        <br />
        <Button variant="outlined" type="submit">
          Log In
        </Button>
        <br />
        <a href="https://panoramas.social:5000/api/linkedin/auth">
          <img className="linkedinButton" src={linkedinButton} />
        </a>
      </form>
    </div>
  );
}

export default Login;
