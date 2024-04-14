import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import loadable from '@loadable/component';

import LogIn from '../pages/Login';
import SignUp from '../pages/SignUp';
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/HomePage';
import CreateRoomPage from '../pages/CreateRoomPage';

const App = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/homepage" />
      </Route>
      <Route path="/homepage" component={HomePage} />
      <Route path="/createroompage" component={CreateRoomPage} />
      <Route path="/login" component={LogIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/landingpage=:roomId" component={LandingPage} />
    </Switch>
  );
};

export default App;
