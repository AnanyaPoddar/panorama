const express = require("express");
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
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

//Again required for CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods",'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

//middleware
const isAuthenticated = function (req, res, next) {
  if (!req.session.user)
    return res.status(401).json({ errors: "Access Denied" });
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

const server = http.createServer(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// database stuff
const mongoose = require("mongoose");
const mongoString = process.env.DATABASE_URL;
const users = require("./models/user");
const rooms = require("./models/room.js");
const token = require("./models/token.js");
const crypto = require('crypto');
const user = require("./models/user");


mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
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
  console.log("HTTP request", (req.session.user), req.method, req.url, req.body);
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
app.get("/api/room/:roomId", (req, res) => {
  console.log(req.params.roomId);
  client.video.v1
    .rooms(req.params.roomId)
    .fetch()
    .then((room) => res.status(200).send(JSON.stringify({ room: room })))
    .catch(() => {
      res.status(404).send(JSON.stringify({ err: "Room not found" }));
    });
});

// check completed rooms
app.get("/api/room/:roomId/completed", (req, res) => {
  client.video.v1.rooms
          .list({
              status: 'completed'
            })
          .then(rooms => {
            rooms.forEach(r => {
            if (r.uniqueName===req.params.roomId) {
              client.video.v1.rooms(r.sid)
              .fetch()
              .then((room) => {
                res.status(200).send(JSON.stringify({ room: room }))
              })
              .catch(() => {
                return res.status(404).send(JSON.stringify({ err: "Room not found" }));
              });
            }
            });
          }).catch( () => {
            return res.status(500).send(JSON.stringify({ err: "Error" }));
          });
});

//Get the host of an existing room
app.get("/api/room/:roomId/host", (req, res) => {
  rooms.findOne({ id: req.params.roomId }, function (err, room) {
    if (err) return res.status(500).send(err);
    if (room) {
      return res.status(200).send(JSON.stringify({ host: room.host }));
    } else return res.status(404).send(JSON.stringify({ err: "Room not found" }));
  });
});

//Get all participants of a room (in-progress or completed)
app.get("/api/room/:roomId/participants", (req, res) => {
  const roomId = req.params.roomId;
  client.video.v1
    .rooms(roomId)
    .participants()
    .fetch()
    .then((participants) => {
      res.status(200).send(JSON.stringify({ data: participants }));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(JSON.stringify({ err: err }));
    });
});

//end room, all connected participants will be disconnected; this is restricted to host of the room
app.delete("/api/room/:roomId", (req, res) => {
  rooms.findOne({ id: req.params.roomId }, function (err, room) {
    if (err) return res.status(500).send(err);
    if (room) {
      //TODO: For security, do 2 checks: the room.host should match the hostname passed in from the frontend, and should also be equivalent to the identity of the current logged in user
      if (room.host !== req.body.identity)
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
app.delete("/api/room/:roomId/participants/:participantName", (req, res) => {
  const roomId = req.params.roomId;
  const participant = req.params.participantName;
  rooms.findOne({ id: req.params.roomId }, function (err, room) {
    if (err) res.status(500).send(err);
    if (room) {
      //TODO: For security, do 2 checks: the room.host should match the hostname passed in from the frontend, and should also be equivalent to the identity of the current logged in user
      if (room.host !== req.body.identity)
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
});

//Get token to access existing room
app.post("/api/room/:roomId/token", (req, res) => {
  const roomId = req.params.roomId;
  const identity = req.body.identity;
  const token = getVideoToken(identity, roomId);

  rooms.findOne({ id: roomId }, function (err2, data) {
    if (err2) res.status(500).send(JSON.stringify({ err: err2 }));
    if (data) {
      users.findOne({ email: identity }, function (err, user) {
        if (err) res.status(500).send(JSON.stringify({ err: err }));
        if (!user) return res.status(401).json({err: "access denied"});
        data.save();
      });
    }
      else return res.status(404).send(JSON.stringify({ err: "Room not found" }));
  });
  res.status(200).send(JSON.stringify({ token: token, id: roomId }));
});

//Returns unique identifier for room, and identity associated with the created room is the host
app.post("/api/room", (req, res) => {
  const roomId = uuid.v4();
  const identity = req.body.identity;
  console.log(identity);
  // store room in database -> TO DO: fix so that this isnt upon generation, but upon host joining room
  rooms.create({ id: roomId, name: req.body.roomName}, function (err2, createdRoom) {
    console.log(err2);
    if (err2) return res.status(500).send(JSON.stringify({ err: err2 }));
    users.findOne({ email: identity }, function (err, user) {
      if (err) return res.status(500).send(JSON.stringify({ err: err }));
      createdRoom.host = identity;
      createdRoom.save();
    });
  });
  res.status(200).send(JSON.stringify({ id: roomId }));
});

//Return all the rooms that a user is host of
app.post("/api/room/hosted", (req, res) => {
  const host = req.body.identity;
  rooms.find({host: host}, function (err, hostedRooms) {
    if (err) return res.status(500).send(err);
    const roomnames = [];
    const roomids = [];
    hostedRooms.forEach(r => {
      roomnames.push(r.name);
      roomids.push(r.id)
    });
    return res.status(200).json({names: roomnames, ids: roomids});
  });
});


// sign up route
app.post("/api/users", function (req, res, next) {
  // check for missing info
  if (!("identity" in req.body))
    return res.status(422).json({re: "email", message: "email is missing"});
  if (!("password" in req.body))
    return res.status(422).json({re: "password", message: "password is missing"}); // to do: all errors in .json

  let password = req.body.password;
  let email = req.body.identity;

  // check to see if email is already in use
  users.findOne(
    { isLinkedinUser: false, email: email },
    function (err3, user) {
      if (err3) return res.status(500).json({re: "server", message: err3});
      if (user) {
        return res.status(409).json({re: "email", message: "an account with this email already exists"});
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
            dp: null,
            isVerified: false
          },
          function (err2, userCreated) {
            if (err2) return res.status(500).json({err: err2});
            req.session.user = userCreated.email;
            return res.status(200).json({ message: "signup success", email: userCreated.email});
          }
        );
      });
    }
  );
});

// Login endpoint
app.post("/api/login", (req, res) => {
  if (!("identity" in req.body))
    return res.status(422).json({re: "email", message: "email is missing"});
  if (!("password" in req.body))
    return res.status(422).json({re: "password", message: "password is missing"});

  let identity = req.body.identity;
  let password = req.body.password;

  // retrieve user from the database
  users.findOne(
    { isLinkedinUser: false, email: identity },
    function (err, user) {
      if (err) return res.status(500).json({error: err});
      if (!user) return res.status(401).json({error: "access denied"});
      if (!user.isVerified) return res.status(403).json({error: "email not verified"});
      let hash = user.password;
      bcrypt.compare(password, hash, function (err, result) {
        if (!result) {
          return res.status(401).json({error: "access denied"});
        }
        req.session.user = user.email;
        return res.status(200).json(user);
      });
    }
  );
});

// get room participants
/*app.get("/api/room/:roomId/participants", (req, res) => {
  rooms.findOne({ id: req.params.roomId }, function (err, data) {
    if (err) return res.status(500).send(JSON.stringify({ err: err }));
    return res.status(200).send(
      JSON.stringify({
        
      })
    );
  });
});*/

// email verification

// initialize linkedin strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_KEY,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL:
        "http://" + process.env.HOST + ":5000/api/linkedin/auth/callback",
      scope: ["w_member_social", "r_emailaddress", "r_liteprofile"],
    },
    function (accessToken, refreshToken, profile, done) {
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
                  lastname: profile.name.familyName
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
    successRedirect: "http://" + process.env.HOST + ":3000/signin",
    failureRedirect: "/api/linkedin/auth/failure",
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
  users.findOne(
    { isLinkedinUser: true, _id: req.user._id },
    function (err, user) {
      if (err) return res.status(500).end(err);
      if (!user) return res.status(401).end("access denied");
      return res.status(200).json(user);
    }
  );
});

// redirect for authentication failure
app.get("/api/linkedin/auth/failure", (req, res) => {
  return res.send("Failed to authenticate..");
});

// clear out the session
app.get("/api/logout", (req, res) => {
  req.session.destroy();
  return res.status(200).send("logout is successful");
});

// email stuff
server.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
  console.log(process.env.EMAIL);
});

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
      return console.log(error);
    }
    return res.status(200).send({ message: "Mail send", message_id: info.messageId });
  });
});

