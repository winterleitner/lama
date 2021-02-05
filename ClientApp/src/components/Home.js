import React, { Component } from 'react';
import {Link} from "react-router-dom";
import {NavLink} from "reactstrap";
import {HomeAd} from "./Ads/HomeAd";

export class Home extends Component {
  static displayName = Home.name;

  render () {
    return (
      <div>
        <h1 className="center-elem">Welcome to the awesome Online-Multiplayer-Doge!</h1>
          <h2 className="center-elem">Click <NavLink tag={Link} className="alert-link" to="/game">Play</NavLink> to start.</h2>
          <p>The rules are simple. Lose all your cards. Each move, you either have to play a card, draw a card or fold.</p>
        <p>You can play any card with the same number as the top card, or one higher. Cards range from 1 to 6. The DOGE card closes the loop: It can be played on top of a 6 and is succeeded by a 1.</p>
        <p>A round ends once one player has no more cards OR if all players have folded OR if all players but one have folded and the remaining player cannot play any more cards (this player is not allowed to draw cards).</p>
        <p>Each type of card in a players hand is counted as minus points according to the cards value. A DOGE is worth 10 minus points.</p>
        <p>The game ends once one player has 40 minus points. If a player manages to end a round by playing all their cards, 1 point (when their total points are below 10) or 10 points are deducted from their total points.</p>
        <HomeAd/>
      </div>
    );
  }
}
