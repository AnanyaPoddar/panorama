import { Button, TextField } from "@mui/material";
import { connect } from "twilio-video";

import Room from "../Room/Room";

import { useContext, useState } from "react";
import "../Form.css";
import { AuthContext } from "../../context/AuthProvider";

const CreateRoom = ({ setInRoom }) => {
  const { user } = useContext(AuthContext);
  const [roomId, setRoomId] = useState(null);
  const [token, setToken] = useState(null);
  const [room, setRoom] = useState(null);

  const changeRoom = room => {
    setRoom(room);
  };

  const createRoom = e => {
    e.preventDefault();
    fetch(`https://api.panoramas.social/api/room/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identity: user.name
      })
    })
      .then(res => {
        return res.json();
      })
      .then(json => {
        setRoomId(json.id);
        setToken(json.token);
      })
      .catch(err => console.log(err));
  };

  //actually connect to the room
  const joinRoom = e => {
    e.preventDefault();
    connect(token, { name: roomId })
      .then(newRoom => {
        setInRoom(true);
        setRoom(newRoom);
      })
      .catch(err => console.log(err));
  };

  return (
    <div>
      <form onSubmit={createRoom} className="form">
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
