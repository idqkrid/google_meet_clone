import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import {Link} from 'react-router-dom'
import useSWR from 'swr';
import fetcher from '../../utils/fetcher';
import Header from '../../components/Header'

const HomePage = () => {
  const { data: userData, error: loginError, revalidate } = useSWR('http://13.125.251.86:3001/users', fetcher);
  const [text, setText] = useState('');

  const handleChange = (event) => {
    const newValue = event.target.value;
    setText(newValue);
  };

  return (
    <Block>
      <Header />
      <main>
        <h2>Start your online meeting{`\n`}with Google Meet</h2>
        <Section>
          {loginError === undefined 
            ?
            <>
              <StyledButtonLink to="/createroompage">Create New Meeting</StyledButtonLink>
              <div className="or">OR</div>
              <Form>
                <input
                  placeholder="Enter Codes"
                  value={text}
                  onChange={handleChange}
                />
                <button><Link to={`/landingpage=${text}`}>Enter</Link></button>
              </Form>
            </>
            :
            <>
              
            </>
          }
        </Section>
      </main>
    </Block>
  )
}

const Block = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 48px;
    padding-right: 48px;
    h2 {
      line-height: 1.5;
      white-space: pre;
      font-size: 64px;
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
  height: 60px;
  font-weight: bold;
  font-size: 20px;
  border: none;
  cursor: pointer;
  padding-left: 12px;
  padding-right: 12px;
  &:hover {
    background: #333333;
    color: white;
  }
`

const StyledButtonLink = styled(Link)`
  ${commoStyle}
  text-decoration: none;
`

const Section = styled.section`
  display: flex;
  align-items: center;
  .or {
    margin-left: 16px;
    margin-right: 16px;
    font-size: 24px;
    color: #666666;
  }
`

const Form = styled.form`
  display: flex;
  input {
    width: 240px;
    height: 64px;
    padding-left: 24px;
    padding-right: 24px;
    font-size: 32px;
  }
  button {
    display: none;
    margin-left: 16px;
    font-size: 24px;
    background: none;
    border: none;
    padding-left: 12px;
    padding-right: 12px;
    cursor: pointer;
    &:hover {
      background: #f5f5f5;
    }
    a {
      text-decoration: none;
      color: black;
    }
  }
  input:focus + button {
    display: initial;
  }

  input:not([value='']) + button {
    display: initial;
    text-decoration: none;
  }
`

export default HomePage;