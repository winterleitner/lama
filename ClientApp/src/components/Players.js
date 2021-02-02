import React, {useEffect, useState} from "react"

const Players = props => {
    const [players, setPlayers] = useState([])

    useEffect(() => {
        refresh()
        window.setInterval(refresh, 10000)
    }, [])
    const refresh = async () => {
        const resp = await fetch(`/players`)
        if (resp.ok) {
            setPlayers(await resp.json())
        }
    }
    return (
        <div>
            <h1>{players.length} Players in Leaderboard</h1>
            <table className="table">
                <thead>
                <tr>
                    <td>Rank</td>
                    <td>Name</td>
                    <td>Rating</td>
                    <td>Games Played</td>
                </tr>
                </thead>
                <tbody>
                {players.map((p, idx) => <tr>
                    <td>{idx + 1}</td>
                    <td>{p.userName}</td>
                    <td>{p.elo}</td>
                    <td>{p.games}</td>
                </tr>)}
                </tbody>
            </table>
        </div>
    )
}

export default Players