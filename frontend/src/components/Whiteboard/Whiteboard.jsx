import * as React from 'react';
import { Tldraw } from "@tldraw/tldraw";
import { useMultiplayerState } from "./useMultiplayerState";
import { useEffect, useState } from "react";
import Fab from '@mui/material/Fab';
import "./Whiteboard.css";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

const templates = ['Mindmap', 'Kanban'];

function SimpleDialog(props) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Select Template</DialogTitle>
        {templates.map((email) => (
          <ListItem button onClick={() => handleListItemClick(email)} key={email}>
            <ListItemText primary={email} />
          </ListItem>
        ))}
    </Dialog>
  );
}


const Whiteboard = ({ roomId }) => {
  const { onMount, ...events } = useMultiplayerState(roomId);
  let [wbMount, setwbMount] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
  };

  useEffect(() => {
    if (wbMount == null) setwbMount({ onMount });
    console.log(wbMount);
  });

  return (
    <div>
      {wbMount != null ? (
        <div>
          <Tldraw
            showMenu={false}
            showMultiplayerMenu={false}
            showPages={false}
            onMount={onMount}
            id = {roomId}
            {...events}
          />
          <div className="options">
            <Fab variant="extended" onClick={handleClickOpen}>
              Templates
            </Fab>
          </div>
          <div className="dialog">
            <SimpleDialog
              selectedValue={selectedValue}
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
