import { ContentCopy } from "@mui/icons-material";
import {
  Alert,
  Button,
  Drawer,
  IconButton,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { connect } from "twilio-video";

import { AuthContext } from "../../context/AuthProvider";
import Participant from "../Participant/Participant";
import Whiteboard from "../Whiteboard/Whiteboard";
import HostControls from "./HostControls";
import LocalControls from "./LocalControls";
import "./Room.css";

const Room = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  console.log("user is; ");
  console.log(user);
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  //set the host of the current room, check this against the current user to ensure that they are the same
  const [host, setHost] = useState("");
  //only available for the host, when they successfully kick out a participant
  const [openKickedNotif, setOpenKickedNotif] = useState(false);

  //collapsibleContent can either correspond to "metadata" - metadata of room including participants, or "vid" - to display paginated videos
  const [collapsibleContent, setCollapsibleContent] = useState("vid");

  const [remoteParticipants, setRemoteParticipants] = useState([]);
  //audioOn set to true means unmuted
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const [redirect, setRedirect] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  //pass to LocalControls to change state from child to parent
  const changeVideoOn = (val) => {
    setVideoOn(val);
  };
  const changeAudioOn = (val) => {
    setAudioOn(val);
  };
  const changeRoom = (val) => {
    setRoom(val);
  };

  //get token to connect to room with given id
  //TODO: Handle errors
  useEffect(() => {
    fetch(`http://localhost:5000/api/room/${id}/token`, {
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
        connectToRoom(json.token);
      })
      .catch((err) => console.log(err));
  }, []);

  //A user can only connect to a room if they receive a valid token to access that room, hence "room" will always be null unless a user has a valid grant to a room
  const connectToRoom = (token) => {
    connect(token, { name: id })
      .then((newRoom) => {
        setRoom(newRoom);
      })
      //Set the host of room, as hosts have extra controls including kicking out participants and ending call
      .then(
        fetch(`http://localhost:5000/api/room/${id}/host`)
          .then((res) => {
            return res.json();
          })
          .then((json) => {
            setHost(json.host);
          })
      )
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const addParticipant = (participant) => {
      setRemoteParticipants((prev) => [...prev, participant]);
    };
    const removeParticipant = (participant) => {
      participant.removeAllListeners();
      setRemoteParticipants((prev) => prev.filter((p) => p !== participant));
    };
    if (room) {
      room.participants.forEach(addParticipant);
      //listen for changes in participants in room
      room.on("participantConnected", addParticipant);
      room.on("participantDisconnected", removeParticipant);
      //local participant disconnects
      window.addEventListener("pagehide", () => room.disconnect());
      //Wait before redirecting
      room.on("disconnected", () => {
        //if the room was ended and the current user is the host, keep the host in the room, in an inactive state
        if (host !== "" && host === user.name) {
          navigate(`/room/inactive/${id}`);
        } else {
          setTimeout(() => {
            setRedirect(true);
          }, 3000);
          setAlertMsg(
            "You have been disconnected form the room. Redirecting to lobby..."
          );
        }
        //Wait until alert flashed before redirecting
      });
      room.on("roomEnded", () => {
        //if the room was ended and the current user is the host, keep the host in the room, in an inactive state
        if (host !== "" && host === user.name) {
          navigate(`/room/inactive/${id}`);
        }
        //if the room was ended by the host, and the current user is not the host, redirect to lobby.
        else {
          setTimeout(() => {
            setRedirect(true);
          }, 3000);
          setAlertMsg("The host has ended the call. Redirecting to lobby...");
        }
      });
    }
  }, [room]);

  const renderRemoteParticipants = remoteParticipants.map((participant) => (
    <Participant
      key={participant.sid}
      participant={participant}
      videoOn={true}
      audioOn={true}
    />
  ));

  const kickParticipant = (participant) => {
    //TODO: Handle errors
    fetch(`http://localhost:5000/api/room/${id}/participants/${participant}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity: user.email,
      }),
    })
      .then((res) => {
        if (res.status === 200) {
          setOpenKickedNotif(true);
          renderSuccessfulKick(participant);
        }
      })
      .catch((err) => console.log(err));
  };

  const renderSuccessfulKick = (participant) => {
    //flash the "kicked participant out" notif for 3 seconds
    setTimeout(() => {
      setOpenKickedNotif(false);
    }, 3000);
    return (
      <Snackbar
        open={true}
        autoHideDuration={4000}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert severity="success">
          {"Successfully kicked out participant " + participant}
        </Alert>
      </Snackbar>
    );
  };

  return (
    <div className="room page">
      {/* TODO: Show errors if room actually could not be created or something */}
      {user && !room && <h2>Connecting to room ...</h2>}
      {user && room && (
        <>
          <Drawer variant="permanent" anchor="left" className="sidebar">
            <div className="sidebar-top"></div>
            <ToggleButtonGroup
              color="primary"
              value={collapsibleContent}
              exclusive
              onChange={(e) => setCollapsibleContent(e.target.value)}
            >
              <ToggleButton value="vid">Videos</ToggleButton>
              <ToggleButton value="metadata">Metadata</ToggleButton>
            </ToggleButtonGroup>
            <br />
            <br />
            {collapsibleContent === "metadata" ? (
              <div>
                <div className="room-invite">
                  <p>
                    <b>RoomId :</b> {id}
                  </p>
                  <Tooltip title="Copy link">
                    <IconButton
                      onClick={() => navigator.clipboard.writeText(id)}
                    >
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </div>
                <br />
                <hr />
                <h4>Participants</h4>
                <p>
                  <b>{room.localParticipant.identity}</b>
                </p>
                <div className="participant-list">
                  {/* Only allow hosts to kick participants out */}
                  {host !== "" && host === user.email
                    ? remoteParticipants.map((participant) => (
                        <div className="participant-in-list">
                          <p>{participant.identity}</p>
                          <Button
                            color="error"
                            variant="contained"
                            onClick={() =>
                              kickParticipant(participant.identity)
                            }
                          >
                            Kick
                          </Button>
                        </div>
                      ))
                    : remoteParticipants.map((participant) => (
                        <p>{participant.identity}</p>
                      ))}
                </div>
              </div>
            ) : (
              <div className="videos-container">
                <div id="local-user">
                  <Participant participant={room.localParticipant} />
                </div>
                {renderRemoteParticipants}
              </div>
            )}
            <div className="controls">
              <LocalControls
                room={room}
                audioOn={audioOn}
                videoOn={videoOn}
                setAudioOn={changeAudioOn}
                setVideoOn={changeVideoOn}
                setRoom={changeRoom}
              />
              {host !== "" && host === user.email && <HostControls id={id} />}
            </div>
          </Drawer>
          <Whiteboard roomId={id} />
          {openKickedNotif && renderSuccessfulKick("user")}
          {alertMsg !== "" && (
            <Alert className="alert" severity="error">
              {alertMsg}
            </Alert>
          )}
          {redirect && <Navigate to="/lobby" />}
          <br />
          <br />
        </>
      )}
    </div>
  );
};

export default Room;
