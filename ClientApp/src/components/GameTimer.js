import React, {useEffect, useState} from "react"

export const GameTimer = props => {
    const [timer, setTimer] = useState(30)
    
    useEffect(() => {
        setTimer(props.currentTime)
    }, [props.enabled, props.maxTime, props.currentTime, props.turn])
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            setTimer(timer - 1);
            if (timer === 0) props.onExpired()
        }, 1000);

        return () => {
            clearTimeout(timeout);
        };
    }, [timer]);

    return <div className={"game-timer" + (timer <= 5 ? " dangerous" : "")}>{timer >= 0 ? timer : 0}</div>
    
}