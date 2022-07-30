import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Room from "../Room/Room";

import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import "../Form.css";

const CreateRoom = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);
  const [roomName, setRoomName] = useState("");

  const changeRoom = (room) => {
    setRoom(room);
  };

  const createRoom = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity: user.name,
        roomName: roomName
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        setRoomId(json.id);
      })
      .catch((err) => console.log(err));
  };

  //redirect to room
  const joinRoom = (e) => {
    e.preventDefault();
    navigate(`/room/${roomId}`);
  };

  return (
    <div>
      <form onSubmit={createRoom} className="form">
      <TextField
          variant="standard"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        {!room && !roomId && (
          <>
            <br />
            <Button variant="outlined" type="submit">
              Generate a new room ID
            </Button>
          </>
        )}
        {!room && roomId && (
          <>
            <p>Your new room ID is: {roomId}</p>
            <Button variant="outlined" onClick={joinRoom}>
              Join This Room
            </Button>
          </>
        )}
      </form>
      {room && <Room room={room} id={roomId} setRoom={changeRoom} />}
    </div>
  );
};

export default CreateRoom;
