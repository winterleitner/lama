import {HttpTransportType, HubConnectionBuilder, LogLevel} from '@microsoft/signalr';

class SignalRController {
    rConnection;
    constructor(props) {
        this.rConnection = new HubConnectionBuilder()
            .withUrl("/game-feed")
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        this.rConnection.start()
            .catch(err => {
                console.log('connection error');
            });
    }

    registerChatMessageEvent = (callback) => {
        this.rConnection.on("OnNewChatMessage", function (title, body) {
            callback(title, body);
        });
    }
    
    sendChatMessage = (game, message) => {
        this.sendMessage("SendMessage", game, message)
    }

    sendMessage = (command, ...args) => {
        this.rConnection.invoke(command, ...args)
            .catch(function (data) {
                alert('cannot connect to the server');
            });
    }
}

export default SignalRController;