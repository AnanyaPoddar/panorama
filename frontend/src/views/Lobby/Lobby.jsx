import { useContext } from "react";

import HostedRooms from "../../components/HostedRooms/HostedRooms";
import { AuthContext } from "../../context/AuthProvider";
import "./Lobby.css";

const Lobby = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      {user && (
        <div>
          <div className="lobby page">
            <HostedRooms />
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
