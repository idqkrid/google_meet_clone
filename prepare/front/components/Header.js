import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { css } from 'styled-components';
import {Link} from 'react-router-dom'
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import { Redirect, useHistory } from 'react-router-dom';
import axios from 'axios';


const Header = () => {
  const { data: userData, error: loginError, revalidate } = useSWR('http://localhost:3001/users', fetcher);

  console.log(loginError);

  const onChnage = useCallback((e) => {
    e.preventDefault();
    console.log('클릭!')
    axios
      .get(
        'http://localhost:3001/users/logout',
        {
          withCredentials: true,
        },
      )
      .then(() => {
        revalidate();
        console.log('성공!')
      })
      .catch((error) => {
        //setLogInError(error.response?.data?.statusCode === 401);
        console.log('실패')
      });
  });

  // if (loginError) {
  //   console.log('로그인 안됨', userData);
  //   return <Redirect to="/" />;
  // }

  return (
    <StyledHeader>
      <div className="logo">Google Meet</div>
      <div className="right">
        {loginError === undefined
        ?
        <>
          <div onClick={onChnage}>LogOut</div>
        </>
        :
          <>
            <StyledLink to="/login">Login</StyledLink>
            <StyledButtonLink to="/signup">Register</StyledButtonLink>
          </>
        }
      </div>
    </StyledHeader>
  )
}

const StyledLink = styled(Link)`
  text-decoration: none;
  color: black;
  margin-right: 16px;
  &:hover {
    text-decoration: underline;
    color: #333333;
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
`

const StyledButtonLink = styled(Link)`
  ${commoStyle}
  text-decoration: none;
`

const StyledHeader = styled.header`
  height: 64px;
  display: flex;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  justify-content: space-between;
  .logo {
    font-size: 24px;
    font-weight: bold;
  }
  .right {
  }
`

export default Header;