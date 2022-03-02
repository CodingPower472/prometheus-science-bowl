
import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = 'http://localhost:8080/api';
const WEBSOCKET = 'ws://localhost:8080';

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
    constructor() {
        this.url = WEBSOCKET;
    }
    connect() {
        this.socket = io(this.url);
    }
    setOnConnect(cb) {
        if (!this.socket) throw new Error('No socket.');
        this.socket.on('connect', cb);
    }
    setOnConnectError(cb) {
        if (!this.socket) throw new Error('No socket.');
        this.socket.on('connect_error', cb);
    }
    setOnJoinError(cb) {
        if (!this.socket) throw new Error('No socket.');
        this.socket.on('joinerr', cb);
    }
    setOnDisconnect(cb) {
        if (!this.socket) throw new Error('No socket.');
        this.socket.on('disconnect', cb);
    }
    setOnUpdate(cb) {
        if (!this.socket) throw new Error('No socket.');
        this.socket.on('update', cb);
    }
    setOnRoomJoined(cb) {
        if (!this.socket) throw new Error('No socket.');
        this.socket.on('joined', cb);
    }

    sendEvent(message) {
        this.socket.emit('event', message);
    }
    joinRoom(data) {
        this.socket.emit('join', data);
    }
    startGame() {
        this.socket.emit('start');
    }
    buzz() {
        this.socket.emit('buzz');
    }

}

export { checkJoinCode, getUserInfo, join, auth, signIn, listTeams, getTournamentInfo, startTournament, advanceRound, createTeam, signOut, SocketManager };
