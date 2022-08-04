import AddIcon from "@mui/icons-material/Add";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import { TDExportType, Tldraw } from "@tldraw/tldraw";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { kanbanTemplate } from "../../assets/kanban.jsx";
import kanban from "../../assets/kanban.png";
import { mindmapTemplate } from "../../assets/mindmap.jsx";
import mindmap from "../../assets/mindmap.png";
import { useMultiplayerState } from "./useMultiplayerState";
import "./Whiteboard.css";

import { AuthContext } from "../../context/AuthProvider";

// functionality for help box popup
function HelpDialog(props) {
  const { onClose, open } = props;

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      className="helpbox"
      onClick={handleClose}
      onClose={handleClose}
      open={open}
    >
      <DialogTitle>Whiteboard Controls</DialogTitle>
      <div className="helptext">
        Use the tools in the bottom toolbar to add components to the whiteboard.
        To change the line colour or fill of a component, use the options in
        "Styles".
        <br />
        <br />
        Controls may differ depending on the device you are using.
        <br />
        To pan around the whiteboard: spacebar + drag OR trackpad scroll
        <br />
        To zoom in / out: mouse scroll wheel OR trackpad pinch
        <br />
        <br />
        <em>Click anywhere to go back</em>
      </div>
    </Dialog>
  );
}


// functionality for template popup - based on example from mui docs
function SimpleDialog(props) {
  const { onClose, template, open } = props;

  const handleClose = () => {
    onClose(template);
  };

  // change value of template based on what was clicked
  const handleListItemClick = (value) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Select Template</DialogTitle>
      <div className="cards">
        <Card
          className="card"
          sx={{ maxWidth: 345 }}
          onClick={() => handleListItemClick("mindmap")}
        >
          <CardMedia
            className="cardmedia"
            component="img"
            height="140"
            width="140"
            image={mindmap}
            alt="mindmap"
          />
          <CardContent>Mindmap</CardContent>
        </Card>
        <Card
          className="card"
          sx={{ maxWidth: 345 }}
          onClick={() => handleListItemClick("kanban")}
        >
          <CardMedia
            className="cardmedia"
            component="img"
            height="140"
            width="140"
            image={kanban}
            alt="kanban"
          />
          <CardContent>Kanban Board</CardContent>
        </Card>

        <Card
          className="card"
          sx={{ maxWidth: 345 }}
          onClick={() => handleListItemClick("new")}
        >
          <CardMedia className="addicon cardmedia">
            <AddIcon
              className="add-icon"
              style={{ fill: "#6a736e", height: 100, width: 100 }}
            />
          </CardMedia>
          <CardContent>Start Fresh</CardContent>
        </Card>
      </div>
    </Dialog>
  );
}


// actual whiteboard 
const Whiteboard = ({ roomId }) => {
  const { app, onMount, ...events } = useMultiplayerState(roomId);
  let [wbMount, setwbMount] = useState(null);
  const [open, setOpen] = React.useState(false); // only open for host for only new rooms
  const [helpOpen, setHelp] = React.useState(false); // initially help dialog closed
  const [choseTemplate, setChoseTemplate] = React.useState(false); // initially template not chosen
  const [template, setTemplate] = React.useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // check the host (only host can select template)
    fetch(`https://api.panoramas.social/api/room/${roomId}/host`, {
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (user.email === json.host) {
          // check that this isnt an old room
          fetch(`https://api.panoramas.social/api/room/${roomId}/completed`, {
            credentials: "include",
          }).then((res) => {
            if (res.status === 200) {
              setOpen(false);
              return res.json();
            } else if (res.status === 404) {
              setOpen(true);
            }
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // set value of template based on what was selected in 
  const handleClose = (value) => {
    setOpen(false);
    if (value === "mindmap") {
      setTemplate(mindmapTemplate);
    } else if (value === "kanban") {
      setTemplate(kanbanTemplate);
      setChoseTemplate(true);
    } else {
      setTemplate(null);
    }
  };

  const handleHelpClose = () => {
    setHelp(false);
  };

  useEffect(() => {
    if (wbMount === null) setwbMount({ onMount });
  });

  // exports an image through the TldrawApp api
  const handleExport = () => {
    app.exportImage(TDExportType.SVG, { scale: 1, quality: 1 });
  };

  // link the template to the room
  const mydoc = template;
  if (mydoc) {
    mydoc.id = roomId;
  }

  // configure the Tldraw app, embed it in the page, and add external buttons
  return (
    <div>
      {wbMount != null ? (
        <div>
          {template == null ? (
            <Tldraw
              showMenu={false}
              showMultiplayerMenu={false}
              showPages={false}
              onMount={onMount}
              id={roomId}
              {...events}
            />
          ) : (
            <Tldraw
              document={mydoc}
              showMenu={false}
              showMultiplayerMenu={false}
              showPages={false}
              onMount={onMount}
              {...events}
            />
          )}

          <div className="options">
            <Fab variant="extended" onClick={() => handleExport()}>
              {" "}
              Export
            </Fab>
          </div>
          <div className="dialog">
            <SimpleDialog
              template={template}
              open={open}
              onClose={handleClose}
            />
          </div>
          <div className="help">
            <Fab variant="extended" onClick={() => setHelp(true)}>
              {" "}
              Help
            </Fab>
          </div>
          <div className="dialog">
            <HelpDialog open={helpOpen} onClose={handleHelpClose} />
          </div>
        </div>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
};

export default Whiteboard;