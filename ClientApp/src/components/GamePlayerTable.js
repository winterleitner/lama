import React from "react"

export const GamePlayerTable = props => {
    if (!props.started)
        return (
            <div>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Player</th>
                        <th>Rating</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.players.sort((a,b) => a.points > b.points).map(p => <tr><td>{p.userName}</td><td>{Math.round(p.elo)}</td></tr>)}
                    </tbody>
                </table></div>
        )
    if (props.gameover)
        return (
            <div><h1>Game Over.</h1><div>Winner(s): {props.winners.map(w => w.userName + "(" + w.points + "Pt.)").join(", ")}</div>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Player</th>
                        <th>Points</th>
                        <th>Elo-Difference</th>
                    </tr>
                    </thead>
                    <tbody>
                    {props.players.sort((a,b) => a.points > b.points).map(p => <tr><td>{p.userName} ({p.elo})</td><td><div className="progress mt-2">
                        <div className="progress-bar" role="progressbar" style={{width: `${100*p.points/40}%`}} aria-valuenow={p.points} aria-valuemin="0"
                             aria-valuemax="40">{p.points}
                        </div>
                    </div></td><td>{Math.round(p.eloChange)}</td></tr>)}
                    </tbody>
                </table></div>
        )
    return (<>
        <p>Players, Cards and Points</p>
    <table className="table">
        <thead>
        <tr>
            <th>Player</th>
            <th>Points</th>
            <th>Cards</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        {props.players.map(p => <tr><td>{p.userName} ({p.elo})</td><td><div className="progress mt-2">
            <div className="progress-bar" role="progressbar" style={{width: `${100*p.points/40}%`}} aria-valuenow={p.points} aria-valuemin="0"
                 aria-valuemax="40">{p.points}
            </div>
        </div></td><td>{p.numberOfCards}</td><td>{props.nextTurn != null && props.nextTurn.userName == p.userName ?
            <span className="badge badge-pill badge-success">{p.userName}'s turn</span> : ""}{p.hasFolded &&
        <span className="badge badge-pill badge-danger">Folded</span>}</td></tr>)}
        </tbody>
    </table></>
    )
}