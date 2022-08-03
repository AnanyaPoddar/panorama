const express = require("express");
const { format } = require("util");
const nodemailer = require("nodemailer");
const http = require("http");
const uuid = require("uuid");
const getVideoToken = require("./generate-token");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fetch = require("node-fetch");
const Multer = require("multer");

const port = 5000;

const env = require("dotenv").config();
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "https://panoramas.social",
    methods: "GET,POST,PUT,DELETE, PATCH",
    credentials: true,
  })
);

//Again required for CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://panoramas.social");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

console.log(process.env.DATABASE_URL);

//middleware
const isAuthenticated = function (req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ errors: "Access Denied" });
  }
  next();
};

//Get the current user
app.get("/api/user", function (req, res) {
  if (req.session.user) {
    return res.status(200).json(req.session.user);
  } else {
    return res.status(200).json(null);
  }
});

// google cloud storage
const { Storage } = require("@google-cloud/storage");

// Instantiate a storage client
const storage = new Storage({
  projectId: "true-oasis-357701",
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mib,
  },
});

// A bucket is a container for objects (files).
const bucket = storage.bucket("oasis-panorama");

const server = http.createServer(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// database stuff
const mongoose = require("mongoose");
const mongoString = process.env.DATABASE_URL;
const users = require("./models/user");
const rooms = require("./models/room.js");
const token = require("./models/token.js");
const crypto = require("crypto");
const user = require("./models/user");

// in-memory storage for access tokens
const accessTokens = {};

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log("error is:" + error);
  console.error(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

//app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  console.log("HTTP request", req.session.user, req.method, req.url, req.body);
  next();
});

// get the current user of the app
app.get("/api/user", function (req, res) {
  if (req.session.user) {
    return res.status(200).json(req.session.user);
  } else {
    return res.status(200).json(null);
  }
});

//Check if room exists and is in progress
app.get("/api/room/:roomId", isAuthenticated, (req, res) => {
  client.video.v1
    .rooms(req.params.roomId)
    .fetch()
    .then((room) => res.status(200).send(JSON.stringify({ room: room })))
    .catch(() => {
      res.status(404).send(JSON.stringify({ err: "Room not found" }));
    });
});

// check completed rooms for a room
app.get("/api/room/:roomId/completed", isAuthenticated, (req, res) => {
  let found = false;
  client.video.v1.rooms
    .list({
      status: "completed",
    })
    .then((rooms) => {
      rooms.forEach((r) => {
        if (r.uniqueName === req.params.roomId) {
          found = true;
          client.video.v1
            .rooms(r.sid)
            .fetch()
            .then((room) => {
              return res.status(200).send(JSON.stringify({ room: room }));
            })
            .catch(() => {
              return res
                .status(500)
                .send(JSON.stringify({ err: "Room not found" }));
            });
        }
      });

      if (!found)
        return res.status(404).send(JSON.stringify({ err: "Room not found" }));
      return res.status(200).send(JSON.stringify({ message: "success" }));
    })
    .catch(() => {
      return res.status(500).send(JSON.stringify({ err: "Error" }));
    });
});

//Get all participants of a room (in-progress or completed)
app.get("/api/room/:roomId/participants", isAuthenticated, (req, res) => {
  const roomId = req.params.roomId;

  client.video.v1
    .rooms(roomId)
    .participants.list({ status: "connected" })
    .then((participants) => {
      const sendBack = [];
      participants.forEach((p) => {
        sendBack.push(p.identity);
      });
      return res.status(200).send(JSON.stringify({ data: sendBack }));
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify({ err: err }));
    });
});

//Get all whitelisted users of a room
app.get("/api/room/:roomId/whitelist", (req, res) => {
  rooms.findOne({ id: req.params.roomId }, function (err, room) {
    if (err) return res.status(500).send(err);
    if (room) {
      if (!room.whitelistedUsers.includes(req.query.identity))
        res.status(403).send(
          JSON.stringify({
            err: "Only whitelisted users can access this information",
          })
        );
      else {
        res.status(200).send(JSON.stringify({ room: room.whitelistedUsers }));
      }
    } else return res.status(404).send(JSON.stringify({ err: "Room not found" }));
  });
});

