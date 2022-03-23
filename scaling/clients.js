
const { io } = require('socket.io-client');
//const SOCKET_URL = 'ws://localhost:8080';
const SOCKET_URL = 'wss://prometheus.buzz';

function createSocket(authToken) {
    let res = io(SOCKET_URL, {
        polling: {
            extraHeaders: {
                'Cookie': `authtoken=${authToken}`
            }
        },
        withCredentials: true
    });  
    res.onAny((eventName, data) => {
        console.log(`Event: ${eventName}`);
    });
    return res;
}

let sockets = [];
//const AUTH_TOKEN = 's%3Amaqgnzq7nsb61x4dojt3pq7zucme9ed3.PwhjIh%2FqjRFLvtotLEotUKjf16YvSSKZRwLw%2FEmt0h4';
const AUTH_TOKEN = 's%3Aiey4163cyjsw2erszygau78ftu3bx7d1.QxCW0a2FSXU3NnKGb7MOTr10Qx0j3KiUpRaYh%2Frbruk';
const NUM_SOCKETS = 100;

function createSockets() {
    for (let i = 0; i < NUM_SOCKETS; i++) {
        sockets.push(createSocket(AUTH_TOKEN));
    }
}

function runScaling() {
    createSockets();
    let startTimer = true;
    for (let i = 0; i < NUM_SOCKETS; i++) {
        let socket = sockets[i];
        let roomNum = (i % 3) + 1;
        socket.emit('join', {
            room: (roomNum + ""),
            //authToken: 'awd7982ywqe64vz924a9e1jnxn4h375r'
            authToken: 'rd4gz5ivu905t435aql5o3n7mxseoidn'
        });
    }
    let POSSIBLE_COMMANDS = ['req_starttimer', 'req_canceltimer',]
    setInterval(() => {
        for (let i = 0; i < NUM_SOCKETS; i++) {
            let socket = sockets[i];
            if (startTimer) {
                socket.emit('req_starttimer');
            } else {
                socket.emit('req_canceltimer');
            }
            startTimer = !startTimer;
        }
    }, Math.random() * 1000 + 500);
}

runScaling();
