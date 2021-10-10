import React, { useContext } from "react";
import { Button } from "@material-ui/core";

import { SocketContext } from "../SocketContext";

const Notifications = () => {
  const { answerCall, call, callAccepted } = useContext(SocketContext);

  return (
    <>
      {call.isReceivedCall && !callAccepted && ( //initially callAccepted will be false and will show this div
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h1 style={{marginRight:10}}>{call.name} is calling...</h1>
          <Button variant="contained" color="primary" onClick={answerCall}> 
          {/* onClick={answerCall} - will set callAccepted to true and notification will not be shown */}
            Answer
          </Button>
        </div>
      )}
    </>
  );
};

export default Notifications;
