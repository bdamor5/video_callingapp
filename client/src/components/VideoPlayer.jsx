import React, { useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, Paper } from "@material-ui/core";

import { SocketContext } from "../SocketContext";

const useStyles = makeStyles((theme) => ({
  video: {
    width: "550px",
    [theme.breakpoints.down("xs")]: {
      width: "300px",
    },
  },
  gridContainer: {
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  paper: {
    padding: "10px",
    border: "2px solid white",
    margin: "10px",
  },
}));

const VideoPlayer = () => {
  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } =
    useContext(SocketContext);

  const classes = useStyles();

  return (
    <Grid container className={classes.gridContainer}>
      {/* our own video */}
      {stream && ( //if our own stream is present , then show our stream
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {name || "Name"} 
              {/* our name */}
            </Typography>
            <video
              playsInline
              muted
              ref={myVideo} //our video stream
              autoPlay
              className={classes.video}
            />
          </Grid>
        </Paper>
      )}

      {/* user's video */}
      {callAccepted && !callEnded && (  //if call is accepted & call didnt end then show user's stream
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {call.name || "Name"}
              {/* user's name */}
            </Typography>
            <video
              playsInline
              ref={userVideo} //user's video stream
              autoPlay
              className={classes.video}
            />
          </Grid>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;
