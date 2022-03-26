
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
        withCredentials: true,
        reconnection: false
    });  
    res.onAny((eventName, data) => {
        if (eventName === 'update') {
            if (!data.opened) {
            }
        }
    });
    return res;
}

let sockets = [];
//const AUTH_TOKEN = 's%3Amaqgnzq7nsb61x4dojt3pq7zucme9ed3.PwhjIh%2FqjRFLvtotLEotUKjf16YvSSKZRwLw%2FEmt0h4';
const AUTH_TOKEN = 's%3Aiey4163cyjsw2erszygau78ftu3bx7d1.QxCW0a2FSXU3NnKGb7MOTr10Qx0j3KiUpRaYh%2Frbruk';
const NUM_SOCKETS = 1000;

function createSockets() {
    for (let i = 0; i < NUM_SOCKETS; i++) {
        sockets.push(createSocket(AUTH_TOKEN));
    }
}

function runScaling() {
    createSockets();
    for (let i = 0; i < NUM_SOCKETS; i++) {
        let socket = sockets[i];
        let roomNum = (i % 58) + 1;
        socket.emit('join', {
            room: (roomNum + ""),
            //authToken: 'awd7982ywqe64vz924a9e1jnxn4h375r'
            authToken: 'pdh4bhi0s3efinnmtxbin7lbx2h0shk3'
        });
        //sockets[i].emit('set-question-num', 1);
    }
    let POSSIBLE_COMMANDS = ['req_starttimer', 'req_canceltimer', 'buzz', 'correctanswer', 'incorrectanswer', 'neganswer', 'focus', 'blur'];
    //let POSSIBLE_COMMANDS = ['buzz'];
    for (let i = 0; i < NUM_SOCKETS; i++) {
        setInterval(() => {
            let socket = sockets[i];
            let command = POSSIBLE_COMMANDS[Math.floor(Math.random() * POSSIBLE_COMMANDS.length)];
            //console.log(`Sending ${command}`);
            socket.emit(command);
        }, Math.random() * 1000 + 500);
    }
}

runScaling();
