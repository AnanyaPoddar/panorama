import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import {
  ToggleButtonGroup,
  ToggleButton,
  Drawer,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  Cancel,
  ContentCopy,
  Logout,
} from "@mui/icons-material";
import { connect, VideoProcessor, createLocalVideoTrack } from "twilio-video";

import "./Room.css";
import Participant from "../Participant/Participant";
import Whiteboard from "../Whiteboard/Whiteboard";
import WorkerBuilder from "../CallSummary/WorkerBuilder";
import Worker from "../CallSummary/worker";
import { AuthContext } from "../../context/AuthProvider";

const Room = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  //set the host of the current room, check this against the current user to ensure that they are the same
  //Security-wise, this is better than setting some flag "isHost"
  const [host, setHost] = useState("");
  //only available for the host, when they wish to end the call they must confirm
  const [openConfirmation, setOpenConfirmation] = useState(false);
  //only available for the host, when they successfully kick out a participant
  const [openKickedNotif, setOpenKickedNotif] = useState(false);

  //collapsibleContent can either correspond to "metadata" - metadata of room including participants, or "vid" - to display paginated videos
  const [collapsibleContent, setCollapsibleContent] = useState("vid");

  const [remoteParticipants, setRemoteParticipants] = useState([]);
  //audioOn set to true means unmuted
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [participantEmails, setParticipantEmails] = useState([]);

  //get token to connect to room with given id
  useEffect(() => {
    fetch(`http://localhost:5000/api/room/${id}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity: user.name,
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
      //TODO: Show some message to show that they have been disconnected from the room
      room.on("disconnected", () => navigate("/lobby"));
      //TODO: Show some message to show that the call has ended from the host
      room.on("roomEnded", () => navigate("/lobby"));
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

  const mute = () => {
    room.localParticipant.audioTracks.forEach((publication) =>
      publication.track.disable()
    );
    setAudioOn(false);
  };

  const unmute = () => {
    room.localParticipant.audioTracks.forEach((publication) =>
      publication.track.enable()
    );
    setAudioOn(true);
  };

  const startVideo = () => {
    createLocalVideoTrack().then((localTrack) => {
      room.localParticipant.publishTrack(localTrack);
      //own defined socket event to correctly redisplay video track
      room.localParticipant.emit("videoTrackPublished", localTrack);
    });
    room.localParticipant.videoTracks.forEach((publication) => {
      publication.track.enable();
    });
    setVideoOn(true);
  };

  const stopVideo = () => {
    room.localParticipant.videoTracks.forEach((publication) => {
      //own defined socket event to correctly hide video track
      room.localParticipant.emit("videoTrackUnpublished", publication.track);
      //For video, tracks must be stopped rather than just disabled
      publication.unpublish();
      publication.track.stop();
      publication.track.disable();
      // publication.track.detach();
    });
    setVideoOn(false);
  };

  const leaveRoom = () => {
    if (room.localParticipant.state === "connected") {
      room.localParticipant.tracks.forEach((publication) => {
        publication.unpublish();
        publication.track.stop();
      });
      room.disconnect();
    }
    setRoom(null);
    navigate("/lobby");
  };

  const kickParticipant = (participant) => {
    //TODO: Handle errors
    fetch(`http://localhost:5000/api/room/${id}/participants/${participant}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity: user.name,
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

  const endCall = () => {
    fetch(`http://localhost:5000/api/room/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity: user.name,
      }),
    }).then((res) => {
      //only send the summary if the call was successfully ended
      if (res.status === 200) sendSummary();
      //TODO: Handle case when status not 200, show appropriate error message
    });
  };

  const sendSummary = () => {
    fetch(`http://localhost:5000/api/room/${id}/participants`)
      .then((res) => res.json())
      .then((json) => {
        const worker = new WorkerBuilder(Worker);
        const emails = json.emails;
        const names = json.names;
        worker.postMessage({ emails, names });
        worker.onerror = (err) => err;
        worker.onmessage = (e) => {
          worker.terminate();
        };
      });
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
                      onClick={() => {
                        navigator.clipboard.writeText(id);
                      }}
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
                  {host !== "" && host === user.name
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
                  <Participant
                    participant={room.localParticipant}
                    videoOn={videoOn}
                  />
                </div>
                {renderRemoteParticipants}
              </div>
            )}
            <div className="controls">
              {audioOn ? (
                <Tooltip title="Mute">
                  <IconButton onClick={mute}>
                    <Mic />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Unmute">
                  <IconButton onClick={unmute} color="error">
                    <MicOff />
                  </IconButton>
                </Tooltip>
              )}
              {videoOn ? (
                <Tooltip title="Stop Video">
                  <IconButton onClick={stopVideo}>
                    <Videocam />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Start Video">
                  <IconButton onClick={startVideo} color="error">
                    <VideocamOff />
                  </IconButton>
                </Tooltip>
              )}
              {/* <IconButton
                onClick={() => {
                  setOpenSidebar(true);
                  setCollapsibleContent("metadata");
                }}
              >
                <People />
              </IconButton> */}
              <Tooltip title="Leave Room">
                <IconButton
                  variant="outlined"
                  color="error"
                  onClick={leaveRoom}
                >
                  <Logout />
                </IconButton>
              </Tooltip>
              {/* TODO: Possibly implement confirmation modal to make sure they want to do this */}
              {host !== "" && host === user.name && (
                <Tooltip title="End Room for All">
                  <IconButton
                    variant="contained"
                    color="error"
                    onClick={() => setOpenConfirmation(true)}
                  >
                    <Cancel />
                  </IconButton>
                </Tooltip>
              )}

              {host !== "" && host === user.name && (
                <Dialog
                  open={openConfirmation}
                  onClose={() => setOpenConfirmation(false)}
                >
                  <DialogTitle className="error">
                    {"Are you sure you want to end the room?"}
                  </DialogTitle>
                  <DialogContent>
                    <p>
                      All participants will be removed from the call and lose
                      access to this workspace.
                    </p>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      variant="outlined"
                      color="success"
                      onClick={() => setOpenConfirmation(false)}
                    >
                      Take Me Back
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={endCall}
                      autoFocus
                    >
                      End this Room
                    </Button>
                  </DialogActions>
                </Dialog>
              )}
            </div>
          </Drawer>
          <Whiteboard roomId={id} />
          {openKickedNotif && renderSuccessfulKick("user")}
          <br />
          <br />
        </>
      )}
    </div>
  );
};

export default Room;
