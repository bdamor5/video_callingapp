// const express = require('express')
// const app = express();

const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors')

const io = require('socket.io')(server , {
    cors : {
        origin : '*',
        methods : ["GET" , "POST"]
    }
})

app.use(cors())

const PORT = process.env.PORT || 5000;

app.get("/" , (req,res) =>{
    res.send('server is running')
})

io.on('connection' , (socket) =>{
    socket.emit('me' , socket.id);

    socket.on('disconnect' , () =>{
        socket.broadcast.emit("callended")
    })

    socket.on("calluser" , ({userToCall , signalData , from , name}) =>{
        io.to(userToCall).emit("calluser", {signal : signalData , from , name});
    })

    socket.on("answercall" , (data) =>{
        io.to(data.to).emit("callaccepted" , data.signal)
        //in the frontend , in SocketContext.js line 81
        //data.to will contain call.from , which contains the info about the user who made the call
    })
})

server.listen(PORT , () =>{
    console.log(`listening on port : ${PORT}`)
})

 
