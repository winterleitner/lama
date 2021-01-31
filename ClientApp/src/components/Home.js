import React, { Component } from 'react';
import {Link} from "react-router-dom";
import {NavLink} from "reactstrap";

export class Home extends Component {
  static displayName = Home.name;

  render () {
    return (
      <div>
        <h1 className="center-elem">Willkommen zum Online-Multiplayer-Lama!</h1>
          <h2 className="center-elem">Einfach auf <NavLink tag={Link} className="alert-link" to="/game">Spielen</NavLink> klicken und loslegen.</h2>
      </div>
    );
  }
}