//end room, all connected participants will be disconnected; this is restricted to host of the room
app.delete("/api/room/:roomId", isAuthenticated, (req, res) => {
  rooms.findOne({ id: req.params.roomId }, function (err, room) {
    if (err) return res.status(500).send(err);
    if (room) {
      if (room.host !== req.session.user)
        res
          .status(403)
          .send(JSON.stringify({ err: "Only hosts can delete a room" }));
      else {
        client.video.v1
          .rooms(req.params.roomId)
          .update({ status: "completed" })
          .then((room) =>
            res.status(200).send(JSON.stringify({ room: room.uniqueName }))
          )
          .catch((err) => {
            res.status(500).send(JSON.stringify({ err: err }));
          });
      }
    } else return res.status(404).send(JSON.stringify({ err: "Room not found" }));
  });
});

//Remove participant from an in-progress room
app.delete(
  "/api/room/:roomId/participants/:participantName",
  isAuthenticated,
  (req, res) => {
    const roomId = req.params.roomId;
    const participant = req.params.participantName;
    rooms.findOne({ id: req.params.roomId }, function (err, room) {
      if (err) res.status(500).send(err);
      if (room) {
        if (room.host !== req.session.user)
          return res.status(403).send(
            JSON.stringify({
              err: "Only hosts can remove a participant from a room",
            })
          );
        else {
          client.video.v1
            .rooms(roomId)
            .participants(participant)
            .update({ status: "disconnected" })
            .then((p) => {
              res.status(200).send(
                JSON.stringify({
                  msg:
                    "Removed participant " + participant + " with sid " + p.sid,
                })
              );
            })
            .catch((err) => {
              res.status(500).send(JSON.stringify({ err: err }));
            });
        }
      } else res.status(404).send(JSON.stringify({ err: "Room not found" }));
    });
  }
);

//Get token to access existing room
app.post("/api/room/:roomId/token", isAuthenticated, (req, res) => {
  const roomId = req.params.roomId;
  const identity = req.session.user;
  const token = getVideoToken(identity, roomId);

  rooms.findOne({ id: roomId }, function (err2, data) {
    if (err2) res.status(500).send(JSON.stringify({ err: err2 }));
    if (data) {
      users.findOne({ email: identity }, function (err, user) {
        if (err) res.status(500).send(JSON.stringify({ err: err }));
        if (!user) return res.status(401).json({ err: "access denied" });
        data.save();
      });
      // return res.status(200).send(JSON.stringify({ token: token, id: roomId }));
    } else
      return res.status(404).send(JSON.stringify({ err: "Room not found" }));
  });
  res.status(200).send(JSON.stringify({ token: token, id: roomId }));
});

//Returns unique identifier for room, and identity associated with the created room is the host
app.post("/api/room", isAuthenticated, (req, res) => {
  const roomId = uuid.v4();
  const identity = req.session.user;
  // store room in database -> TO DO: fix so that this isnt upon generation, but upon host joining room
  rooms.create(
    { id: roomId, name: req.body.roomName, whitelistedUsers: req.body.users },
    function (err2, createdRoom) {
      if (err2) return res.status(500).send(JSON.stringify({ err: err2 }));
      users.findOne({ email: identity }, function (err, user) {
        if (err) return res.status(500).send(JSON.stringify({ err: err }));
        createdRoom.host = identity;
        createdRoom.save();
      });
    }
  );
  res.status(200).send(JSON.stringify({ id: roomId }));
});

// Upload file to the cloud
app.post("/api/upload", multer.single("file"), (req, res, next) => {
  // store file in bucket in google cloud
  if (!req.file) {
    res.status(200).json({ name: "none", url: "none" });
    return;
  }

  // Create a new blob in the bucket and upload the file data.

  // add random string to filename so that it doesnt get replaced
  let filenameOg = req.file.originalname.slice(
    0,
    req.file.originalname.lastIndexOf(".")
  );
  const ext = req.file.originalname.slice(
    req.file.originalname.lastIndexOf(".")
  );
  const filename = filenameOg + crypto.randomBytes(4).toString("hex") + ext;

  const blob = bucket.file(filename.replace(/\s+/g, ""));
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    return res.status(200).json({ url: publicUrl, name: filenameOg });
  });

  blobStream.end(req.file.buffer);
});

//Get the profile picture of the current logged-in user
app.get("/api/users/me/profilePic", function (req, res) {
  users.findOne({ email: req.session.user }, function (err3, user) {
    if (err3) return res.status(500).json({ re: "server", message: err3 });
    if (user) {
      return res.status(200).json({ image: user.dp });
    }
  });
});

