import { Cancel } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";

import WorkerBuilder from "../CallSummary/WorkerBuilder";
import Worker from "../CallSummary/worker";

const HostControls = ({ id }) => {
  const { user } = useContext(AuthContext);

  //only available for the host, when they wish to end the call they must confirm
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [participants, setParticipants] = useState("");

  //TODO: Change API call to not pass in identity through body
  const endCall = () => {
    /*fetch(`http://localhost:5000/api/room/${id}/participants`)
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      setParticipants(json);
    });*/

    fetch(`http://localhost:5000/api/room/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identity: user.email,
      }),
    }).then((res) => {
      //only send the summary if the call was successfully ended
      if (res.status === 200) sendSummary();
    });
  };

  const sendSummary = () => {
    
        const worker = new WorkerBuilder(Worker);
        const emails = ['mushtaq.sara62@gmail.com'];
        const names = ["Hi"];
        const type = "summary";
        worker.postMessage({ emails, names, type });
        worker.onerror = (err) => err;
        worker.onmessage = (e) => {
          worker.terminate();
        };
  };

  return (
    <>
      <Tooltip title="End Room for All">
        <IconButton
          variant="contained"
          color="error"
          onClick={() => setOpenConfirmation(true)}
        >
          <Cancel />
        </IconButton>
      </Tooltip>
      <Dialog
        open={openConfirmation}
        onClose={() => setOpenConfirmation(false)}
      >
        <DialogTitle className="error">
          {"Are you sure you want to end the room?"}
        </DialogTitle>
        <DialogContent>
          <p>
            All participants will be removed from the call and lose access to
            this workspace.
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="success"
            onClick={() => setOpenConfirmation(false)}
          >
            Take Me Back
          </Button>
          <Button variant="outlined" color="error" onClick={endCall} autoFocus>
            End this Room
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HostControls;
