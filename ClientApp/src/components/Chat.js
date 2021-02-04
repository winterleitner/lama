import React, {useState, useEffect, useRef} from "react"
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";

export const Chat = props => {
    const [input, setInput] = useState("")
    const [signalRConnection, setSignalRConnection] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessages, setNewMessages] = useState(0)
    const [minimized, setMinimized] = useState(false)

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
        const element = document.getElementById(`chat-panel-body-${props.gameId}`);
        if (element != null) {
            element.scrollTop = element.scrollHeight;
        }
        if (minimized) {
            setNewMessages(newMessages + 1)
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

    const minimizeChat = (e) => {
        e.preventDefault()
        const panel = document.getElementById(`chat-${props.gameId}`)
        const body = document.getElementById(`chat-panel-body-${props.gameId}`)
        const footer = document.getElementById(`chat-panel-footer-${props.gameId}`)
        if(panel.classList.contains('mini'))
        {            
            setMinimized(false)
            setNewMessages(0)
            panel.classList.remove('mini')
            panel.classList.add('normal');

            body.animate({height: "250px"}, 500)
            body.style.display = 'block';

            footer.animate({height: "75px"}, 500)
            footer.style.display = 'block';
        }
        else
        {
            setMinimized(true)
            panel.classList.remove('normal')
            panel.classList.add('mini');

            body.animate({height: "0"}, 500);

            footer.animate({height: "0"}, 500);

            setTimeout(function() {
                body.style.display = 'none';
                footer.style.display = 'none';
            }, 500);


        }
    }

    return (
        <div className="container">
            <div className="row">
                <div className="panel panel-chat" id={`chat-${props.gameId}`}>
                    <div className="panel-heading">
                        <a href="#" className="chatMinimize" onClick={minimizeChat}><span>Chat <span className="new-message-counter">{newMessages > 0 ? newMessages : ""}</span></span></a>
                        <div className="clearFix"></div>
                    </div>
                    <div className="panel-body" id={`chat-panel-body-${props.gameId}`}>
                            {messages.map((m, idx) =>
                                <div className="chat-message" id={"m-" + idx} key={"m-" + idx}>
                                    <div className="chat-sender">{m.userName}:&nbsp;</div>
                                    <div className="chat-text">{m.message}</div>
                                </div>
                            )}
                        </div>
                    <div className="panel-footer" id={`chat-panel-footer-${props.gameId}`}>
                        <div className="send-container">
                            <input type="text" className="chat-textinput form-control" value={input}
                                   onChange={e => setInput(e.target.value)} onKeyDown={e => {
                                if (e.key === 'Enter') send()
                            }}/>
                            <button className="chat-send" onClick={send}><i className="fa fa-paper-plane"
                                                                            aria-hidden="true"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}