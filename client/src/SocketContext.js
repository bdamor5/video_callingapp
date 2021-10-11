import React , {createContext , useState , useRef , useEffect} from 'react';
import {io} from 'socket.io-client'
import Peer from 'simple-peer'

const SocketContext = createContext();
//created our context

const socket = io('http://localhost:5000');
//passing the server url so that client socket will get to know where the server is

const ContextProvider = ({children}) =>{

    const [stream , setStream] = useState() 
    //will store current stream of the user when they allow audio and video
    
    const [me , setMe] = useState('')
    //will store socket.id , from me event


    const [call , setCall] = useState({})
    //will store values from calluser event


    const [callAccepted , setCallAccepted] = useState(false)
    //inside answerCall() 
    
    
    const [callEnded , setCallEnded] = useState(false)
     //inside leaveCall()
    
    const [name , setName] = useState('')

    const myVideo = useRef() 
    //will hold the current stream 
    //useRef is the React way of accessing the DOM elements. What it does is, creating a plain JavaScript object that holds some properties such as current and it’s useful for keeping any mutable value inside. The difference from a pure object is it gives you the same ref object on every render.
    
    const userVideo = useRef()
    //will hold the other user's stream

    
    const connectionRef = useRef()
    //connectionRef will contain the current peer
    
    useEffect(() =>{
        //as soon as the page loads , we want the permission to access audio & video from the user

        navigator.mediaDevices.getUserMedia({video:true , audio:true})
        //navigator.mediaDevices() - Returns a reference to a MediaDevices object which can then be used to get information about available media devices and to request access to a media use MediaDevices.getUserMedia().
        //getUserMedia() -  returns a promise. We will be using it to access our webcam. 
        //On the fulfillment part of this promise i.e when the user gives access to video & audio, we can assign the video stream from our webcam to myVideo useRef.    
        .then((currentStream) =>{
                setStream(currentStream);

                myVideo.current.srcObject = currentStream;
            })

            socket.on('me' , (id) => setMe(id));
            //we are listening for the 'me' named event , which we defined in the backend which passed the socket.id.
            //here we will store that socket.id in id state
    
            socket.on('calluser' , ({from , name : callerName , signal}) =>{
                setCall({isReceivedCall : true , from , name : callerName , signal})
            });
            //here again we are listening for the 'calluser' event , which gets the data object which we destructured in the parameters and storing it in the call state
            //isReceivedCall : true - says that we are receiving the call , not calling
            //name - name of the caller
            //from - from where the call is
            

        },[]);
        //useEffect will only run once when app renders

    const answerCall = () => {
        setCallAccepted(true)
        //user accepted the call

        const peer = new Peer({initiator : false , trickle : false , stream});
        //peer = new Peer([opts]) - used to create a new WebRTC peer connection
        //A "data channel" for text/binary communication is always established, because it's cheap and often useful. 
        //For video/voice communication, pass the stream option.In our case we passed the stream state
        //initiator  - set false as we are not initiating the call we are just answering/receiving it 
        //trickle - set to false to disable trickle ICE which will make the connection faster and get a single 'signal' event
        //stream - if video/voice is desired, pass stream returned from getUserMedia
        
        peer.on('signal' , (data) => {
            socket.emit('answercall' , {signal : data , to : call.from})
        })
        //once we recieve the signal , then we will do socket.emit inside the callback function
        //which will pass data to 'answercall' event in the backend.
        //to : call.from -  passing the info about the caller
         

        peer.on('stream' , (currentStream) =>{
            userVideo.current.srcObject = currentStream
        })
        //we are handling the stream of the other person not our own stream

        peer.signal(call.signal)
        //Call this method whenever the remote peer emits a peer.on('signal') event.
        //call.signal - it contains the signal data from the caller and
        //by passing in the peer.signal() , we etablished the p2p connection between both the users

        connectionRef.current = peer
        //connectionRef will contain the current peer

    }

    const callUser = (id) =>{

        const peer = new Peer({initiator : true , trickle : false , stream});
        //initiator : true - because we are the one to make the call

        peer.on('signal' , (data) => {
            socket.emit('calluser' , {userToCall : id , signalData : data , from : me , name})
        })
        //emit to 'calluser' event
        //userToCall : id - coming from Options.js when user clicks on 'call' button
        //from : me - me state which contains our socket.id 
        //name state

        peer.on('stream' , (currentStream) =>{
            userVideo.current.srcObject = currentStream
        })

        socket.on('callaccepted' , (signal) =>{
            setCallAccepted(true)

            peer.signal(signal)
        })
        //user can accept or reject a call when recieved from
        //so when a user accepts a call i.e 'callaccepted' event
        //peer.singal made the connection

        connectionRef.current = peer

    }

    const leaveCall = () =>{

        setCallEnded(true);

        connectionRef.current.destroy();
        //destroyed the peer connection and user's video/audio will not be received

        window.location.reload();
        //reloads the page and provides a user with new id in line 57

    }

    return (
        <SocketContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            me,
            callUser,
            leaveCall,
            answerCall
        }}>
        {children}
        {/* all the components wrapped in ContextProvider , in index.js will be rendered*/}
        
        </SocketContext.Provider>
    )
}

export {ContextProvider ,SocketContext }