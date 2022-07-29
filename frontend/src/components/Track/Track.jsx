import { useRef, useEffect } from "react";

const Track = ({ track }) => {
  const ref = useRef();

  console.log(track, ref);

  useEffect(() => {
    if (track !== null) {
      ref.current.classList.add(track.kind);
      ref.current.appendChild(track.attach());
    }
  }, []);

  return <div className="track" ref={ref}></div>;
};

export default Track;
