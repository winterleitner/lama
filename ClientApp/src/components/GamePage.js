import React, {Component, useEffect} from 'react';
import {Game} from "./Game";
import {Login} from "./Login";

export class GamePage extends Component {

    state = {
        games: [],
        game: -1,
        createdGame: -1,
        loading: true,
        intervalId: -1
    }

    constructor(props) {
        super(props);
        this.listGames = this.listGames.bind(this);
        this.createGame = this.createGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.alreadyInGame = this.alreadyInGame.bind(this);
        this.currentGameExists = this.currentGameExists.bind(this);
        this.getCurrentGame = this.getCurrentGame.bind(this);
    }

    componentDidMount() {
        this.listGames()
        window.clearInterval(this.state.intervalId)
        const nIntervalId = window.setInterval(this.listGames, 5000)

        this.setState({intervalId: nIntervalId, loading: false})
    }

    async createGame(config) {
        const resp = await fetch("/games?configuration=" + config, {
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
        if (game.players.some(p => p.userName === this.props.user.userName)) {
            // show game
            this.setState({game: id})
        } else {
            //join game
            const resp = await fetch(`/games/${id}/join`, {
                method: "POST"
            })
            if (resp.ok) {
                this.setState({game: id})
                await this.listGames();
            } else {
                alert(await resp.text())
            }
        }
    }

    alreadyInGame(id) {
        if (this.state.games.filter(g => g.id === id).length === 0) return false
        const game = this.state.games.filter(g => g.id === id)[0]
        return game.players.some(p => p.userName === this.props.user.userName)
    }

    currentGameExists() {
        return this.state.games.filter(g => g.id === this.state.game).length > 0 && this.getCurrentGame().players.some(p => p.userName === this.props.user.userName);
    }

    getCurrentGame() {
        return this.state.games.filter(g => g.id === this.state.game)[0];
    }

    getPlayersWaitingText(players) {
        if (players.length === 0) return "No Players yet."
        if (players.length === 1) return "1 Player waiting..."
        return `${players.length} Players waiting...`
    }


    render() {
        if (this.props.user.userName.length === 0) {
            return <Login success={this.props.onLogin}/>
        }
        if (this.state.loading) return <h1>Loading...</h1>
        if (this.currentGameExists()) {
            return <div>
                <button className="btn btn-sm btn-primary" onClick={() => this.setState({game: -1})}>zurück</button>
                <Game
                    game={this.state.game}
                    player={this.props.user.userName}
                    connection={this.props.connection}
                /></div>
        }
        return (
            <div className="center-elem">
                <h1>Doge-Game</h1>
                <div>Username: {this.props.user.userName}</div>
                <h3>Open Games</h3>
                <div className="container">
                    <div className="row">
                        <div className="col-sm-0 col-md-4"></div>
                        <div className="col-sm-12 col-md-4">
                            <button className="btn btn-primary mt-1 btn-block" onClick={() => this.createGame(0)}>Create
                                Standard Game
                            </button>
                        </div>
                        <div className="col-sm-0 col-md-4"></div>
                    </div>
                </div>
                <table className="table mt-3">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>
                            <button className="btn btn-sm btn-secondary" onClick={this.listGames}>Refresh</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.games.sort((a, b) => a.id < b.id).map(g =>
                        <tr key={g.id}>
                            <td>{g.name}</td>
                            <td>{g.ended ? "Ended" : g.started ? "Started" : this.getPlayersWaitingText(g.players)}</td>
                            <td>{g.started && !this.alreadyInGame(g.id) ? "" : this.alreadyInGame(g.id) ? (g.ended ?
                                <button className="btn btn-sm btn-danger"
                                        onClick={() => this.joinGame(g.id)}>Show Results</button> :
                                <button className="btn btn-sm btn-primary"
                                        onClick={() => this.joinGame(g.id)}>Enter Room</button>)
                                : <button className="btn btn-sm btn-success"
                                          onClick={() => this.joinGame(g.id)}>Join</button>}</td>
                        </tr>
                    )}
                    </tbody>
                </table>

            </div>
        );
    }
}
