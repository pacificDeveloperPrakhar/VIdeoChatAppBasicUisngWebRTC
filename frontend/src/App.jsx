import { useEffect, useRef, useState } from 'react'
import './App.css'
import socket from '../socket'
function App() {
  const peer=useRef(new RTCPeerConnection())
  const [localId,setLocalId]=useState(null)
  const remoteId=useRef(null)
  // handling the sending offer process
  async function sendOffer(){
    const offer=await peer.current.createOffer()
    await peer.current.setLocalDescription(offer)
    socket.emit("action/offer",{to:remoteId.current,offer})
  }
  useEffect(()=>{
      socket.connect()
      socket.on("me",(id)=>setLocalId(id))
      socket.on("incomming/offer",async ({from,offer})=>{
      console.log(peer.current.signalingState,0)
      await peer.current.setRemoteDescription(new RTCSessionDescription(offer))
      const answer=await peer.current.createAnswer()
      await peer.current.setLocalDescription(answer)
      console.log(peer.current.signalingState,1)
      socket.emit("action/answer",({to:from,answer}))
    })
    socket.on("incomming/answer",async({from,answer})=>{
      console.log(answer)
      console.log(peer.current.signalingState,2)
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
    <form action=""className="file_sharing_form">
      <input type="file" name="" id="file" />
      <button type="submit" id="send">submit</button>
    </form>
    </div>
    </>
  )
}

export default App
