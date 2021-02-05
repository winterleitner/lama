import React, {useState, useEffect, useRef} from "react"
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr";

export const Chat = props => {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState([])
    const [newMessages, setNewMessages] = useState(0)
    const [minimized, setMinimized] = useState(false)

    const latestChat = useRef(null);

    latestChat.current = messages;

    useEffect(() => {
        if (props.connection) {
            props.connection.on("OnNewChatMessage", function (message) {
                if (message.gameId === props.gameId) {
                    addMessage(message)
                }
            });
            props.connection.on("OnGameStatusChanged", function (gameId) {
                if (gameId === props.gameId) {
                    props.update()
                }
            });
        }
    }, [props.connection]);

    useEffect(() => {
        if (minimized) {
            if (messages.length > 0)
                setNewMessages(newMessages + 1)
        } else scrollDown()
    }, [messages])

    useEffect(() => {
        console.log("Reloading Chat")
        loadChat()
        toggleChat(null)
    }, [props.gameId])

    const scrollDown = () => {
        const element = document.getElementById(`chat-panel-body-${props.gameId}`);
        if (element != null) {
            element.scrollTop = element.scrollHeight;
        }
    }
    const loadChat = async () => {
        const resp = await fetch(`/games/${props.gameId}/chat`)
        if (resp.ok) {
            setMessages(await resp.json())
        }
    }

    const sendMessage = (command, ...args) => {
        props.connection.invoke(command, ...args)
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

    const toggleChat = (e) => {
        if (e != null) e.preventDefault()
        const panel = document.getElementById(`chat-${props.gameId}`)
        const body = document.getElementById(`chat-panel-body-${props.gameId}`)
        const footer = document.getElementById(`chat-panel-footer-${props.gameId}`)
        if (panel.classList.contains('mini')) {
            setMinimized(false)
            setNewMessages(0)
            panel.classList.remove('mini')
            panel.classList.add('normal');

            body.animate({height: "250px"}, 500)
            body.style.display = 'block';

            footer.animate({height: "75px"}, 500)
            footer.style.display = 'block';
            scrollDown()
        } else {
            setMinimized(true)
            panel.classList.remove('normal')
            panel.classList.add('mini');

            body.animate({height: "0"}, 500);

            footer.animate({height: "0"}, 500);

            setTimeout(function () {
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
                        <a href="#" className="chatMinimize" onClick={toggleChat}><span>Chat <span
                            className="new-message-counter">{newMessages > 0 ? newMessages : ""}</span></span></a>
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