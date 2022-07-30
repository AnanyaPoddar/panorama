import React from "react";

const Credits = () => {
  return (
    <div className="page">
      <h1>Credits</h1>
      <h2>HTML, CSS and Javascript code</h2>
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
      </ul>
    </div>
  );
};

export default Credits;
