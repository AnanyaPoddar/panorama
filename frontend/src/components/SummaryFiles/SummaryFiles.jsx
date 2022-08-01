import React, { useEffect, useState } from "react";
import { Button, TextField, Input } from "@mui/material";
import "../../components/Form.css";
import errorIcon from "../../assets/exclamation-mark.png";
import WorkerBuilder from "../CallSummary/WorkerBuilder";
import Worker from '../CallSummary/worker';
import './SummaryFiles.css'

function SummaryFiles() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState("");


  const handleSubmit = (e) => {
    //Prevent page reload
    e.preventDefault();
    //setSuccess(null);
    setErrorMessage(null);

    let formdata = new FormData();
    if(file == null){
      return;
      /// navigate to lobby
    }
    formdata.append("file", file);
    console.log(formdata);
    // Fetch call to add files to the cloud
    fetch(``, {
      method: "POST",
      body: formdata,
    })
      .then((res) => {
        if (res.status == 200) {
          setFileName("");
          setFile(null);
          return res.json();
        };
      }).then((json) => {
        // worker stuff from room
          let {success, time} = e.data;
          if (success==="success") {
            // navigate to lobby
          }
       })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const changeFile = (data) =>{

    if (data.target.files[0]) {
      console.log(data.target.files[0]);
      if (data.target.files[0].size / 1000 / 1000 > 5) {
        setErrorMessage("File must not exceed 5MB");
        return;
      }
      setErrorMessage("");
      let fname = data.target.value;
      setSuccess(fname.slice(fname.lastIndexOf("\\")+1) + " has been successfully saved");
      setFile(data.target.files[0]);
    }
  }

  return (
      <div className = "inner">
          <div className = "page-heading">Would you like to add a file to the summary? </div>
          <div>For example, the exported whiteboard drawing or a meeting minutes document. </div>
          <form onSubmit={handleSubmit} className="form">
            {errorMessage && (
              <p className="error" > <img className="errorIcon" src={errorIcon}></img> {errorMessage} </p>
            )}
            {success && (
              <p className="success"> {success} </p>
            )}
              <Button
                variant="contained"
                component="label"
              >
                Upload File
                <input
                  type="file"
                  id="file-upload"
                  hidden
                  onChange={(data) =>{changeFile(data)}}
                />
              </Button>
            <br />
            <div className="btns">
              <div className="btn">
              <Button variant="outlined" className="btn" type="submit">
                Send Summary                
              </Button>
              </div>
            </div>
          </form>
      </div>
  );
}

export default SummaryFiles;