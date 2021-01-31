import React, {useEffect, useState} from "react"

const Players = props => {
    const [players, setPlayers] = useState([])

    useEffect(() => {
        window.setInterval(refresh, 10000)
    }, [])
    const refresh = async () => {
        const resp = await fetch(`/users`)
        if (resp.ok) {
            setPlayers(await resp.json())
        }
    }
    return (
        <div>
            <h1>{players.length} Spieler online</h1>
            <table className="table">
                <thead>
                <tr>
                    <td>Name</td>
                    <td>Punkte</td>
                </tr>
                </thead>
                <tbody>
                {players.map(p => <tr>
                    <td>{p}</td>
                    <td>-</td>
                </tr>)}
                </tbody>
            </table>
        </div>
    )
}

export default Players