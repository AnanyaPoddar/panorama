import { useContext, useState, useEffect } from "react";

import { AuthContext } from "../../context/AuthProvider";
import "./Lobby.css";
import HostedRooms from "../../components/HostedRooms/HostedRooms";

const Lobby = () => {
  const {user} = useContext(AuthContext)

  return (
    <div>
      {user && (
        <div>
          <div className="lobby page">
            <HostedRooms/>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
