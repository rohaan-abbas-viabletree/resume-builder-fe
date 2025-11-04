// @flow
import SocketIOClient from "socket.io-client";

let isConnectedWithSocket = false;
// const LOG = process.env.REACT_APP_ENV === DEV_ENV;
const LOG = true;

class SocketIO {
  _appToken = "";

  connect(connectCallBack, connectionErrorCallBack = undefined) {
    this.socket = SocketIOClient(process.env.NEXT_PUBLIC_BASE_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    if (!isConnectedWithSocket) {
      this.socket.on("connect_error", () => {
        if (LOG) {
          console.error("❌ Socket connect error");
        }
        if (connectionErrorCallBack) {
          connectionErrorCallBack();
        }
      });

      this.socket.on("connect", (cc) => {
        console.log({ cc });

        isConnectedWithSocket = true;

        this.socket.off("ping");
        this.socket.on("ping", () => {});
        this.socket.off("pong");
        this.socket.on("pong", () => {});

        if (LOG) {
          console.log("✅ Socket connected");
        }

        if (connectCallBack) {
          connectCallBack();
        }
      });
    } else if (connectCallBack) {
      connectCallBack();
    }

    this.socket.on("errormessage", (data) => {
      isConnectedWithSocket = false;
      if (LOG) {
        console.error("❌ Socket error message:", data);
      }
      if (connectionErrorCallBack) {
        connectionErrorCallBack();
      }
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }

  // ------------------ EMITS ------------------

  emit(...args) {
    this.socket.emit(...args);
  }

  joinRoom(roomId, callback = this._appToken, roomOptions = {}) {
    this.socket.emit("join", roomId, roomOptions, (joinError, joinSuccess) => {
      if (callback) callback(joinError, joinSuccess);
    });
  }

  // ------------------ LISTENERS ------------------

  stillConnected(callback) {
    this.socket.off("stillConnected");
    this.socket.on("stillConnected", (data) => {
      if (LOG) {
        console.log("🔄 Still connected:", data);
      }
      if (callback) {
        callback(data);
      }
    });
  }
  onMessage(callback) {
    this.socket.off("message");
    this.socket.on("message", (data) => {
      if (LOG) {
        console.log("🔄 Message:", data);
      }
      if (callback) {
        callback(data);
      }
    });
  }

  onDisconnect(callback) {
    this.socket.on("disconnect", () => {
      isConnectedWithSocket = false;
      if (LOG) {
        console.log("🔌 Socket disconnected");
      }
      if (callback) {
        callback();
      }
    });
  }

  onConnect(callback) {
    this.socket.on("connect", (val) => {
      console.log({ val });

      isConnectedWithSocket = true;
      if (LOG) {
        console.log("🔗 Socket connected");
      }
      if (callback) {
        callback();
      }
    });
  }

  // ------------------ NEW: GENERIC LISTENER ------------------

  on(event, callback) {
    if (!this.socket) return;
    this.socket.off(event); // avoid duplicate listeners
    this.socket.on(event, callback);
  }

  // ------------------ NEW: SPECIFIC NOTIFICATION LISTENERS ------------------
}

export default new SocketIO();
