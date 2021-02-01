import React, {useEffect, useState} from "react"

export const Game = (props) => {
    
    const [cards, setCards] = useState([])
    
    useEffect(() => {
        loadCards()
    }, [props.game])
    
    const cardCanBePlayed = (id) => {
        return props.game.topCard.id === id || props.game.topCard.next === id;
    }
    
    const gameCanBeStarted = () => {
        return props.game.players.length >= 2;
    }
    
    const isPlayersTurn = () => {
        return props.game.nextTurn != null && props.game.nextTurn.id == props.player.id
    }
    
    const playCard = async (id) => {
        if (!cardCanBePlayed(id)) return
        const move = {type: 2, cardId: id}
        await submitMove(move)
        await loadCards()
    }
    
    const drawCard = async () => {
        const move = {type: 1}
        await submitMove(move)
        await loadCards()
    }

    const fold = async () => {
        const move = {type: 0}
        await submitMove(move)
        await loadCards()
    }


    const submitMove = async (move) => {
        const resp = await fetch(`/games/${props.game.id}/move`, {
            method: "POST",
            body: JSON.stringify(move),
            headers: {'Content-Type': 'application/json'}
        })
        if (resp.ok) {
            props.update()
        }
    }
    
    const loadCards = async () => {
        const resp = await fetch(`/games/${props.game.id}/cards`)
        if (resp.ok) {
            setCards(await resp.json())
        }
    }
    
    const startGame = async (id) => {
        const resp = await fetch(`/games/${id}/start`, {
            method: "POST"
        })
        if (resp.ok) {
            props.update()
            await loadCards()
        }
    }
    
    
    if (!props.game.started) {
        if (gameCanBeStarted())
            return <h1>Spiel {props.game.id}
                <button className="btn btn-sm btn-success" onClick={() => startGame(props.game.id)}>Start</button>
            </h1>
        else return <h1>Spiel {props.game.id}: Warte auf weitere Spieler...</h1>
    }
    if (props.game.ended) {
        return <div><h1>Game Over.</h1><div>Winner(s): {props.game.winners.map(w => w.name + "(" + w.points + "Pt.)").join(", ")}</div>
            <table className="table">
                <thead>
                <tr>
                    <th>Spieler</th>
                    <th>Punkte</th>
                </tr>
                </thead>
                <tbody>
                {props.game.players.sort((a,b) => a.points > b.points).map(p => <tr><td>{p.name}</td><td><div className="progress mt-2">
                    <div className="progress-bar" role="progressbar" style={{width: `${100*p.points/40}%`}} aria-valuenow={p.points} aria-valuemin="0"
                         aria-valuemax="40">{p.name}: {p.points}
                    </div>
                </div></td></tr>)}
                </tbody>
            </table></div>
    }
    return (
    <div>
        <h1>Spiel {props.game.id}, Runde {props.game.round}</h1>
        <p>Spieler, Karten und Punkte</p>
        <table className="table">
            <thead>
            <tr>
                <th>Spieler</th>
                <th>Punkte</th>
                <th>Karten</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
        {props.game.players.map(p => <tr><td>{p.name}</td><td><div className="progress mt-2">
            <div className="progress-bar" role="progressbar" style={{width: `${100*p.points/40}%`}} aria-valuenow={p.points} aria-valuemin="0"
                 aria-valuemax="40">{p.name}: {p.points}
            </div>
        </div></td><td>{p.numberOfCards}</td><td>{props.game.nextTurn != null && props.game.nextTurn.id == p.id ?
            <span className="badge badge-pill badge-success">Am Zug</span> : ""}{p.hasFolded &&
            <span className="badge badge-pill badge-danger">Ausgestiegen</span>}</td></tr>)}
            </tbody>
        </table>
        <div>
            <div className="center-elem"><h4>Oberste Karte:</h4><div className="game-card top-card"> {props.game.topCard.name}</div></div>
            <h4>An der Reihe: {props.game.nextTurn != null && props.game.nextTurn.name}</h4>
            <h4>Hand ({cards.length}) <i className="fa fa-refresh fa-spin" style={{fontSize:"24px"}} onClick={loadCards}></i> <button className="btn btn-sm btn-primary" disabled={!isPlayersTurn()} onClick={drawCard}>Abheben</button> <button className="btn btn-sm btn-danger" disabled={!isPlayersTurn()} onClick={fold}>Aussteigen</button></h4>
 
                {cards
                    .sort((a,b) => a.id > b.id)
                    .map(c => <div className={"game-card hand-card" + (cardCanBePlayed(c.id) ? " playable" : "") + (isPlayersTurn() ? "" : " off-turn")} onClick={() => playCard(c.id)}>{c.name}</div>)}
        </div>
    </div>
    )
} 