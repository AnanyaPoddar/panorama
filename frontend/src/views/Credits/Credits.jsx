import { useContext } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthProvider";

const Credits = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <div className="page">
      <h1>Credits</h1>
      <h2>Styling Libraries</h2>
      <ul>
        <li>
          Material UI for buttons, navbar, themes, and many frontend components{" "}
          <a href="https://mui.com/">MUI</a>
        </li>
      </ul>
      <h2>CSS, Node & React Code</h2>
      <ul>
        <li>
          Frontend setup for twilio-video{" "}
          <a href="https://www.twilio.com/blog/video-chat-react-hooks">
            Video Group Chat React
          </a>
        </li>
        <li>
          Twilio-video Javascript docs{" "}
          <a href="https://www.twilio.com/docs/video/javascript-getting-started">
            Twilio-video Javascript SDK docs
          </a>
        </li>
        <li>
          Creating Protected Routes{" "}
          <a href="https://medium.com/@dennisivy/creating-protected-routes-with-react-router-v6-2c4bbaf7bc1c">
            Medium - React-router-v6 protected routes
          </a>
        </li>
        <li>
          Typewriter animation{" "}
          <a href="https://codesandbox.io/s/typewriter-css-text-animation-ot3cc">
            Codesandbox
          </a>
        </li>
        <li>
          Front page animation created using
          <a href="https://codesandbox.io/s/typewriter-css-text-animation-ot3cc">
            Canva
          </a>
        </li>
        <li>
          Email verification structure
          <a href="https://github.com/cyber-wolve/AuthInMern/tree/Email-Verify-In-MERN">
            AuthInMern
          </a>
        </li>
        <li>
          Whiteboard base embed
          <a href="https://github.com/tldraw">
            tldraw
          </a>
        </li>
        <li>
          Whiteboard multi-user functionality
          <a href="https://github.com/nimeshnayaju/yjs-tldraw">
            yjs-tldraw
          </a>
        </li>
        <li>
          Help with workers (before lecture 12)
          <a href="https://javascript.plainenglish.io/web-worker-in-react-9b2efafe309c">
          Web workers in React
          </a>
        </li>
      </ul>
      {user ? (
        <Button variant="contained" onClick={() => navigate("/lobby")}>
          Back to Lobby
        </Button>
      ) : (
        <Button variant="contained" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      )}
    </div>
  );
};

export default Credits;