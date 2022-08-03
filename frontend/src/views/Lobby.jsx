import { useContext, useState, useEffect } from "react";
import { ToggleButtonGroup, ToggleButton, Button, Box } from "@mui/material";
import { AuthContext } from "../context/AuthProvider";

import JoinRoom from "../components/JoinRoom/JoinRoom";
import CreateRoom from "../components/CreateRoom/CreateRoom";
import Login from "../components/Login/Login";
import Signup from "../components/Signup/Signup";
import "./Lobby.css";

const Lobby = () => {
  const { user, setUser } = useContext(AuthContext);

  //set default type to join room, instead of creating a room
  const [type, setType] = useState("join");
  const [loginType, setLoginType] = useState("signup");

  const [inRoom, setInRoom] = useState(false);

  const changeRoom = val => {
    setInRoom(val);
  };

  // check if the user has authenticated through linkedin
  useEffect(() => {
    if (!user) {
      fetch(`https://api.panoramas.social/api/linkedin/auth/success`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true
        }
      })
        .then(response => {
          if (response.status === 200) return response.json();
          throw new Error("authentication has been failed!");
        })
        .then(json => {
          console.log(json);
          setUser({ id: json._id, name: json.username });
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  }, []);

  const changeLoginType = e => {
    setLoginType(e.target.value);
  };

  const logout = e => {
    if (user) {
      fetch(`https://api.panoramas.social/api/logout`, {
        method: "GET"
      })
        .then(response => {
          if (response.status === 200) setUser(null);
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  };

  return (
    <div>
      {user ? (
        <div>
          {!inRoom && (
            <Box display="flex" justifyContent="flex-end" alignItems="flex-end">
              <Button variant="contained" color="primary" onClick={logout}>
                Logout
              </Button>
            </Box>
          )}
          <div className="lobby page">
            {!inRoom && (
              <ToggleButtonGroup
                color="primary"
                value={type}
                exclusive
                onChange={e => setType(e.target.value)}
              >
                <ToggleButton value="join">Join Room</ToggleButton>
                <ToggleButton value="create">Create Room</ToggleButton>
              </ToggleButtonGroup>
            )}
            {type === "create" ? (
              <CreateRoom setInRoom={changeRoom} />
            ) : (
              <JoinRoom setInRoom={changeRoom} />
            )}
          </div>
        </div>
      ) : (
        <div className="lobby page">
          <ToggleButtonGroup
            color="primary"
            value={loginType}
            exclusive
            onChange={changeLoginType}
          >
            <ToggleButton value="signup">Sign Up</ToggleButton>
            <ToggleButton value="login">Log In</ToggleButton>
          </ToggleButtonGroup>
          {loginType === "signup" ? <Signup /> : <Login />}
        </div>
      )}
    </div>
  );
};

export default Lobby;
