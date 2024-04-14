import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import loadable from '@loadable/component';

const LogIn = loadable(() => import('../pages/LogIn'));
const SignUp = loadable(() => import('../pages/SignUp'));
const LandingPage = loadable(() => import('../pages/LandingPage'));
const HomePage = loadable(() => import('../pages/HomePage'));
const CreateRoomPage = loadable(() => import('../pages/CreateRoomPage'));

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
