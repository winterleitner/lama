import React, {Component} from 'react';
import {Game} from "./Game";

export class GamePage extends Component {

    state = {
        games: [],
        game: -1,
        user: {id: -1, name: ""},
        userNameText: "",
        createdGame: -1
    }

    constructor(props) {
        super(props);
        this.login = this.login.bind(this);
        this.listGames = this.listGames.bind(this);
        this.createGame = this.createGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.alreadyInGame = this.alreadyInGame.bind(this);
        this.currentGameExists = this.currentGameExists.bind(this);
        this.getCurrentGame = this.getCurrentGame.bind(this);
    }

    componentDidMount() {
        fetch("/user").then(res => {
            if (res.ok) {
                res.json().then(json => this.setState({user: json}))
            }
        })
        this.listGames()
        window.setInterval(this.listGames, 1000)
    }

    async login() {
        const resp = await fetch("/join", {
            method: "POST",
            body: `"${this.state.userNameText}"`,
            headers: {'Content-Type': "application/json"}
        })
        if (resp.ok) {
            const user = await resp.json();
            this.setState({user: user});
        }
    }

    async createGame() {
        const resp = await fetch("/games", {
            method: "POST"
        })
        if (resp.ok) {
            this.setState({createdGame: parseInt(await resp.text())})
            await this.listGames();
        }
    }

    async listGames() {
        const resp = await fetch("/games", {
            method: "GET"
        })
        if (resp.ok) {
            const games = await resp.json();
            this.setState({games: games});
        }
    }


    async joinGame(id) {
        if (this.state.games.filter(g => g.id === id).length === 0) return
        const game = this.state.games.filter(g => g.id === id)[0]
        if (game.players.some(p => p.id === this.state.user.id)) {
            // show game
            this.setState({game: id})
        }
        else {
            //join game
            const resp = await fetch(`/games/${id}/join`, {
                method: "POST"
            })
            if (resp.ok) {
                this.setState({game: id})
                await this.listGames();
            }
            else {
                alert(await resp.text())
            }
        }
    }
    
    alreadyInGame(id) {
        if (this.state.games.filter(g => g.id === id).length === 0) return false
        const game = this.state.games.filter(g => g.id === id)[0]
        return game.players.some(p => p.id === this.state.user.id)
    }
    
    currentGameExists() {
        return this.state.games.filter(g => g.id === this.state.game).length > 0 && this.getCurrentGame().players.some(p => p.id === this.state.user.id);
    }
    
    getCurrentGame() {
        return this.state.games.filter(g => g.id === this.state.game)[0];
    }
    
    getPlayersWaitingText(players) {
        if (players.length === 0) return "Noch keine Spieler."
        if (players.length === 1) return "1 Spieler wartet..."
        return `${players.length} Spieler warten...`
    }
    

    render() {
        console.log(this.state.user)
        let userComp;
        if (this.state.user.id === -1) {
            return <div className="mb-3 center-elem"><input type="text" placeholder="Spielername" className="form-control" value={this.state.userNameText}
                                   onChange={e => this.setState({userNameText: e.target.value})}/><br/>
                <button className="btn btn-primary" onClick={this.login}>Einloggen</button>
            </div>
        }
        return (
            <div className="center-elem">
                <h1>Lama-Spiel</h1>
                <div>Username: {this.state.user.name}</div>
                <h3>Games</h3>
                <button className="btn btn-primary" onClick={this.createGame}>Spiel erstellen</button>
                <table className="table mt-3">
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.games.map(g =>
                        <tr>
                            <td>{g.id}</td>
                            <td>{g.ended ? "Beendet" : g.started ? "Gestartet" : this.getPlayersWaitingText(g.players)}</td>
                            <td>{g.started && !this.alreadyInGame(g.id) ? "" : <button className="btn btn-sm btn-success" onClick={() => this.joinGame(g.id)}>{this.alreadyInGame(g.id) ? "Anzeigen" : "Beitreten"}</button>}</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {this.currentGameExists() ? 
                    <Game 
                    game={this.getCurrentGame()} 
                    player={this.getCurrentGame().players.filter(p => p.id === this.state.user.id)[0]}
                    update={this.listGames}
                    /> : <></>}

            </div>
        );
    }
}
