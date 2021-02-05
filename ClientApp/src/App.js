import React, {Component} from 'react';
import {Route} from 'react-router';
import {Layout} from './components/Layout';
import {Home} from './components/Home';
import {GamePage} from './components/GamePage';
import Players from './components/Players';

import './custom.css'
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";

export default class App extends Component {
    static displayName = App.name;
    
    state = {user: {userName: "", elo: 0}, signalR: null}
    
    componentDidMount() {
        this.onLogin();
    }

    onLogin = async () => {
        const resp = await fetch(`/auth`, {
            method: "GET"
        })
        if (resp.ok) {
            const user = await resp.json()
            
            const newConn = new HubConnectionBuilder()
                .withUrl("/game-feed")
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();
            if (newConn) newConn.start()
            this.setState({user: user, signalR: newConn})
        }
    }

    render() {
        return (
            <Layout user={this.state.user}>
                <Route exact path='/' component={Home}/>
                <Route path='/game' component={() => <GamePage user={this.state.user} onLogin={this.onLogin} connection={this.state.signalR}/>}/>
                <Route path='/leaderboard' component={Players}/>
                <Route path='/login' component={Home}/>
            </Layout>
        );
    }
}
