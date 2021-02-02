import React, {Component} from 'react';
import {Route} from 'react-router';
import {Layout} from './components/Layout';
import {Home} from './components/Home';
import {GamePage} from './components/GamePage';
import Players from './components/Players';

import './custom.css'

export default class App extends Component {
    static displayName = App.name;
    
    state = {user: {userName: "", elo: 0}}
    
    componentDidMount() {
        this.onLogin();
    }

    onLogin = async () => {
        const resp = await fetch(`/auth`, {
            method: "GET"
        })
        if (resp.ok) {
            const user = await resp.json()
            this.setState({user: user})
        }
    }

    render() {
        return (
            <Layout user={this.state.user}>
                <Route exact path='/' component={Home}/>
                <Route path='/game' component={() => <GamePage user={this.state.user} onLogin={this.onLogin}/>}/>
                <Route path='/leaderboard' component={Players}/>
                <Route path='/login' component={Home}/>
            </Layout>
        );
    }
}