// get summary data
app.get("/api/room/summary/:roomId", function (req, res) {
  client.video.v1.rooms
    .list({
      status: "completed",
    })
    .then((rooms) => {
      rooms.forEach((r) => {
        if (r.uniqueName === req.params.roomId) {
          const duration =
            "" +
            Math.trunc(r.duration / 60 / 60) +
            " hours, " +
            Math.trunc(r.duration / 60) +
            " minutes, " +
            (r.duration % 60) +
            " seconds";
          client.video.v1
            .rooms(r.sid)
            .participants.list()
            .then((participants) => {
              const sendBack = [];
              participants.forEach((p) => {
                if (!sendBack.includes(p.identity)) {
                  sendBack.push(p.identity);
                }
              });
              return res
                .status(200)
                .json({ duration: duration, participants: sendBack });
            })
            .catch(() => {
              return res
                .status(404)
                .send(JSON.stringify({ err: "Room not found" }));
            });
        }
      });
    })
    .catch(() => {
      return res.status(500).send(JSON.stringify({ err: "Error" }));
    });
});

// sign up route
app.post("/api/users", multer.single("file"), function (req, res, next) {
  // check for missing info
  if (!("identity" in req.body))
    return res.status(422).json({ re: "email", message: "email is missing" });
  if (!("password" in req.body))
    return res
      .status(422)
      .json({ re: "password", message: "password is missing" }); // to do: all errors in .json

  // store dp in bucket in google cloud
  if (!req.file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  const blob = bucket.file(req.file.originalname.replace(/\s+/g, ""));
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );

    let password = req.body.password;
    let email = req.body.identity;

    // check to see if email is already in use
    users.findOne(
      { isLinkedinUser: false, email: email },
      function (err3, user) {
        if (err3) return res.status(500).json({ re: "server", message: err3 });
        if (user) {
          return res.status(409).json({
            re: "email",
            message: "an account with this email already exists",
          });
        }
        // hash the password
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, function (err, hash) {
          // insert user
          users.create(
            {
              isLinkedinUser: false,
              password: hash,
              email: email,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              dob: req.body.dob,
              dp: publicUrl,
              isVerified: false,
            },
            function (err2, userCreated) {
              if (err2) return res.status(500).json({ err: err2 });
              req.session.user = userCreated.email;
              return res
                .status(200)
                .json({ message: "signup success", email: userCreated.email });
            }
          );
        });
      }
    );
  });

  blobStream.end(req.file.buffer);
});

// Login endpoint
app.post("/api/login", (req, res) => {
  if (!("identity" in req.body))
    return res.status(422).json({ re: "email", message: "email is missing" });
  if (!("password" in req.body))
    return res
      .status(422)
      .json({ re: "password", message: "password is missing" });

  let identity = req.body.identity;
  let password = req.body.password;

  // retrieve user from the database
  users.findOne(
    { isLinkedinUser: false, email: identity },
    function (err, user) {
      if (err) return res.status(500).json({ error: err });
      if (!user) return res.status(401).json({ error: "access denied" });
      if (!user.isVerified)
        return res.status(403).json({ error: "email not verified" });
      let hash = user.password;
      bcrypt.compare(password, hash, function (err, result) {
        if (!result) {
          return res.status(401).json({ error: "access denied" });
        }
        req.session.user = user.email;
        return res.status(200).json(user);
      });
    }
  );
});

// get list of users
app.get("/api/users", function (req, res, next) {
  users.find({}, function (err, users) {
    if (err) return res.status(500).json({ re: "server", message: err });
    return res.status(200).send({ users: users });
  });
});

// initialize linkedin strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_KEY,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: "https://api.panoramas.social/api/linkedin/auth/callback",
      scope: ["w_member_social", "r_emailaddress", "r_liteprofile"],
    },
    function (accessToken, refreshToken, profile, done) {
      accessTokens[profile.id] = accessToken;
      process.nextTick(function () {
        users
          .findOne({ isLinkedinUser: true, linkedinId: profile.id })
          .then((user) => {
            if (user) {
              //it checks if the user is saved in the database
              done(null, user);
            } else {
              users.create(
                {
                  isLinkedinUser: true,
                  linkedinId: profile.id,
                  email: profile.emails[0].value,
                  firstname: profile.name.givenName,
                  lastname: profile.name.familyName,
                },
                function (err2, userCreated) {
                  if (err2) return res.status(500).end(err2);
                  done(null, userCreated);
                }
              );
            }
          });
      });
    }
  )
);

// authenticate with linkedin
app.get(
  "/api/linkedin/auth",
  passport.authenticate("linkedin"),
  function (req, res) {}
);

