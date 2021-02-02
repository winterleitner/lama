import React, {useEffect, useState} from "react"
import {GamePlayerTable} from "./GamePlayerTable";

export const Game = (props) => {

    const [game, setGame] = useState(null)
    const [cards, setCards] = useState([])

    useEffect(() => {
        update()
        window.setInterval(update, 1000)
    }, [props.game])

    const update = async () => {
        loadGame();
        loadCards()
    }
    const loadGame = async () => {
        const resp = await fetch(`/games/${props.game}`, {
            method: "GET"
        })
        if (resp.ok) {
            const g = await resp.json()
            setGame(g)
        }
    }
    const cardCanBePlayed = (id) => {
        return game.topCard.id === id || game.topCard.next === id;
    }

    const gameCanBeStarted = () => {
        return game.players.length >= 2;
    }

    const isPlayersTurn = () => {
        return game.nextTurn != null && game.nextTurn.userName == props.player
    }

    const playCard = async (id) => {
        if (!cardCanBePlayed(id)) return
        const move = {type: 2, cardId: id}
        await submitMove(move)
    }

    const drawCard = async () => {
        const move = {type: 1}
        await submitMove(move)
    }

    const fold = async () => {
        const move = {type: 0}
        await submitMove(move)
    }


    const submitMove = async (move) => {
        if (!isPlayersTurn()) return
        const g = game
        g.nextTurn = null
        setGame(g)
        const resp = await fetch(`/games/${props.game}/move`, {
            method: "POST",
            body: JSON.stringify(move),
            headers: {'Content-Type': 'application/json'}
        })
        if (resp.ok) {
            update()
        }
    }

    const loadCards = async () => {
        const resp = await fetch(`/games/${props.game}/cards`)
        if (resp.ok) {
            setCards(await resp.json())
        }
    }

    const startGame = async (id) => {
        const resp = await fetch(`/games/${id}/start`, {
            method: "POST"
        })
        if (resp.ok) {
            await loadCards()
        }
    }

    if (game == null)
        return <div>Loading...</div>
    if (!game.started) {
        if (gameCanBeStarted())
            return <>
                <h1>{game.id}
                    <button className="btn btn-sm btn-success" onClick={() => startGame(game.id)}>Start</button>
                </h1>
                <GamePlayerTable players={game.players} winners={game.winners} gameover={true}
                                 nextTurn={game.nextTurn}/>
            </>
        else return <>
            <h1>{game.name}: Waiting for more Players...</h1>
            <GamePlayerTable players={game.players} winners={game.winners} gameover={true}
                             nextTurn={game.nextTurn}/>
        </>
    }
    if (game.ended) {
        return <GamePlayerTable players={game.players} winners={game.winners} gameover={game.ended}
                                nextTurn={game.nextTurn}/>

    }
    return (
        <div>
            <h1>{game.name}: Round {game.round}</h1>
            <GamePlayerTable players={game.players} winners={game.winners} gameover={game.ended}
                             nextTurn={game.nextTurn}/>
            <div>
                <div className="center-elem"><h4>Top Card:</h4>
                    <div className="game-card top-card"> {game.topCard.name}</div>
                </div>
                <h4>An der Reihe: {game.nextTurn != null && game.nextTurn.userName}</h4>
                <h4>Hand ({cards.length}) <i className="fa fa-refresh fa-spin" style={{fontSize: "24px"}}
                                             onClick={loadCards}></i>
                    <button className="btn btn-sm btn-primary" disabled={!isPlayersTurn()} onClick={drawCard}>Draw Card
                    </button>
                    <button className="btn btn-sm btn-danger" disabled={!isPlayersTurn()} onClick={fold}>Fold
                    </button>
                </h4>

                {cards
                    .sort((a, b) => a.id > b.id)
                    .map(c => <div
                        className={"game-card hand-card" + (cardCanBePlayed(c.id) ? " playable" : "") + (isPlayersTurn() ? "" : " off-turn")}
                        onClick={() => playCard(c.id)}>{c.name}</div>)}
            </div>
        </div>
    )
} 