import { useState } from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import Signup from "../../components/Signup/Signup";
import Login from "../../components/Login/Login";

const Signin = () => {
  const [signinType, setSigninType] = useState("signup");
  return (
    <div className="lobby page">
      <ToggleButtonGroup
        color="primary"
        value={signinType}
        exclusive
        onChange={(e) => setSigninType(e.target.value)}
      >
        <ToggleButton value="signup">Sign Up</ToggleButton>
        <ToggleButton value="login">Log In</ToggleButton>
      </ToggleButtonGroup>
      {signinType === "signup" ? <Signup /> : <Login />}
    </div>
  );
};

export default Signin;
