import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import {
  ToggleButtonGroup,
  ToggleButton,
  Drawer,
  IconButton,
} from "@mui/material";
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ChevronRight,
} from "@mui/icons-material";
import { connect, VideoProcessor } from "twilio-video";

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
  const [openSidebar, setOpenSidebar] = useState(true);

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
    room.localParticipant.videoTracks.forEach((publication) => {
      publication.track.enable();
      publication.track.attach();
    });
    setVideoOn(true);
  };

  const stopVideo = () => {
    room.localParticipant.videoTracks.forEach((publication) => {
      publication.track.disable();
      publication.track.detach();
    });
    setVideoOn(false);
  };

  const leaveRoom = () => {
    if (room.localParticipant.state === "connected") {
      room.localParticipant.tracks.forEach((publication) =>
        publication.track.stop()
      );
      room.disconnect();
    }
    setRoom(null);
    navigate("/lobby");
  };

  const kickParticipant = (participant) => {
    console.log(participant);
    //TODO: Handle errors
    //TODO: Use mui snackbar to show that participant has been kicked out
    fetch(`http://localhost:5000/api/room/${id}/participants/${participant}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity: user.name,
      }),
    }).then((res) => console.log(res));
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
          <Drawer
            // variant="persistent"
            variant="permanent"
            anchor="right"
            className="sidebar"
            // open={openSidebar}
          >
            <div className="sidebar-top">
              <IconButton
                variant="contained"
                onClick={() => setOpenSidebar(false)}
              >
                <ChevronRight />
              </IconButton>
            </div>
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
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(id);
                    }}
                  >
                    Copy Room Id
                  </Button>
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
                    audioOn={audioOn}
                  />
                </div>
                {renderRemoteParticipants}
              </div>
            )}
          </Drawer>
          <Whiteboard roomId={id} />
          <br />
          <br />
          <Drawer variant="permanent" anchor="bottom">
            <div className="controls">
              {audioOn ? (
                <IconButton onClick={mute}>
                  <Mic />
                </IconButton>
              ) : (
                <IconButton onClick={unmute} color="error">
                  <MicOff />
                </IconButton>
              )}
              {videoOn ? (
                <IconButton onClick={stopVideo}>
                  <Videocam />
                </IconButton>
              ) : (
                <IconButton onClick={startVideo} color="error">
                  <VideocamOff />
                </IconButton>
              )}
              {/* <IconButton
                onClick={() => {
                  setOpenSidebar(true);
                  setCollapsibleContent("metadata");
                }}
              >
                <People />
              </IconButton> */}
              <Button variant="outlined" color="error" onClick={leaveRoom}>
                Leave Call
              </Button>
              {host !== "" && host === user.name && (
                <Button variant="contained" color="error" onClick={endCall}>
                  End Call For All
                </Button>
              )}
            </div>
          </Drawer>
        </>
      )}
    </div>
  );
};

export default Room;
