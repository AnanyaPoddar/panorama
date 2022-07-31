import {
  Logout,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
} from "@mui/icons-material";
import { IconButton, Tooltip, Button } from "@mui/material";
import { createLocalVideoTrack } from "twilio-video";
import { useNavigate } from "react-router-dom";

const LocalControls = ({
  room,
  audioOn,
  videoOn,
  setAudioOn,
  setVideoOn,
  setRoom,
}) => {
  const navigate = useNavigate();

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

  return (
    <>
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
      <Tooltip title="Leave Room">
        <IconButton variant="contained" color="error" onClick={leaveRoom}>
          <Logout />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default LocalControls;
