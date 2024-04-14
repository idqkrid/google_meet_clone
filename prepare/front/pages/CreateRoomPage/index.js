import React, {useState } from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom'
import Button from '../../components/Button'

const CreateRoomPage = () => {
  const [text, setText] = useState('');

  const handleChange = (event) => {
    const newValue = event.target.value;
    setText(newValue);
  };

  return (
    <Block>
      <main>
        <label>Meeting Code</label>
        <input
          placeholder="Enter Codes"
          value={text}
          onChange={handleChange}
        />
        <div className="buttons">
          <StyledButtonLink size="big" theme="textOnly">Cancel</StyledButtonLink>
          <StyledButtonLink size="big" to={`/landingpage=${text}`}>Create</StyledButtonLink>
        </div>
      </main>
    </Block>
  )
}

const Block = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  label {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
    display: block;
  }
  main {
    width: 480px;
    height: 280px;
    input {
      width: 100%;
      font-size: 32px;
      padding: 24px;
    }
    .buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
      button + button {
        margin-left: 16px;
      }
    }
  }
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

const StyledButtonLink = styled(Link)`
  ${commoStyle}
  text-decoration: none;
`

export default CreateRoomPage;