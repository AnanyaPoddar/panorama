import { useState, useEffect, useContext } from "react";
import {useNavigate} from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from "@mui/material";

import JoinRoom from "../../components/JoinRoom/JoinRoom";
import CreateRoom from "../../components/CreateRoom/CreateRoom";

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
  console.log(user.email);
  useEffect(() => {
    fetch(`http://localhost:5000/api/room/hosted`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity: user.email,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log(json);
        setRooms(json.names);
        setRoomIds(json.ids);
        console.log("HERE");
        console.log(rooms);
        console.log(ids);
      })
      .catch((err) => console.log(err));
  }, []);
  console.log("THIS IS CURRENT ROOM " + currRoom);

  const joinRoom = () => {
    console.log("testtttttttt");
    fetch(`http://localhost:5000/api/room/${currRoom}/completed`).then((res) => {
      //Go to room if it exists, otherwise set error to show it does not exist
      console.log("here we go")
      if (res.status === 200) {
        console.log("HERE");
        navigate(`/room/${currRoom}`);
      } else {
        //TODO: Set appropriate error, may not just be 404
        console.log("Room Not Found");
      }
    }).catch((error) => console.log(error));
  };


  return (
      <Box sx={{ display: 'flex' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <h2> My Rooms </h2>
            <List>
              {rooms.map((text, index) => (
                <ListItem key={text} disablePadding>
                  {/* on click, join the room*/} 
                  {currRoom==ids[index] 
                    ? <Button onClick={() => joinRoom()}> Join Room</Button> 
                    : <ListItemButton onClick={() => setCurrRoom(ids[index])}>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  }
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box>
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
        </Box>
      </Box>
    );
};

export default HostedRooms;
