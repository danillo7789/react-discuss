import { useEffect } from 'react';
import { useAuth } from '../authContext/context';
import Navbar from './Navbar';
import RoomFeed from './RoomFeed';
import TopicFeed from './TopicFeed';
import { useNavigate } from 'react-router-dom';
import ActivityFeed from './ActivityFeed';

function UnLogged () {
  const { isLoggedIn, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <h1>UnLogged!!</h1>
      
    </>
  )
  
  
}

export default UnLogged;