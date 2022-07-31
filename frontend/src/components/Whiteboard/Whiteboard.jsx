import * as React from 'react';
import { Tldraw, TldrawApp } from "@tldraw/tldraw";
import { useMultiplayerState } from "./useMultiplayerState";
import { useEffect, useState } from "react";
import Fab from '@mui/material/Fab';
import "./Whiteboard.css";
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import mindmap from "../../assets/mindmap.png"
import kanban from "../../assets/kanban.png"
import { mindmapTemplate } from "../../assets/mindmap.jsx";
import { kanbanTemplate } from "../../assets/kanban.jsx";

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
          <CardMedia
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
          <CardMedia
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
      </div>
    </Dialog>
  );
}
const Whiteboard = ({ roomId }) => {
  const { onMount, ...events } = useMultiplayerState(roomId);
  let [wbMount, setwbMount] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [template, setTemplate] = React.useState(null)

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    if (value=="mindmap") {
      setTemplate(mindmapTemplate);
    }
    else if (value=="kanban") {
      setTemplate(kanbanTemplate);
    }
  };

  useEffect(() => {
    if (wbMount == null) setwbMount({ onMount });
  });

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
          {template==null? (
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
            <Fab variant="extended" onClick={handleClickOpen}>
              Templates
            </Fab>
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
