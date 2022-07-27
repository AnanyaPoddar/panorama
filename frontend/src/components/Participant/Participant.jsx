// import { useState, useRef, useEffect } from "react";

// const Participant = ({ participant, videoOn, audioOn }) => {
//   const [videos, setVideos] = useState([]);
//   const [audios, setAudios] = useState([]);
//   const videoRef = useRef();
//   const audioRef = useRef();

//   // useEffect(() => {
//   //   if (!videoOn) setVideos([]);
//   //   if (!audioOn) setAudios([]);
//   // }, [videoOn, audioOn]);

//   const addTrack = (track) => {
//     if (track.kind === "video") setVideos((videos) => [...videos, track]);
//     else setAudios((audios) => [...audios, track]);
//   };

//   const removeTrack = (track) => {
//     if (track.kind === "video")
//       setVideos((videos) => videos.filter((v) => v !== track));
//     else setAudios((audios) => audios.filter((a) => a !== track));
//   };

//   const getInitialTracks = (tracks) => {
//     //tracks are null if they are not subscribed to, we don't want to return those
//     return Array.from(tracks.values())
//       .map((publication) => publication.track)
//       .filter((track) => track !== null);
//   };

//   useEffect(() => {
//     //Get Tracks that participant has already published
//     setVideos(getInitialTracks(participant.videoTracks));
//     setAudios(getInitialTracks(participant.audioTracks));

//     //Checks for new tracks that a participant publishes
//     participant.on("trackSubscribed", (track) => {
//       addTrack(track);
//     });

//     participant.on("trackUnsubscribed", (track) => {
//       removeTrack(track);
//     });
//   }, [participant, videoOn, audioOn]);

//   //attach video
//   useEffect(() => {
//     const video = videos[0];
//     if (video) video.attach(videoRef.current);
//     console.log(videos);
//   }, [videos]);

//   useEffect(() => {
//     const audio = audios[0];
//     if (audio) audio.attach(audioRef.current);
//   }, [audios]);

//   return (
//     <>
//       <h3>{participant.identity}</h3>
//       {videoOn && <video ref={videoRef} autoPlay playsInline />}
//       {audioOn && <audio ref={audioRef} autoPlay />}
//     </>
//   );
// };

// export default Participant;

import React, { useState, useEffect, useRef } from "react";

const Participant = ({ participant }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);

  const videoRef = useRef();
  const audioRef = useRef();

  const trackpubsToTracks = (trackMap) =>
    Array.from(trackMap.values())
      .map((publication) => publication.track)
      .filter((track) => track !== null);

  useEffect(() => {
    setVideoTracks(trackpubsToTracks(participant.videoTracks));
    setAudioTracks(trackpubsToTracks(participant.audioTracks));

    const trackSubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => [...videoTracks, track]);
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => [...audioTracks, track]);
      }
    };

    const trackUnsubscribed = (track) => {
      if (track.kind === "video") {
        setVideoTracks((videoTracks) => videoTracks.filter((v) => v !== track));
      } else if (track.kind === "audio") {
        setAudioTracks((audioTracks) => audioTracks.filter((a) => a !== track));
      }
    };

    participant.on("trackSubscribed", trackSubscribed);
    participant.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  return (
    <div className="participant">
      <h3>{participant.identity}</h3>
      <video ref={videoRef} autoPlay={true} />
      <audio ref={audioRef} autoPlay={true} muted={true} />
    </div>
  );
};

export default Participant;
