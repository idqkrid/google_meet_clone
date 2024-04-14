import axios from 'axios';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import useSWR from 'swr';
import fetcher from '../../utils/fetcher';
import { io } from 'socket.io-client'
import styled, { css } from 'styled-components';
import { useParams } from 'react-router-dom'
import ChatSpaceComponents  from '../../components/ChatSpaceComponents'


let myStream;
let muted = false;
let cameraOff = false;
let roomId = '123';
let myPeerConnection;
let myDataChannel;

const socket = io("http://localhost:3003", {
  transports: ["websocket"],
});

const LandingPage = () => {
  const { data: userData, error, revalidate } = useSWR('http://localhost:3001/users', fetcher);

  const { roomId } = useParams();

  console.log(roomId);

  const myFaceRef = useRef('');
  const peerFaceRef = useRef('');

  const muteRef = useRef('');
  const cameraRef = useRef('');
  const shareScreenRef = useRef('');

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [state, setState] = useState(roomId);
  const [socketState, setSocketStart] = useState(null);

  if (error) {
    console.log('로그인됨', userData);
    return <Redirect to="/" />;
  }

  useEffect((async () => {
    if (state !== null) {

      await getMedia();
      makeConnection();
      setSocketStart('start')
    }

    if (socketState !== null) {
      socket.emit("join_room", state);
    }
  }));

  /* socket 통신부분 */
  useEffect(() => {
    socket.on("welcome", async () => {
      console.log('안녕!')
  
      myDataChannel = myPeerConnection.createDataChannel("chat");
      myDataChannel.addEventListener("message", (event) => console.log(event.data));
      console.log("made data channel");
  
      const offer = await myPeerConnection.createOffer();
      myPeerConnection.setLocalDescription(offer);
      console.log("sent the offer");
      socket.emit("offer", offer, roomId);
    });

    socket.on("Notwelcome", async () => {
      console.log('못들어옴!')

    });
    
    socket.on("offer", async (offer) => {
  
      myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", (event) =>
          console.log(event.data)
        );
      });
  
      console.log("received the offer");
      console.log(offer);
      myPeerConnection.setRemoteDescription(offer);
      const answer = await myPeerConnection.createAnswer();
      myPeerConnection.setLocalDescription(answer);
      socket.emit("answer", answer, roomId);
      console.log("sent the answer");
    });
    
    socket.on("answer", (answer) => {
      console.log("received the answer");
      myPeerConnection.setRemoteDescription(answer);
    });
    
    socket.on("ice", (ice) => {
      console.log("received candidate");
      myPeerConnection.addIceCandidate(ice);
    });

    return () => {
      // 종료하기 로직 추가하기
    }
  }, [socket])
  /* socket 통신부분 끝 */

  /* 소리 - 음소거 */
  const handleMuteClick = () => {
      myStream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
      muteRef.current.srcObject = "Unmute";
      muted = true;
    } else {
      muteRef.current.srcObject = "Mute";
      muted = false;
    }
  }

  /* 카메라 - on / off */
  const handleCameraClick = () => {
    myStream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff) {
      //cameraRef.current.srcObject = "Turn Camera Off";
      cameraOff = false;
    } else {
      //cameraRef.current.srcObject = "Turn Camera On";
      cameraOff = true;
    }
  }

  /* 화면 공유하기 */
  const handleShareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
  
      let videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = function () {
        stopScreenShare();
      };
  
      console.log(videoTrack);
  
      const senders = myPeerConnection
        .getSenders()
        .find((sender) => sender.track.kind === "video");
      senders.replaceTrack(videoTrack);
    } catch (err) {
      console.error("Unable to get display media", err);
    }
  }

  /* 화면 공유하기 종료하기 */
  function stopScreenShare() {
    let videoTrack = myStream.getVideoTracks()[0];
    const senders = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    senders.replaceTrack(videoTrack);
  }

  async function getMedia() {
    const initialConstrains = {
      audio: false,
      video: { facingMode: "user" },
    };
    try {
      myStream = await navigator.mediaDevices.getUserMedia(initialConstrains);
      myFaceRef.current.srcObject = myStream;
    } catch (e) {
      console.log(e);
    }
  }

  function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302",
          ],
        },
      ],
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream
      .getTracks()
      .forEach((track) => myPeerConnection.addTrack(track, myStream));
  }

  function handleIce(data) {
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomId);
  }
  
  function handleAddStream(data) {
    peerFaceRef.current.srcObject = data.stream;
  }


  return (
    <Block>
      <VideoDiv>
        <MyStream>
          <video ref={myFaceRef} autoPlay playsInline></video>
        </MyStream>
        <OtherStream>
          <video ref={peerFaceRef} autoPlay playsInline></video>
        </OtherStream>
        <ChatSpace>
          <ChatSpaceComponents />
        </ChatSpace>
      </VideoDiv>
      <StateChnage>
        <StyledButtonButton ref={muteRef} onClick={handleMuteClick}>[소리 ON / 소리 OFF]</StyledButtonButton>
        <StyledButtonButton ref={cameraRef} onClick={handleCameraClick}>[카메라 ON / 카메라 OFF]</StyledButtonButton>
        <StyledButtonButton ref={shareScreenRef} onClick={handleShareScreen}>[화면 공유하기]</StyledButtonButton>
      </StateChnage>
    </Block>
  )
}


const Block = styled.div`
`

const VideoDiv = styled.div`
  background-color: #8a8a8a
  display: flex;
`

const MyStream = styled.div`
  video{
    width: 800px;
    height: 800px;
    margin-right: 10px;
    margin-left: 10px;
  }

  /* @media (max-width: 2560px) { /* 화면 너비에 따라 조절 */
    /* video{
    width: 1100px;
    height: 1000px;
    margin-left: 40px;
    margin-right: 10px;
  }
  }  */
`

const OtherStream = styled.div`
  video{
    width: 800px;
    height: 800px;
  }

  // @media (max-width: 2560px) { /* 화면 너비에 따라 조절 */
    /* video{
    width: 1100px;
    height: 1000px;
    margin-left: 10px;
  }
  } */
`

const ChatSpace = styled.div`
  width: 300px; /* 변경된 부분 */
  height: 96vh;
  overflow: hidden;
  background-color: red;

  // @media (max-width: 2560px) { /* 화면 너비에 따라 조절 */
    /* width: 300px;
    height: 96vh;
    overflow: hidden;
    background-color: red;
  } */
`

const StateChnage = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background: blue;
`


const commoStyle = css`
  ${(props) =>
  props.fullWidth ?
  css`
    width: 100%;
    display: flex;
  `
    : css`
    display: inline-flex;
  `}

  align-items: center;
  justify-content: center;

  background: black;
  color: white;
  height: 32px;
  font-weight: bold;
  font-size: 16px;
  border: none;
  cursor: pointer;
  padding-left: 12px;
  padding-right: 12px;
  &:hover {
    background: #333333;
    color: white;
  }
  ${props => props.size === 'big' && css`
    height: 64px;
    font-size: 32px;
    padding-left: 24px;
    padding-right: 24px;
  `}

  ${props => props.theme === 'textOnly' && css`
    background: none;
    color: #333333;
    &:hover {
      background: rgba(0,0,0,0.1);
    }
  `}
`

const StyledButtonButton = styled.button`
  ${commoStyle}
  text-decoration: none;
  margin-right: 10px;
`

export default LandingPage;