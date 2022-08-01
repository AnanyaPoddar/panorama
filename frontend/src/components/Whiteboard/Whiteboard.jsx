import * as React from 'react';
import { Tldraw, TldrawApp, TDExport, TDExportType } from "@tldraw/tldraw";
import { useMultiplayerState } from "./useMultiplayerState";
import { useEffect, useState, useCallback, useContext } from "react";
import Fab from '@mui/material/Fab';
import "./Whiteboard.css";
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { IconButton } from '@mui/material';
import mindmap from "../../assets/mindmap.png"
import kanban from "../../assets/kanban.png"
import { mindmapTemplate } from "../../assets/mindmap.jsx";
import { kanbanTemplate } from "../../assets/kanban.jsx";
import AddIcon from '@mui/icons-material/Add';

import { AuthContext } from "../../context/AuthProvider";

function SimpleDialog(props) {
  const { onClose, template, open } = props;

  const handleClose = () => {
    onClose(template);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Select Template</DialogTitle>
      <div className="cards">
        <Card className="card" sx={{ maxWidth: 345 }} onClick={() => handleListItemClick("mindmap")}>
          <CardMedia className="cardmedia"
            component="img"
            height="140"
            width="140"
            image={mindmap}
            alt="mindmap"
          />
          <CardContent>
            Mindmap
          </CardContent>
        </Card>
        <Card className="card" sx={{ maxWidth: 345 }} onClick={() => handleListItemClick("kanban")}>
          <CardMedia className="cardmedia"
            component="img"
            height="140"
            width="140"
            image={kanban}
            alt="kanban"
          />
          <CardContent>
            Kanban Board
          </CardContent>
        </Card>

        <Card className="card" sx={{ maxWidth: 345 }} onClick={() => handleListItemClick("new")}>
          <CardMedia className="addicon cardmedia">
            <AddIcon className="add-icon" style={{fill: '#6a736e', height: 100, width: 100}}/>
          </CardMedia>
          <CardContent>
            Start Fresh
          </CardContent>
        </Card>
      </div>
    </Dialog>
  );
}

const Whiteboard = ({ roomId }) => {
  const { app, onMount, ...events } = useMultiplayerState(roomId);
  let [wbMount, setwbMount] = useState(null);
  const [open, setOpen] = React.useState(false);       // only open for host for only new rooms,
  const [choseTemplate, setChoseTemplate] = React.useState(false);
  const [template, setTemplate] = React.useState(null)
  const [host, setHost] = useState("");
  const { user } = useContext(AuthContext);


  useEffect(() => {
    // set the host
    fetch(`http://localhost:5000/api/room/${roomId}/host`, {
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (user.email===json.host) {
          fetch(`http://localhost:5000/api/room/${roomId}/completed`, {
            credentials: "include",
          })
          .then((res) => {
            console.log(res.status);
            if (res.status == 200) {
              setOpen(false)
              return res.json();
            }
            else if (res.status==404) {
              setOpen(true);
            }
          })
        }
      })
    .catch((err) => console.log(err));
  }, []);

  const handleClose = (value) => {
    setOpen(false);
    if (value=="mindmap") {
      setTemplate(mindmapTemplate);
    }
    else if (value=="kanban") {
      setTemplate(kanbanTemplate);
      setChoseTemplate(true);
    }
    else {
      setTemplate(null);
    }
  };

  useEffect(() => {
    if (wbMount == null) setwbMount({ onMount });
  });

  const handleExport = () => {
    app.exportImage(TDExportType.SVG, { scale: 1, quality: 1 })
  }

  console.log(template);
  const mydoc = template;
  if (mydoc) {
    mydoc.id=roomId;
  }

  console.log(mydoc);
  return (
    <div>
      {wbMount != null ? (
        <div>
          {template==null ? (
            <Tldraw
            showMenu={false}
            showMultiplayerMenu={false}
            showPages={false}
            onMount={onMount}
            id = {roomId}
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
            <Fab variant="extended" onClick={() => handleExport()}> Export</Fab> 
          </div>
          <div className="dialog">
            <SimpleDialog
              template={template}
              open={open}
              onClose={handleClose}
            />
          </div>
        </div>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
  
};

export default Whiteboard;
