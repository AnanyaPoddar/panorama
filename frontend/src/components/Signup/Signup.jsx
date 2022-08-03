import React, { useEffect, useState } from "react";
import { Button, TextField, Input } from "@mui/material";
import validator from "validator";
import "../../components/Form.css";
import "./Signup.css";
import errorIcon from "../../assets/exclamation-mark.png";
import linkedinButton from "../../assets/linkedin-button.png";
import WorkerBuilder from "../CallSummary/WorkerBuilder";
import Worker from "../CallSummary/verificationWorker";

function Signup() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [firstname, setFname] = useState("");
  const [lastname, setLname] = useState("");
  const [dob, setDob] = useState("");
  const [img, setImg] = useState(null);
  const [newImg, setNewImg] = useState(null);

  const password2 = React.useRef(null);
  const password1 = React.useRef(null);
  const emailfield = React.useRef(null);
  const firstfield = React.useRef(null);
  const lastfield = React.useRef(null);
  const dobfield = React.useRef(null);

  const nextPage = e => {
    //Prevent page reload
    e.preventDefault();
    setSuccess(null);

    // check that a properly formatted email is given
    if (!validator.isEmail(email)) {
      setErrorMessage("Enter a valid email");
      return;
    }

    // check that password strength is good
    if (!validator.isStrongPassword(pass)) {
      setErrorMessage("Password too weak");
      return;
    }

    // check that passwords match
    if (pass2 !== pass) {
      setErrorMessage("Passwords do not match");
      return;
    }
    setErrorMessage(null);
    setPage(2);
  };

  const backPage = e => {
    setPage(1);
  };

  const handleSubmit = e => {
    //Prevent page reload
    e.preventDefault();
    setSuccess(null);

    // check firstname length
    if (firstname.length < 1) {
      setErrorMessage("Enter your first name");
      return;
    }

    if (lastname.length < 1) {
      setErrorMessage("Enter your last name");
      return;
    }

    // check dob format
    if (!validator.isDate(dob)) {
      setErrorMessage("Enter a valid date");
      return;
    }

    if (newImg == null) {
      setErrorMessage("Profile picture is missing");
      return;
    }

    setErrorMessage(null);

    let formdata = new FormData();
    formdata.append("identity", email.toLowerCase().trim());
    formdata.append("password", pass.trim());
    formdata.append("firstname", firstname.trim());
    formdata.append("lastname", lastname.trim());
    formdata.append("dob", dob);
    formdata.append("file", newImg);
    // Fetch call to sign user in
    fetch(`https://api.panoramas.social/api/users`, {
      method: "POST",
      body: formdata
    })
      .then(res => {
        if (res.status != 200) {
          if (res.status === 409) {
            setErrorMessage("This email has already been used");
            setPage(1);
          }
          if (res.status === 422) {
            setErrorMessage("Something is missing");
          }
        } else {
          setPage(1);
          setEmail("");
          setPass("");
          setPass2("");
          setFname("");
          setLname("");
          setDob("");
          setImg("");
          setNewImg("");
          return res.json();
        }
      })
      .then(json => {
        // create worker and use it to send a verification email
        setSuccess("Loading...");
        const worker = new WorkerBuilder(Worker);
        const emails = json.email;
        worker.postMessage({ emails });
        worker.onerror = err => err;
        worker.onmessage = e => {
          let { success, time } = e.data;
          if (success === "success") {
            setSuccess("Success! Check your email for a verification link.");
          }
          worker.terminate();
        };
      })
      .catch(error => {
        console.error("Error:", error);
      });
  };

  const changeImage = data => {
    let fileName = data.target.value;
    let extFile = fileName
      .substr(fileName.lastIndexOf(".") + 1, fileName.length)
      .toLowerCase();
    if (!["gif", "png", "jpeg", "jpg"].includes(extFile)) {
      setErrorMessage("File must be jpg/jpeg or png");
      return;
    }
    if (data.target.files[0].size / 1000 / 1000 > 2) {
      setErrorMessage("File must not exceed 2MB");
      return;
    }
    setErrorMessage("");
    setImg(URL.createObjectURL(data.target.files[0]));
    setNewImg(data.target.files[0]);
  };

  return (
    <div>
      {page == 1 ? (
        <div className="inner">
          <div className="page-heading">
            {" "}
            Get started in just a few simple steps.{" "}
          </div>
          <form onSubmit={nextPage} className="form">
            {errorMessage && (
              <p className="error">
                {" "}
                <img className="errorIcon" src={errorIcon}></img> {errorMessage}{" "}
              </p>
            )}
            {success && <p className="success"> {success} </p>}
            <br />
            <TextField
              variant="standard"
              placeholder="Enter email"
              inputRef={emailfield}
              value={email}
              inputProps={{ style: { fontSize: 20, fontFamily: "Avenir" } }}
              onChange={e => setEmail(e.target.value)}
            />
            <br />
            <TextField
              variant="standard"
              type="password"
              placeholder="Enter password"
              inputRef={password1}
              value={pass}
              inputProps={{ style: { fontSize: 20, fontFamily: "Avenir" } }}
              onChange={e => setPass(e.target.value)}
            />
            <br />
            <TextField
              variant="standard"
              type="password"
              inputRef={password2}
              placeholder="Confirm password"
              value={pass2}
              inputProps={{ style: { fontSize: 20, fontFamily: "Avenir" } }}
              onChange={e => setPass2(e.target.value)}
            />
            <br />
            <div className="pass-desc">
              Password must be at least 8 characters long, and contain at least
              one uppercase letter, one lowercase letter, one number, and one
              symbol.
            </div>
            <Button variant="outlined" type="submit">
              Next
            </Button>
            <br />
            <a href="https://api.panoramas.social/api/linkedin/auth">
              <img className="linkedinButton" src={linkedinButton} />
            </a>
          </form>
        </div>
      ) : (
        <div className="inner">
          <div className="page-heading">Let's get to know you better. </div>
          <form onSubmit={handleSubmit} className="form">
            {errorMessage && (
              <p className="error">
                {" "}
                <img className="errorIcon" src={errorIcon}></img> {errorMessage}{" "}
              </p>
            )}
            <TextField
              variant="standard"
              placeholder="Enter your first name"
              inputRef={firstfield}
              value={firstname}
              inputProps={{ style: { fontSize: 20, fontFamily: "Avenir" } }}
              onChange={e => setFname(e.target.value)}
            />
            <br />
            <TextField
              variant="standard"
              placeholder="Enter your last name"
              inputRef={lastfield}
              value={lastname}
              inputProps={{ style: { fontSize: 20, fontFamily: "Avenir" } }}
              onChange={e => setLname(e.target.value)}
            />
            <br />
            <TextField
              variant="standard"
              placeholder="Date of birth (yyyy/mm/dd)"
              value={dob}
              inputRef={dobfield}
              inputProps={{ style: { fontSize: 20, fontFamily: "Avenir" } }}
              onChange={e => setDob(e.target.value)}
            />
            <br />

            <div id="previewtext">Add a profile picture:</div>
            <img id="preview-dp" src={img} />
            <Button variant="contained" component="label">
              Upload File
              <input
                type="file"
                id="dp"
                accept="image/png, image/jpeg, image/jpg"
                hidden
                onChange={data => {
                  changeImage(data);
                }}
              />
            </Button>
            <br />
            <div className="btns">
              <div className="btn">
                <Button variant="outlined" onClick={backPage}>
                  Back
                </Button>
              </div>
              <div className="btn">
                <Button variant="outlined" className="btn" type="submit">
                  Sign up
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Signup;
