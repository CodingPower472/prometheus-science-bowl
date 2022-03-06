
import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = 'http://prometheus.buzz:8080/api';
const WEBSOCKET = 'ws://prometheus.buzz:8080';

axios.defaults.withCredentials = true;

function url(path) {
    return BASE_URL + path;
}

function checkJoinCode(code) {
    return axios.post(url('/check-code'), {
        code
    });
}

function getUserInfo(googleToken) {
    return axios.post(url('/user-info'), {
        googleToken
    });
}

function join(code, fullName, googleToken) {
    return axios.post(url('/join'), {
        code,
        fullName,
        googleToken
    });
}

function auth() {
    return axios.get(url('/auth'));
}

function signIn(gToken) {
    return axios.post(url('/signin'), {
        googleToken: gToken
    });
}

function listTeams() {
    return axios.get(url('/list-teams'));
}

function getTournamentInfo() {
    return axios.get(url('/tournament-info'));
}

function startTournament() {
    return axios.post(url('/start-tournament'));
}

function advanceRound() {
    return axios.post(url('/advance-round'));
}

function createTeam(teamName) {
    return axios.post(url('/create-team'), {
        teamName
    });
}

function signOut() {
    return axios.post(url('/signout'));
}

class SocketManager {

    check() {
        if (!this.socket) throw new Error('No socket.');
    }

    constructor() {
        this.url = WEBSOCKET;
    }
    connect() {
        this.socket = io(this.url);
    }
    setOnConnect(cb) {
        this.check();
        this.socket.on('authorized', cb);
    }
    setOnConnectError(cb) {
        this.check();
        this.socket.on('connect_error', cb);
    }
    setOnJoinError(cb) {
        this.check();
        this.socket.on('joinerr', cb);
    }
    setOnDisconnect(cb) {
        this.check();
        this.socket.on('disconnect', cb);
    }
    setOnUpdate(cb) {
        this.check();
        this.socket.on('update', cb);
    }
    setOnRoomJoined(cb) {
        this.check();
        this.socket.on('joined', cb);
    }
    setOnTimerStart(cb) {
        this.check();
        this.socket.on('timerstart', cb);
    }
    setOnTimerCancel(cb) {
        this.check();
        this.socket.on('timercancel', cb);
    }
    setOnTimerReset(cb) {
        this.check();
        this.socket.on('timerreset', cb);
    }

    sendEvent(message) {
        this.check();
        this.socket.emit('event', message);
    }
    joinRoom(data) {
        console.log('Attempting to join room');
        this.check();
        this.socket.emit('join', data);
    }
    startGame() {
        this.check();
        this.socket.emit('start');
    }
    buzz() {
        this.check();
        this.socket.emit('buzz');
    }

    ignoreBuzz() {
        this.check();
        this.socket.emit('ignorebuzz');
    }
    correctAnswer() {
        this.check();
        this.socket.emit('correctanswer');
    }
    incorrectAnswer() {
        this.check();
        this.socket.emit('incorrectanswer');
    }
    negAnswer() {
        this.check();
        this.socket.emit('neganswer');
    }

    nextQuestion() {
        this.check();
        this.socket.emit('next-question');
    }

    setQuestionNum(num) {
        this.check();
        this.socket.emit('set-question-num', num);
    }

    setOnBonus(isBonus) {
        this.check();
        this.socket.emit('set-on-bonus', isBonus);
    }

    setLocked(teamInd, locked) {
        this.check();
        this.socket.emit('set-locked', {
            teamInd,
            locked
        });
    }

    startTimer() {
        this.socket.emit('req_starttimer');
    }

    cancelTimer() {
        this.socket.emit('req_canceltimer');
    }

}

export { checkJoinCode, getUserInfo, join, auth, signIn, listTeams, getTournamentInfo, startTournament, advanceRound, createTeam, signOut, SocketManager };
