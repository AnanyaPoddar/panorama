import React, { useEffect, useState, useContext } from "react";
import { Button, TextField, Input, Alert, AlertTitle } from "@mui/material";
import "../../components/Form.css";
import errorIcon from "../../assets/exclamation-mark.png";
import WorkerBuilder from "../CallSummary/WorkerBuilder";
import Worker from "../CallSummary/summaryWorker";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthProvider";
import "./SummaryFiles.css";

function SummaryFiles() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const { user } = useContext(AuthContext);

  const [redirect, setRedirect] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://api.panoramas.social/api/room/${id}/host`, {
      credentials: "include"
    })
      .then(res => {
        return res.json();
      })
      .then(json => {
        //only the host of the room has access to it in its inactive state
        if (json.host !== user.email) {
          setIsHost(false);
          setTimeout(() => {
            setRedirect(true);
          }, 3000);
        }
      });
  }, []);

  const handleSubmit = e => {
    //Prevent page reload
    e.preventDefault();
    //setSuccess(null);
    setErrorMessage(null);

    let formdata = new FormData();
    if (file != null) {
      formdata.append("file", file);
    }

    // Fetch call to add files to the cloud and return a url to the file
    fetch(`https://api.panoramas.social/api/upload`, {
      method: "POST",
      body: formdata,
      credentials: "include"
    })
      .then(res => {
        if (res.status == 200) {
          setFileName("");
          setFile(null);
          return res.json();
        }
      })
      .then(json => {
        // worker stuff
        const fileData = json;
        const worker = new WorkerBuilder(Worker);
        worker.postMessage({ fileData, id });
        worker.onerror = err => err;
        worker.onmessage = e => {
          worker.terminate();
          let { success, time } = e.data;
          if (success != "success") {
            console.error(success);
          }
          // navigate to lobby
          setTimeout(() => {
            navigate("/lobby");
          }, 5000);
          setAlertMsg(
            "Summary has been sent to participant emails. Redirecting to lobby..."
          );
        };
      })
      .catch(error => {
        console.error("Error:", error);
      });
  };

  const changeFile = data => {
    if (data.target.files[0]) {
      if (data.target.files[0].size / 1000 / 1000 > 5) {
        setErrorMessage("File must not exceed 5MB");
        return;
      }
      setErrorMessage("");
      let fname = data.target.value.replace(/\s+/g, "");
      setSuccess(
        fname.slice(fname.lastIndexOf("\\") + 1) +
          " has been successfully saved"
      );
      setFile(data.target.files[0]);
    }
  };

  return (
    <div className="inner">
      <div className="page-heading">
        Would you like to add a file to the summary?{" "}
      </div>
      <div>
        For example, the exported whiteboard drawing or a meeting minutes
        document.{" "}
      </div>
      <form onSubmit={handleSubmit} className="form">
        {errorMessage && (
          <p className="error">
            {" "}
            <img className="errorIcon" src={errorIcon}></img> {errorMessage}{" "}
          </p>
        )}
        {success && <p className="success"> {success} </p>}
        <Button variant="contained" component="label">
          Upload File
          <input
            type="file"
            id="file-upload"
            hidden
            onChange={data => {
              changeFile(data);
            }}
          />
        </Button>
        <br />
        <div className="btns">
          <div className="btn">
            <Button variant="outlined" className="btn" type="submit">
              Send Summary & Return to Lobby
            </Button>
          </div>
          <br />
          <div className="btn">
            <Button
              variant="outlined"
              className="btn"
              onClick={() => navigate(`/room/inactive/${id}`)}
            >
              Back to Board
            </Button>
            {!isHost && (
              <div className="page protected">
                <Alert severity="error">
                  <AlertTitle>403 - Forbidden</AlertTitle>
                  This is an inactive room. Only the host of this room can
                  access it. Redirecting to lobby...
                </Alert>
              </div>
            )}
            {redirect && <Navigate to="/lobby" />}
          </div>
          {alertMsg !== "" && (
            <Alert className="alert" severity="success">
              {alertMsg}
            </Alert>
          )}
        </div>
      </form>
    </div>
  );
}

export default SummaryFiles;
