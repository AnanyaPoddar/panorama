import { WebsocketProvider } from "y-websocket";
import * as yjs from "yjs";

// Create the doc
export const doc = new yjs.Doc();

export const roomID = `testroom`;

// Create a websocket provider
export const provider = new WebsocketProvider(
  "ws://localhost:1234",
  roomID,
  doc,
  {
    connect: true,
  }
);

// Export the provider's awareness API
export const awareness = provider.awareness;

export const yShapes = doc.getMap("shapes");
export const yBindings = doc.getMap("bindings");

// Create an undo manager for the shapes and binding maps
export const undoManager = new yjs.UndoManager([yShapes, yBindings]);
