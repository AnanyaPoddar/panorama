import { useState, useRef, useEffect } from "react";
import "./Participant.css";
import Track from "../Track/Track";

const Participant = ({ participant, videoOn }) => {
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const videoRef = useRef();
  const audioRef = useRef();

  // const [tracks, setTracks] = useState([]);

  const addTrack = (track) => {
    // setTracks((tracks) => [...tracks, track]);
    if (track.kind === "video") setVideos((videos) => [...videos, track]);
    else setAudios((audios) => [...audios, track]);
  };

  const removeTrack = (track) => {
    // setTracks((tracks) => tracks.filter((t) => t !== track));
    if (track.kind === "video")
      setVideos((videos) => videos.filter((v) => v !== track));
    else setAudios((audios) => audios.filter((a) => a !== track));
  };

  const getInitialTracks = (tracks) => {
    //tracks are null if they are not subscribed to, we don't want to return those
    return Array.from(tracks.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);
  };

  useEffect(() => {
    //Get Tracks that participant has already published
    setVideos(getInitialTracks(participant.videoTracks));
    setAudios(getInitialTracks(participant.audioTracks));

    //Checks for new tracks that a participant publishes
    participant.on("trackSubscribed", (track) => {
      addTrack(track);
    });

    //For own defined socket event when a user reshares their video
    participant.on("videoTrackPublished", (track) => {
      addTrack(track);
    });

    //For own defined event when a user unshares their video
    participant.on("videoTrackUnpublished", (track) => {
      removeTrack(track);
    });

    participant.on("trackUnsubscribed", (track) => {
      removeTrack(track);
    });
  }, [participant]);

  //attach video
  useEffect(() => {
    const video = videos[0];
    if (video) video.attach(videoRef.current);
  }, [videos]);

  useEffect(() => {
    const audio = audios[0];
    if (audio) audio.attach(audioRef.current);
  }, [audios]);

  return (
    <div className="participant">
      <div className="participant-name">{participant.identity}</div>
      {/* {tracks.map((track) => (
        <Track key={track} track={track} />
      ))} */}
      {console.log(videoOn, videos, videoRef)}
      <video ref={videoRef} autoPlay playsInline />
      <audio ref={audioRef} autoPlay />
    </div>
  );
};

export default Participant;
