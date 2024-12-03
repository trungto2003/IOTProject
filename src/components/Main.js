import React from 'react';
import { Switch, Route } from "react-router-dom";
import DataSensor from './pages/DataSensor';
import HomePage from './pages/HomePage';
import ActionHistory from './pages/ActionHistory';
import Profile from './pages/Profile';
import Bai5 from './pages/Bai5';


const Main = (props) => (
    <Switch>
        <Route exact path="/" component={HomePage} />;
        <Route path="/datasensor" component={DataSensor} />;
        <Route path="/actionhistory" component={ActionHistory} />;
        <Route path="/profile" component={Profile} />;
        <Route path="/bai5" component={Bai5} />;
    </Switch>
)

export default Main;