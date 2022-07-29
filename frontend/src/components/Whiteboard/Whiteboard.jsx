import { Tldraw } from "@tldraw/tldraw";
import { useMultiplayerState } from "./useMultiplayerState";
import { useEffect, useState } from "react";
import "./Whiteboard.css";

const Whiteboard = ({ roomId }) => {
  const { onMount, ...events } = useMultiplayerState(roomId);
  let [wbMount, setwbMount] = useState(null);

  useEffect(() => {
    if (wbMount == null) setwbMount({ onMount });
    console.log(wbMount);
  });

  console.log(onMount);
  return (
    <div>
      {wbMount != null ? (
        <Tldraw
          showMenu={false}
          showMultiplayerMenu={false}
          showPages={false}
          onMount={onMount}
          {...events}
        />
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
};

export default Whiteboard;
