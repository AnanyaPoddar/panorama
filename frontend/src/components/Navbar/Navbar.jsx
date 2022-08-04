import {
  AppBar, Avatar, Button, createTheme,
  IconButton, ThemeProvider, Toolbar
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import "./Navbar.css";

const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const { user, setUser } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    //Check if there is logged in user
    if (user) {
      setLoggedIn(true);
      fetch(`https://api.panoramas.social/api/users/me/profilePic`, {
        method: "GET",
        credentials: "include"
      })
        .then(res => res.json())
        .then(json => setProfilePic(json.image))
        .catch(err => console.error(err));
    } else setLoggedIn(false);
  }, [user]);

  //TODO: Move logout into its own component?
  const logout = () => {
    if (user) {
      fetch(`https://api.panoramas.social/api/logout`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Access-Control-Allow-Credentials": true
        }
      })
        .then(response => {
          if (response.status === 200) setUser(null);
          navigate("/");
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  };
  //For mui
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#1976d2"
      }
    }
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="sticky" id="appbar">
        <Toolbar id="navbar">
          <div className="nav-left">
            {/* Redirects to lobby if logged in, otherwise to the homepage */}
            {loggedIn ? (
              <h2>Panorama</h2>
            ) : (
              <h2 onClick={() => navigate("/")}>Panorama</h2>
            )}
          </div>
          <div className="nav-right">
            <Button variant="raised" onClick={() => navigate("/credits")}>
              Credits
            </Button>
            {loggedIn && user ? (
              <>
                <IconButton sx={{ p: 0 }}>
                  <Avatar alt={user.email} src={profilePic} />
                </IconButton>
                <Button variant="contained" color="primary" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </Button>
            )}
          </div>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
