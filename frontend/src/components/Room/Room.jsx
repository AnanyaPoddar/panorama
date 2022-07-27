import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@mui/material";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Mic, MicOff, Videocam, VideocamOff } from "@mui/icons-material";
import { connect } from "twilio-video";

import "./Room.css";
import Participant from "../Participant/Participant";
import Whiteboard from "../Whiteboard/Whiteboard";
import WorkerBuilder from "../CallSummary/WorkerBuilder";
import Worker from "../CallSummary/worker";
import { AuthContext } from "../../context/AuthProvider";

const Room = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [room, setRoom] = useState(null);

  //the mode can either be "draw" or "vid" corresponding to seeing the whiteboard or video
  const [mode, setMode] = useState("vid");

  const [remoteParticipants, setRemoteParticipants] = useState([]);
  //audioOn set to true means unmuted
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [participantEmails, setParticipantEmails] = useState([]);

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

  const renderRemoteParticipants = remoteParticipants.map((participant) => (
    <Participant
      key={participant.sid}
      participant={participant}
      videoOn={true}
      audioOn={true}
    />
  ));

  const connectToRoom = (token) => {
    connect(token, { name: id })
      .then((newRoom) => {
        setRoom(newRoom);
      })
      .catch((err) => console.log(err));
  };

  const addParticipant = (participant) => {
    setRemoteParticipants((prev) => [...prev, participant]);
  };

  const removeParticipant = (participant) => {
    participant.removeAllListeners();
    setRemoteParticipants((prev) => prev.filter((p) => p !== participant));
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
      room.on("participantConnected", addParticipant);
      room.on("participantDisconnected", removeParticipant);
      //local participant disconnects
      window.addEventListener("pagehide", () => room.disconnect());
    }
  }, [room]);

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
  };

  const sendSummary = () => {
    fetch(`http://localhost:5000/api/room/${id}/participants`)
      .then((res) => res.json())
      .then((json) => {
        const worker = new WorkerBuilder(Worker);
        console.log("here", json.emails);
        const emails = json.emails;
        const names = json.names;
        worker.postMessage({ emails, names });
        worker.onerror = (err) => err;
        worker.onmessage = (e) => {
          console.log(e.data);
          worker.terminate();
        };
      });
  };

  return (
    <div className="room page">
      {user && room && (
        <>
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
          <br />
          <ToggleButtonGroup
            color="primary"
            value={mode}
            exclusive
            onChange={(e) => setMode(e.target.value)}
          >
            <ToggleButton value="vid">Videos</ToggleButton>
            <ToggleButton value="draw">Whiteboard</ToggleButton>
          </ToggleButtonGroup>
          <br />
          <br />
          {mode === "vid" && (
            <div className="videos-container">
              <div className="participant" id="local-user">
                <Participant
                  participant={room.localParticipant}
                  videoOn={videoOn}
                  audioOn={audioOn}
                />
              </div>
              {renderRemoteParticipants}
            </div>
          )}
          {mode === "draw" && <Whiteboard roomId={id} />}
          <br />
          <br />
          <div className="controls">
            {audioOn ? (
              <Button variant="outlined" onClick={() => mute()}>
                <MicOff /> Turn Mic Off
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => unmute()}>
                <Mic /> Turn Mic On
              </Button>
            )}
            {videoOn ? (
              <Button variant="outlined" onClick={() => stopVideo()}>
                <VideocamOff /> Turn Video Off
              </Button>
            ) : (
              <Button variant="outlined" onClick={() => startVideo()}>
                <Videocam /> Turn Video On
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              onClick={() => leaveRoom()}
            >
              Leave Call
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => sendSummary()}
            >
              Send Email
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Room;
