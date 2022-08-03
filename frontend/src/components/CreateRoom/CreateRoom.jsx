import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Room from "../Room/Room";

import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import WhitelistTable from "../../components/WhitelistTable/WhitelistTable";
import "../Form.css";

const CreateRoom = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);
  const [roomName, setRoomName] = useState("");
  const [selected, setSelected] = useState("");

  const changeRoom = room => {
    setRoom(room);
  };

  const createRoom = e => {
    e.preventDefault();
    let confirm = true;
    if (!selected.length) {
      if (
        !window.confirm(
          "Please note that there are no users added to this call. Do you still like to continue?"
        )
      ) {
        confirm = false;
      }
    }
    if (confirm) {
      fetch(`http://localhost:5000/api/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          roomName: roomName,
          users: selected.concat([user.email])
        })
      })
        .then(res => {
          return res.json();
        })
        .then(json => {
          setRoomId(json.id);
          fetch(`http://localhost:5000/api/invite`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              users: selected,
              roomID: json.id,
              userEmail: user.email
            })
          })
            .then(res => {
              return res.json();
            })
            .then(json => {
              return;
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    }
  };

  //redirect to room
  const joinRoom = e => {
    e.preventDefault();
    navigate(`/room/${roomId}`);
  };

  const updateSelected = users => {
    setSelected(users);
  };

  return (
    <div>
      <form onSubmit={createRoom} className="form">
        <div className="formElement">
          Add room name
          <TextField
            fullWidth
            placeholder="Room name"
            required
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />
        </div>

        <WhitelistTable callback={updateSelected} />

        {!room && !roomId && (
          <>
            <br />
            <Button style={{ marginTop: 70 }} variant="outlined" type="submit">
              Generate a new room ID
            </Button>
          </>
        )}
        {!room && roomId && (
          <>
            <p style={{ marginTop: 80 }}>Your new room ID is: {roomId}</p>
            <Button
              className="createRoomButton"
              variant="outlined"
              onClick={joinRoom}
            >
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
