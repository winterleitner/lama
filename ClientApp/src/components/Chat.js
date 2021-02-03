import React, {useState, useEffect, useRef} from "react"
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";

export const Chat = props => {
    const [input, setInput] = useState("")
    const [signalRConnection, setSignalRConnection] = useState(null)
    const [messages, setMessages] = useState([])

    const latestChat = useRef(null);

    latestChat.current = messages;

    useEffect(() => {
        const newConn = new HubConnectionBuilder()
            .withUrl("/game-feed")
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();
        
        setSignalRConnection(newConn)
    }, [])

    useEffect(() => {
        if (signalRConnection) {
            signalRConnection.start()
                .then(result => {
                    console.log('Connected!');

                    signalRConnection.on("OnNewChatMessage", function (message) {
                        if (message.gameId === props.gameId) {
                            addMessage(message)
                        }
                    });
                    signalRConnection.on("OnGameStatusChanged", function (gameId) {
                        if (gameId === props.gameId) {
                            props.update()
                        }
                    });
                    
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [signalRConnection]);
    
    useEffect(() => {
        const element = document.getElementById(props.gameId + "-messages");
        if (element != null) {
            element.scrollTop = element.scrollHeight;
        }
    }, [messages])
    
    useEffect(() => {
        loadChat()
    }, [props.gameId])

    const loadChat = async () => {
        const resp = await fetch(`/games/${props.gameId}/chat`)
        if (resp.ok) {
            setMessages(await resp.json())
        }
    }

    const sendMessage = (command, ...args) => {
        signalRConnection.invoke(command, ...args)
            .catch(function (data) {
                alert('cannot connect to the server');
            });
    }

    const addMessage = message => {
        const m = [...latestChat.current]
        m.push(message)
        setMessages(m)
    }

    const send = () => {
        if (input.length === 0) return
        sendMessage("SendMessage", props.gameId, input)
        setInput("")
    }
    
    return (
        <div className="chat-container">
            <div className="messages-container" id={props.gameId + "-messages"}>
            {messages.map((m, idx) => 
                <div className="chat-message" id={"m-" + idx} key={"m-" + idx}>
                    <div className="chat-sender">{m.userName}:&nbsp;</div>
                    <div className="chat-text">{m.message}</div>
                </div>
            )}
            </div>
            <div className="send-container">
                <input type="text" className="chat-textinput form-control" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => {if (e.key === 'Enter') send()}}/>
                <button className="chat-send" onClick={send}><i className="fa fa-paper-plane" aria-hidden="true"></i></button>
            </div>
        </div>
    )
}