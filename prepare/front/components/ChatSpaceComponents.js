import React, { useState, useEffect, useRef, useCallback } from 'react';
import fetcher from '../utils/fetcher';
import { io } from 'socket.io-client'
import useSWR from 'swr';
import styled, { css } from 'styled-components';

let roomName = '123';


const socket = io('http://13.125.251.86:3004', {
  transports: ['websocket'],
});

const ChatSpaceComponents = () => {
  const { data: userData, error, revalidate } = useSWR('http://13.125.251.86:3001/users', fetcher);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const fileInputRef = useRef(null);

  const onChangeInput = useCallback((e) => {
    setCurrentMessage(e.target.value);
  });

  socket.emit('join_room', roomName);

  const sendMessage = async () => {
    if (currentMessage != '') {
      const messageData = {
        room: roomName,
        author: userData?.name,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes(),
      };

      await socket.emit('send_message', messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage('');
    }
  };

  const sendMessageWithFile = async (file) => {
    if (file) {
      const messageData = {
        room: roomName,
        author: userData?.name,
        message: file, // 파일의 URL을 메시지로 전송
        time: new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes(),
      };

      await socket.emit('send_message_img', messageData);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 시 sendMessageWithFile 함수 호출
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    sendMessageWithFile(file);
  };

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessageList((list) => [...list, data]);
    });

    socket.on('receive_message_img', (data) => {
      console.log('옴???');
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  const scrollRef = useRef();

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  return (
    <ChatWindow>
      <ChatHeader>
        <ChatHeaderText>채팅 목록</ChatHeaderText>
      </ChatHeader>
      <ChatBody>
        <MessageContainer>
          {messageList.map((messageContent, index) => (
            <Message key={index}>
              <div>
                <MessageContent>
                  {messageContent?.img !== undefined ? (
                    <>
                      <img src={`E:/코드/web_front/jwt/back/uploads/${messageContent.img}`}></img>
                    </>
                  ) : (
                    <>
                      <p>{messageContent.message}</p>
                    </>
                  )}
                </MessageContent>
                <MessageMeta>
                  <p>작성 시간:</p>
                  <p>{messageContent.time}</p>
                  <p>, 작성자:</p>
                  <p>{messageContent.author}</p>
                </MessageMeta>
              </div>
            </Message>
          ))}
          <div ref={scrollRef}></div>
        </MessageContainer>
      </ChatBody>
      <ChatFooter>
        <ChatInput
          type="text"
          value={currentMessage}
          placeholder="입력하세요"
          onChange={onChangeInput}
          onKeyPress={(event) => {
            event.key === 'Enter' && sendMessage();
          }}
        />
        <SendButton onClick={sendMessage}>▶</SendButton>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileInputChange} />
        <button onClick={openFilePicker}>전송</button>
      </ChatFooter>
    </ChatWindow>
  );
};

const ChatWindow = styled.div`
  width: 300px;
  height: 420px;
`;

const ChatHeader = styled.div`
  height: 45px;
  border-radius: 6px;
  background: #263238;
  position: relative;
  cursor: pointer;
`;

const ChatHeaderText = styled.p`
  display: block;
  padding: 0 1em 0 2em;
  color: #fff;
  font-weight: 700;
  line-height: 45px;
  margin: 0;
`;

const ChatBody = styled.div`
  height: 87vh;
  border: 1px solid #263238;
  background: #fff;
  position: relative;
`;

const MessageContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
`;

const Message = styled.div`
  height: auto;
  padding: 10px;
  display: flex;
  justify-content: flex-end
`;

const MessageContent = styled.div`
  width: auto;
  height: auto;
  min-height: 40px;
  background-color: ${({ isYou }) => (isYou ? '#43a047' : 'cornflowerblue')};
  border-radius: 5px;
  color: white;
  display: flex;
  align-items: center;
  margin-right: 12px;
  margin-left: 5px;
  padding-right: 5px;
  padding-left: 5px;
  overflow-wrap: break-word;
  word-break: break-word;
  justify-content: ${({ isYou }) => (isYou ? 'flex-start' : 'flex-end')};
`;

const MessageMeta = styled.div`
  display: flex;
  font-size: 12px;
  justify-content: ${({ isYou }) => (isYou ? 'flex-start' : 'flex-end')};
  margin-left: ${({ isYou }) => (isYou ? '5px' : '0')};
  margin-right: ${({ isYou }) => (isYou ? '0' : '5px')};
`;

const ChatFooter = styled.div`
  height: 40px;
  border: 1px solid #263238;
  border-top: none;
  display: flex;
`;

const ChatInput = styled.input`
  height: 100%;
  flex: 85%;
  border: 0;
  padding: 0 0.7em;
  font-size: 1em;
  border-right: 1px dotted #607d8b;
  outline: none;
  font-family: "Open Sans", sans-serif;
`;

const SendButton = styled.button`
  border: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex: 15%;
  height: 100%;
  background: transparent;
  outline: none;
  font-size: 25px;
  color: lightgray;
  &:hover {
    color: #43a047;
  }
`;

export default ChatSpaceComponents;