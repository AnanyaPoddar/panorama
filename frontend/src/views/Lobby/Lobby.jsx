import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";

import CreateRoom from "../../components/CreateRoom/CreateRoom";
import JoinRoom from "../../components/JoinRoom/JoinRoom";
import "./Lobby.css";

const Lobby = () => {
  const { user, setUser } = useContext(AuthContext);

  //set default type to join room, instead of creating a room
  const [type, setType] = useState("join");

  // check if the user has authenticated through linkedin
  useEffect(() => {
    if (!user) {
      fetch(`http://localhost:5000/api/linkedin/auth/success`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      })
        .then((response) => {
          if (response.status === 200) return response.json();
          throw new Error("authentication has been failed!");
        })
        .then((json) => {
          console.log(json);
          setUser({ id: json._id, name: json.username });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, []);

  return (
    <div>
      {user && (
        <div>
          <div className="lobby page">
            <ToggleButtonGroup
              color="primary"
              value={type}
              exclusive
              onChange={(e) => setType(e.target.value)}
            >
              <ToggleButton value="join">Join Room</ToggleButton>
              <ToggleButton value="create">Create Room</ToggleButton>
            </ToggleButtonGroup>
            {type === "create" ? <CreateRoom /> : <JoinRoom />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
