import { Alert, AlertTitle, Button } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";

import Whiteboard from "../Whiteboard/Whiteboard";
import "./Room.css";

const InactiveRoom = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [redirect, setRedirect] = useState(false);
  const [isHost, setIsHost] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/room/${id}/host`, {
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        //only the host of the room has access to it in its inactive state
        if (json.host !== user.name) {
          setIsHost(false);
          setTimeout(() => {
            setRedirect(true);
          }, 3000);
        }
      });
  }, []);

  return (
    <div className="room page inactive">
      <Whiteboard roomId={id} />
      <Button
        variant="contained"
        className="reactivate-btn"
        onClick={() => navigate(`/room/${id}`)}
      >
        Reactivate this Room
      </Button>
      {!isHost && (
        <div className="page protected">
          <Alert severity="error">
            <AlertTitle>403 - Forbidden</AlertTitle>
            This is an inactive room. Only the host of this room can access it.
            Redirecting to lobby...
          </Alert>
        </div>
      )}
      {redirect && <Navigate to="/lobby" />}
    </div>
  );
};

export default InactiveRoom;
