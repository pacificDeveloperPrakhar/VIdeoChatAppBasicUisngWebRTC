import { useEffect, useRef, useState } from 'react'
import './App.css'
import socket from '../socket'
import { connect } from 'socket.io-client'
function App() {
  const peer=useRef(new RTCPeerConnection())
  const [channel,setDataChannel]=useState(null)
  const [localId,setLocalId]=useState(null)
  const [mssg,setMssg]=useState("")
  const remoteId=useRef(null)
  // handling the data channel process
  function handleDataChannel(channel){
    setDataChannel(channel)
    channel.addEventListener("message",(e)=>{
      console.log(e.data)
      console.log("new message has been arrived")
    })
    channel.addEventListener("open",()=>{
      console.log("connection has been opened")
    })
    channel.addEventListener("close",()=>{
      console.log("connection has been close")
    })
  }
  // handling the sending offer process
  async function sendOffer(){
    const offer=await peer.current.createOffer()
    await peer.current.setLocalDescription(offer)
    socket.emit("action/offer",{to:remoteId.current,offer})
    const dataChannel=peer.current.createDataChannel("file-transfer")
    setDataChannel(dataChannel)
    dataChannel.addEventListener("message",(e)=>{
      console.log(e.data)
      console.log("new message has been received")
    })
    dataChannel.addEventListener("open",()=>{
      console.log("have opened the channel")
    })
    dataChannel.addEventListener("close",()=>{
      console.log("data channel is closing now")
    })
    
  }
  //handling the connection 
  useEffect(()=>{
      socket.connect()
      socket.on("me",(id)=>setLocalId(id))
      socket.on("incomming/offer",async ({from,offer})=>{
      await peer.current.setRemoteDescription(new RTCSessionDescription(offer))
      const answer=await peer.current.createAnswer()
      await peer.current.setLocalDescription(answer)
      socket.emit("action/answer",({to:from,answer}))
      peer.current.ondatachannel=(e)=>handleDataChannel(e.channel)
    })
    socket.on("incomming/answer",async({from,answer})=>{
      console.log(answer)
      // now storing the incomming answer to the remote description
        await peer.current.setRemoteDescription(new RTCSessionDescription(answer))
    })
    return ()=>{
      socket.off("me")
      socket.off("incomming/answer")
      socket.off("incomming/offer")
      socket.disconnect()
    }
  },[])
  // -------------------------------important
  // an empty dependency means that the use Effect will run once now giving the  localId in the depnedecy array was causing the 
  // indefinite number of times render
  // --------------------error of not updating the signaling state------------------------------------
  //for some reason when making sure that all events are removed successfully then error of signaling state not being updating 
  // has been fixed
  return (
    <>
    <div className="">
     {localId?(<h1>currentSessionId:{localId}</h1>):(<h1>not connected to the server</h1>)}
    <form action="" className="connectionForm" onSubmit={(e)=>{e.preventDefault();sendOffer()}}>
       <input type="text" name="" id="remoteId" onChange={(e)=>remoteId.current=(e.target.value)}/>
       <button type="submit">connect</button>
    </form>
    <form action=""className="file_sharing_form" style={{display:'none'}}>
      <input type="file" name="" id="file" />
      <button type="submit" id="send">submit</button>
    </form>
    <form action="" onSubmit={(e)=>{
      e.preventDefault()
      channel.send(mssg)
      setMssg(mssg)
    }}>
      <input type="text" placeholder='send message' value={mssg} onChange={(e)=>setMssg(e.target.value)}/>
      <button type="submit">send message</button>
    </form>
    </div>
    </>
  )
}

export default App
