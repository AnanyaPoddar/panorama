import { useState, useContext, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import "./Navbar.css";

const Navbar = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    //Check if there is logged in user
    if (user) setLoggedIn(true);
    else setLoggedIn(false);
  }, [user]);

  //TODO: Move logout into its own component?
  const logout = (e) => {
    if (user) {
      fetch(`http://localhost:5000/api/logout`, {
        method: "GET",
      })
        .then((response) => {
          if (response.status === 200) setUser(null);
          navigate("/");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };
  //For mui
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#1976d2",
      },
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="sticky">
        <Toolbar id="navbar">
          <div className="nav-left">
            <h2 onClick={() => navigate("/")}>Panorama</h2>
          </div>
          <div className="nav-right">
            {loggedIn ? (
              <>
                <h4 onClick={() => navigate("/myProfile")}>My Profile</h4>
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
