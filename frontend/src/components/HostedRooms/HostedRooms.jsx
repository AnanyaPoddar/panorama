import { Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

import CreateRoom from "../../components/CreateRoom/CreateRoom";
import JoinRoom from "../../components/JoinRoom/JoinRoom";
import "./HostedRooms.css";

const drawerWidth = 240;

const HostedRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [ids, setRoomIds] = useState([]);
  const [currRoom, setCurrRoom] = useState(null);
  //set default type to join room, instead of creating a room
  const [type, setType] = useState("join");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  // check for rooms that user is host of
  useEffect(() => {
    fetch(`https://api.panoramas.social/api/room/hosted`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
      .then(res => {
        return res.json();
      })
      .then(json => {
        setRooms(json.names);
        setRoomIds(json.ids);
      })
      .catch(err => console.error(err));
  }, []);

  // fetch call to join a room if user clicks on it
  const joinRoom = () => {
    fetch(`https://api.panoramas.social/api/room/${currRoom}/completed`, {
      credentials: "include"
    })
      .then(res => {
        //Go to room if it exists, otherwise set error to show it does not exist
        if (res.status === 200) {
          navigate(`/room/inactive/${currRoom}`);
        }
      })
      .catch(error => console.error(error));
  };

  return (

    // based off of example in mui docs
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box"
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <h2> My Rooms </h2>
          <List>
            {rooms &&
              rooms.map((text, index) => (
                <ListItem key={text} disablePadding>
                  {/* on click, join the room*/}
                  {currRoom == ids[index] ? (
                    <Button onClick={() => joinRoom()}> Join Room</Button>
                  ) : (
                    <ListItemButton onClick={() => setCurrRoom(ids[index])}>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  )}
                </ListItem>
              ))}
          </List>
        </Box>
      </Drawer>
      {/* lobby page elements -> join or create a room*/ }
      <Box>
        <ToggleButtonGroup
          color="primary"
          value={type}
          exclusive
          onChange={e => setType(e.target.value)}
        >
          <ToggleButton value="join">Join Room</ToggleButton>
          <ToggleButton value="create">Create Room</ToggleButton>
        </ToggleButtonGroup>
        <div className="roomDetails">
          {type === "create" ? <CreateRoom /> : <JoinRoom />}
        </div>
      </Box>
    </Box>
  );
};

export default HostedRooms;