import { useState, useRef, useEffect } from "react";

const Participant = ({ participant, videoOn, audioOn }) => {
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);
  const videoRef = useRef();
  const audioRef = useRef();

  // useEffect(() => {
  //   if (!videoOn) setVideos([]);
  //   if (!audioOn) setAudios([]);
  // }, [videoOn, audioOn]);

  const addTrack = (track) => {
    if (track.kind === "video") setVideos((videos) => [...videos, track]);
    else setAudios((audios) => [...audios, track]);
  };

  const removeTrack = (track) => {
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

    participant.on("trackUnsubscribed", (track) => {
      removeTrack(track);
    });
  }, [participant, videoOn, audioOn]);

  //attach video
  useEffect(() => {
    const video = videos[0];
    if (video) video.attach(videoRef.current);
    console.log(videos);
  }, [videos]);

  useEffect(() => {
    const audio = audios[0];
    if (audio) audio.attach(audioRef.current);
  }, [audios]);

  return (
    <div className="participant">
      <h3>{participant.identity}</h3>
      {videoOn && <video ref={videoRef} autoPlay playsInline />}
      {audioOn && <audio ref={audioRef} autoPlay />}
    </div>
  );
};

export default Participant;
