import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

import "../Form.css";
import Room from "../Room/Room";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState(null);
  const [errors, setErrors] = useState("");

  const navigate = useNavigate();

  //passed to Room so that if the local participant leaves, this can be set to null, or vice versa
  const changeRoom = (room) => {
    setRoom(room);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/room/${roomId}`).then((res) => {
      //Go to room if it exists, otherwise set error to show it does not exist
      if (res.status === 200) {
        navigate(`/${roomId}`);
      } else {
        //TODO: Set appropriate error, may not just be 404
        setErrors("Room Not Found");
      }
    });
  };

  return (
    <div>
      {!room ? (
        <form onSubmit={joinRoom} className="form">
          <br />
          <TextField
            variant="standard"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          ></TextField>
          <br />
          <Button variant="outlined" type="submit">
            Join Room
          </Button>
          {errors && <p className="error">{errors}</p>}
        </form>
      ) : (
        <Room room={room} id={roomId} setRoom={changeRoom} />
      )}
    </div>
  );
};

export default JoinRoom;
