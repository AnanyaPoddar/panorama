// obtained from https://github.com/nimeshnayaju/yjs-tldraw
import { TldrawApp } from "@tldraw/tldraw";
import { useCallback, useEffect, useState } from "react";
import { Room } from "@y-presence/client";
import { WebsocketProvider } from "y-websocket";
import * as yjs from "yjs";

export function useMultiplayerState(roomId) {
  // Create the doc
  const doc = new yjs.Doc();

  // Create a websocket provider
  const provider = new WebsocketProvider("ws://localhost:1234", roomId, doc, {
    connect: true,
  });

  provider.on("status", event => {
    console.log(event.status);
  })

  // Export the provider's awareness API
  const awareness = provider.awareness;

  const room = new Room(awareness, {});

  const yShapes = doc.getMap("shapes");
  const yBindings = doc.getMap("bindings");

  // Create an undo manager for the shapes and binding maps
  const undoManager = new yjs.UndoManager([yShapes, yBindings]);

  const [app, setApp] = useState(new TldrawApp());
  const [loading, setLoading] = useState(true);

  const onMount = useCallback(
    app2 => {
      app2.loadRoom(roomId);
      app2.pause();
      setApp(app2);
    },
    [roomId]
  );

  const onChangePage = useCallback((app2, shapes, bindings) => {
    undoManager.stopCapturing();
    doc.transact(() => {
      Object.entries(shapes).forEach(([id, shape]) => {
        if (!shape) {
          yShapes.delete(id);
        } else {
          yShapes.set(shape.id, shape);
        }
      });
      Object.entries(bindings).forEach(([id, binding]) => {
        if (!binding) {
          yBindings.delete(id);
        } else {
          yBindings.set(binding.id, binding);
        }
      });
    });
  }, []);

  const onUndo = useCallback(() => {
    undoManager.undo();
  }, []);

  const onRedo = useCallback(() => {
    undoManager.redo();
  }, []);

  /**
   * Callback to update user's (self) presence
   */
  const onChangePresence = useCallback((app, user) => {
    if (!app.room) return;
    room.setPresence({ id: app.room.userId, tdUser: user });
  }, []);

  /**
   * Update app users whenever there is a change in the room users
   */
  useEffect(() => {
    if (!app || !room) return;

    const unsubOthers = room.subscribe("others", users => {
      if (!app.room) return;

      const ids = users
        .filter(user => user.presence && user.presence.tdUser)
        .map(user => user.presence.tdUser.id); // fix check if null

      // remove any user that is not connected in the room
      Object.values(app.room.users).forEach(user => {
        if (user && !ids.includes(user.id) && user.id !== app.room?.userId) {
          app.removeUser(user.id);
        }
      });

      app.updateUsers(
        users
          .filter(user => user.presence && user.presence.tdUser)
          .map(other => other.presence.tdUser)
          .filter(Boolean)
      );
    });

    return () => {
      unsubOthers();
    };
  }, [app]);

  useEffect(() => {
    if (!app) return;

    function handleDisconnect() {
      provider.disconnect();
    }

    window.addEventListener("beforeunload", handleDisconnect);

    function handleChanges() {
      app?.replacePageContent(
        Object.fromEntries(yShapes.entries()),
        Object.fromEntries(yBindings.entries()),
        {}
      );
    }

    async function setup() {
      yShapes.observeDeep(handleChanges);
      handleChanges();
      setLoading(false);
    }

    setup();

    return () => {
      window.removeEventListener("beforeunload", handleDisconnect);
      yShapes.unobserveDeep(handleChanges);
    };
  }, [app]);

  return {
    app,
    onMount,
    onChangePage,
    onUndo,
    onRedo,
    loading,
    onChangePresence
  };
}
