import React, {useEffect, useState} from "react"
import {GamePlayerTable} from "./GamePlayerTable";
import {Chat} from "./Chat";
import {GameTimer} from "./GameTimer";

export const Game = (props) => {

    const [game, setGame] = useState(null)
    const [cards, setCards] = useState([])

    useEffect(() => {
        update()
    }, [props.game])

    const update = async () => {
        await loadCards()
        await loadGame()
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
        return Math.abs(game.topCard.id) === Math.abs(id) || Math.abs(game.topCard.next) === Math.abs(id);
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

    const onTimeExpired = () => {
        if (!isPlayersTurn()) return
        const g = game
        g.nextTurn = null
        setGame(g)
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

    const startGame = async () => {
        const resp = await fetch(`/games/${props.game}/start`, {
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
                <h2>{game.name}
                    <button className="btn btn-sm btn-success" onClick={startGame}>Start</button>
                </h2>
                <Chat gameId={props.game} update={update} connection={props.connection} userName={props.player}/>
                <GamePlayerTable players={game.players} winners={game.winners} gameover={true}
                                 nextTurn={game.nextTurn}/>
            </>
        else return <>
            <h2>{game.name}: Waiting for more Players...</h2>
            <Chat gameId={props.game} update={update} connection={props.connection} userName={props.player}/>
            <GamePlayerTable players={game.players} winners={game.winners} gameover={true}
                             nextTurn={game.nextTurn} started={game.started}/>
        </>
    }
    if (game.ended) {
        return <GamePlayerTable players={game.players} winners={game.winners} gameover={game.ended}
                                nextTurn={game.nextTurn} started={game.started}/>

    }
    return (
        <div>
            <h2>{game.name}: Round {game.round}</h2>
            <Chat gameId={props.game} update={update} connection={props.connection} userName={props.player}/>
            <GamePlayerTable players={game.players} winners={game.winners} gameover={game.ended}
                             nextTurn={game.nextTurn} started={game.started}/>
            <div>
                <div className="center-elem"><h4>Top Card:</h4>
                    <div className="game-card top-card"> {game.topCard.name}</div>
                </div>
                <h4 className="mt-4">Turn: {game.nextTurn != null && game.nextTurn.userName} <GameTimer
                    enabled={game.configuration.useTimeLimit} maxTime={game.configuration.timePerMove}
                    currentTime={game.remainingMoveTime} turn={game.nextTurn} onExpired={onTimeExpired}/></h4>

                <h4>Hand ({cards.length}) <i className="fa fa-refresh fa-spin" style={{fontSize: "24px"}}
                                             onClick={loadCards}></i>
                    <button className="btn btn-sm btn-primary ml-2" disabled={!isPlayersTurn()} onClick={drawCard}>Draw
                        Card
                    </button>
                    <button className="btn btn-sm btn-danger ml-2" disabled={!isPlayersTurn()} onClick={fold}>Fold
                    </button>
                </h4>
                <div className="hand-card-container">
                    {cards
                        .sort((a, b) => a.id > b.id)
                        .map(c => <div
                            className={"game-card hand-card" + (cardCanBePlayed(c.id) ? " playable" : "") + (isPlayersTurn() ? "" : " off-turn") + (c.id === 0 ? " doge-card" : "")}
                            onClick={() => playCard(c.id)}>{c.name}</div>)}
                </div>
            </div>
        </div>
    )
} 