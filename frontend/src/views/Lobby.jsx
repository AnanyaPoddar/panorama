import { useContext, useState } from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { AuthContext } from "../context/AuthProvider";

import JoinRoom from "../components/JoinRoom/JoinRoom";
import CreateRoom from "../components/CreateRoom/CreateRoom";
import Login from "../components/Login/Login";
import "./Lobby.css";

const Lobby = () => {
  const { user } = useContext(AuthContext);

  //set default type to join room, instead of creating a room
  const [type, setType] = useState("join");

  const [inRoom, setInRoom] = useState(false);

  const changeRoom = (val) => {
    setInRoom(val);
  };

  return (
    <div>
      {user ? (
        <div className="lobby page">
          {/* Only show toggle if user is not already in a room */}
          {!inRoom && (
            <ToggleButtonGroup
              color="primary"
              value={type}
              exclusive
              onChange={(e) => setType(e.target.value)}
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
      ) : (
        <Login />
      )}
    </div>
  );
};

export default Lobby;
