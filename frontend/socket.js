import io from "socket.io-client"
const socket=io("http://localhost:8000/",{
    path:"/signaling",
    closeOnBeforeunload:false,
    autoConnect:false
})
export default socket