// callback function for when authentication is completed
app.get(
  "/api/linkedin/auth/callback",
  passport.authenticate("linkedin", {
    successRedirect: "https://panoramas.social/signin",
    failureRedirect: "https://panoramas.social",
  })
);

// adds user id to the session
passport.serializeUser(function (user, done) {
  done(null, user._id);
});

// retrieves the user object
passport.deserializeUser(function (id, done) {
  users.findOne({ isLinkedinUser: true, _id: id }).then((user) => {
    if (user) {
      done(null, user);
    }
  });
});

// retrieve the user details for log in
app.get("/api/linkedin/auth/success", (req, res) => {
  if (!req.user) {
    return res.status(401).end("access denied");
  }
  req.session.user = req.user.email;
  users.findOne(
    { isLinkedinUser: true, _id: req.user._id },
    function (err, user) {
      if (err) return res.status(500).end(err);
      if (!user) return res.status(401).end("access denied");
      return res.status(200).json(user);
    }
  );
});

// clear out the session
app.get("/api/logout", (req, res) => {
  if (req.user && req.user.isLinkedinUser) {
    delete accessTokens[req.user.linkedinId];
  }
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    return res.status(200).send("logout is successful");
  });
});

app.post("/api/invite", (req, res) => {
  users.find({}, function (err, items) {
    users.findOne({ email: req.body.userEmail }, function (err2, user) {
      const linkedinUsers = user.isLinkedinUser
        ? items.filter(
            (user) => req.body.users.includes(user.email) && user.isLinkedinUser
          )
        : [];
      const panoramaUsers = items.filter(
        (user) => req.body.users.includes(user.email) && !user.isLinkedinUser
      );

      if (linkedinUsers.length) {
        let totalLength = 0;
        const annotations = [];
        linkedinUsers.forEach((item) => {
          let currLength = item.firstname.length + item.lastname.length + 1;
          totalLength += currLength + 1;
          annotations.push({
            entity: `urn:li:person:${item.linkedinId}`,
            length: currLength,
            start: totalLength - currLength - 1,
          });
        });

        let text = "";
        linkedinUsers.forEach((item) => {
          text += `${item.firstname} ${item.lastname} `;
        });
        text +=
          "Would you like to join me on a whiteboarding session on Panorama (panoramas.social)? Here's the room id: " +
          req.body.roomID;
        fetch(`https://api.linkedin.com/v2/shares`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessTokens[user.linkedinId],
          },
          body: JSON.stringify({
            distribution: {
              linkedInDistributionTarget: {},
            },
            owner: "urn:li:person:TUfYYAUNVP",
            subject: "Test Share Subject",
            text: {
              annotations: annotations,
              text: text,
            },
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((json) => {
            return;
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }

      panoramaUsers.forEach((item) => {
        const html = `<div>Hello ${item.firstname} ${item.lastname},<br/><br/>Would you like to join ${user.firstname} ${user.lastname} on a whiteboarding session on Panorama (<a href="panoramas.social">panoramas.social</a>)? Here's the room id: ${req.body.roomID}<br/><br/>Thank you,<br/><br/>Panorama Team<div>`;
        const mailData = {
          from: process.env.EMAIL,
          to: item.email,
          subject: `${item.firstname} ${item.lastname} | Invitation to Panorama Session From`,
          html: html,
        };

        transporter.sendMail(mailData, (error, info) => {
          if (error) {
            return res.status(500).json({ error: "Could not send" });
          }
        });
      });
    });
  });

  return res.status(200).send({ message: "Invitations are sent" });
});

app.post("/api/linkedin/post", (req, res) => {
  if (req.user && req.user.isLinkedinUser) {
    users.find({ isLinkedinUser: true }, function (err, users) {
      if (err) return res.status(500).end(err);

      const match = users.filter((user) => req.body.users.includes(user.email));

      if (match.length) {
        let totalLength = 0;
        const annotations = [];
        match.forEach((item) => {
          let currLength = item.firstname.length + item.lastname.length + 1;
          totalLength += currLength + 1;
          annotations.push({
            entity: `urn:li:person:${item.linkedinId}`,
            length: currLength,
            start: totalLength - currLength - 1,
          });
        });

        let text = "";
        match.forEach((item) => {
          text += `${item.firstname} ${item.lastname} `;
        });
        text +=
          "Would you like to join me on a whiteboarding session on Panorama (panoramas.social)? Here's the room id: " +
          req.body.roomID;

        fetch(`https://api.linkedin.com/v2/shares`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessTokens[req.user.linkedinId],
          },
          body: JSON.stringify({
            distribution: {
              linkedInDistributionTarget: {},
            },
            owner: "urn:li:person:TUfYYAUNVP",
            subject: "Test Share Subject",
            text: {
              annotations: annotations,
              text: text,
            },
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((json) => {
            return res.status(200).send({ message: "Invitations are sent" });
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    });
  }
});

app.post("/api/email/invite", (req, res) => {
  users.find({ isLinkedinUser: false }, function (err, items) {
    if (err) return res.status(500).end(err);

    const match = items.filter((item) => req.body.users.includes(item.email));
    users.findOne({ email: req.body.userEmail }, function (err2, user) {
      if (err2) return res.status(500).end(err2);
      match.forEach((item) => {
        const html = `<div>Hello ${item.firstname} ${item.lastname},<br/><br/>Would you like to join ${user.firstname} ${user.lastname} on a whiteboarding session on Panorama (<a href="panoramas.social">panoramas.social</a>)? Here's the room id: ${req.body.roomID}<br/><br/>Thank you,<br/><br/>Panorama Team<div>`;
        const mailData = {
          from: process.env.EMAIL,
          to: item.email,
          subject: `${item.firstname} ${item.lastname} | Invitation to Panorama Session From`,
          html: html,
        };

        transporter.sendMail(mailData, (error, info) => {
          if (error) {
            return res.status(500).json({ error: "Could not send" });
          }
        });
      });
      return res.status(200).send({ message: "Invitations are sent" });
    });
  });
});

server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

// email stuff
const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
  secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});

// send email to participants
app.post("/api/text-mail", function (req, res, next) {
  const { email, html } = req.body;
  const mailData = {
    from: process.env.EMAIL,
    to: email,
    subject: "Panorama video call summary",
    html: html,
  };

  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      return res.status(500).json({ error: "Could not send" });
    }
    return res
      .status(200)
      .send({ message: "Mail send", message_id: info.messageId });
  });
});

app.get("/api/room/:roomId/host", isAuthenticated, (req, res) => {
  rooms.findOne({ id: req.params.roomId }, function (err, room) {
    if (err) return res.status(500).send(err);
    if (room) {
      return res.status(200).send(JSON.stringify({ host: room.host }));
    } else return res.status(404).send(JSON.stringify({ err: "Room not found" }));
  });
});

app.post("/api/room/hosted", isAuthenticated, (req, res) => {
  const host = req.session.user;
  rooms.find({ host: host }, function (err, hostedRooms) {
    if (err) return res.status(500).send(err);
    const roomnames = [];
    const roomids = [];
    hostedRooms.forEach((r) => {
      roomnames.push(r.name);
      roomids.push(r.id);
    });
    return res.status(200).json({ names: roomnames, ids: roomids });
  });
});

// verify email
app.get("/api/:userId/verify/:token", (req, res) => {
  users.findOne({ _id: req.params.userId }, function (err, found) {
    if (err) return res.status(500).send({ error: "server issue" });
    if (!found) return res.status(400).send({ error: "Invalid link" });
    token.findOne(
      { user: found._id, token: req.params.token },
      function (err2, tok) {
        if (err2) return res.status(500).send({ error: "Server Issue" });
        if (!tok) return res.status(404).send({ error: "Invalid link" });
        found.isVerified = true;
        found.save();
        token.deleteOne({ token: req.params.token }, function (err3, tokfound) {
          if (err3) return res.status(500).send({ error: "Server Issue" });
          return res
            .status(200)
            .send({ message: "Email verified successfully" });
        });
      }
    );
  });
});

app.post("/api/verification-mail", (req, res) => {
  users.findOne({ email: req.body.identity }, function (err, userFound) {
    if (err) return res.status(500).json({ error: err });
    if (!userFound) return res.status(404).json({ error: "Not found" });

    token.create(
      { user: userFound._id, token: crypto.randomBytes(32).toString("hex") },
      function (err, tok) {
        const url = `https://panoramas.social/users/${userFound._id}/verify/${tok.token}`;
        const mailData = {
          from: process.env.EMAIL,
          to: userFound.email,
          subject: "Panorama verification",
          html: `Hello ${userFound.firstname}, <br/> Click on <a href= ${url}> this link </a> to verify your email.`,
        };

        transporter.sendMail(mailData, (error, info) => {
          if (error) {
            return res.status(500).json({ error: error });
          }
          return res.status(200).json({ message: "Email sent" });
        });
      }
    );
  });
});