// verify email 
app.get("/api/:userId/verify/:token", (req, res) => {
  users.findOne({_id: req.params.userId}, function (err, found) {
    if (err) return res.status(500).send({error: "server issue"});
    if (!found) return res.status(400).send({ error: "Invalid link" });
    token.findOne({user: found._id, token: req.params.token}, function (err2, tok) {
      if (!tok) return res.status(400).send({ error: "Invalid link" });
      found.isVerified=true;
      found.save();
    });
    token.deleteOne({token: req.params.token}, function (err, tokfound) {
      if (!tokfound) return res.status(404).send({ error: "Invalid link" });
    });
    return res.status(200).send({ message: "Email verified successfully" });
  });
});


app.post("/api/verification-mail", (req, res) => {
  users.findOne({email: req.body.identity}, function (err, userFound) {
    if (err) return res.status(500).json({error: err});
    if (!userFound) return res.status(404).json({error: "Not found"});

    token.create({user: userFound._id, token: crypto.randomBytes(32).toString("hex")}, function (err, tok) {
      const url = `http://localhost:3000/users/${userFound._id}/verify/${tok.token}`
      const mailData = {
        from: process.env.EMAIL,
        to: userFound.email,
        subject: "Panorama verification",
        html: `Hello ${userFound.firstname}, <br/> Click on <a href= ${url}> this link </a> to verify your email.`,
      };
    
      transporter.sendMail(mailData, (error, info) => {
        if (error) {
          return res.status(500).json({error: error});
        }
      else return res.status(200).json({message: "Email sent"});
      });
    });
  });
});