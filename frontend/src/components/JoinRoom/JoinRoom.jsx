import { useState, useContext } from "react";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

import "../Form.css";
import Room from "../Room/Room";
import { AuthContext } from "../../context/AuthProvider";

const JoinRoom = () => {
  const { user } = useContext(AuthContext);
  const [roomId, setRoomId] = useState("");
  const [room, setRoom] = useState(null);
  const [errors, setErrors] = useState("");

  const navigate = useNavigate();

  //passed to Room so that if the local participant leaves, this can be set to null, or vice versa
  const changeRoom = room => {
    setRoom(room);
  };

  const joinRoom = e => {
    e.preventDefault();
    fetch(`http://localhost:5000/api/room/${roomId}`).then(res => {
      //Go to room if it exists, otherwise set error to show it does not exist
      if (res.status === 200) {
        fetch(
          `http://localhost:5000/api/room/${roomId}/whitelist?` +
            new URLSearchParams({
              identity: user.email
            })
        ).then(res2 => {
          if (res2.status === 200) {
            navigate(`/room/${roomId}`);
          } else {
            setErrors("Unauthorized to join the call");
          }
        });
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
          <div className="formElement">
            Enter room ID
            <TextField
              fullWidth
              placeholder="Room ID"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
            ></TextField>
          </div>

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
