import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { GamePage } from './components/GamePage';
import Players from './components/Players';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/game' component={GamePage} />
        <Route path='/players' component={Players} />
      </Layout>
    );
  }
}
