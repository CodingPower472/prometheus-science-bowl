
import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = process.env.REACT_APP_API_BASE;
const WEBSOCKET = process.env.REACT_APP_WEBSOCKET;

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

function reloadRound() {
    return axios.post(url('/reload-round'));
}

function advanceRound() {
    return axios.post(url('/advance-round'));
}

function setRound(n) {
    return axios.post(url('/set-round'), {
        roundNum: n
    });
}

function createTeam(teamName) {
    return axios.post(url('/create-team'), {
        teamName
    });
}

function signOut() {
    return axios.post(url('/signout'));
}

function getActiveGames() {
    return axios.get(url('/active-games'));
}

class SocketManager {

    check() {
        if (!this.socket) throw new Error('No socket.');
    }

    constructor() {
        this.url = WEBSOCKET;
    }
    connect() {
        this.socket = io(this.url, {
            withCredentials: true
        });
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
    endGame() {
        this.check();
        this.socket.emit('end');
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

    setCorrect(questionNum, teamInd, isBonus) {
        this.socket.emit('set-correct', {
            questionNum,
            teamInd,
            isBonus
        });
    }

    setIncorrect(questionNum, teamInd, isBonus) {
        this.socket.emit('set-incorrect', {
            questionNum,
            teamInd,
            isBonus
        });
    }

    setNeg(questionNum, teamInd) {
        this.socket.emit('set-neg', {
            questionNum,
            teamInd
        });
    }

    setNoBuzz(questionNum, teamInd) {
        this.socket.emit('set-no-buzz', {
            questionNum,
            teamInd
        });
    }

    nextQuestion() {
        this.check();
        this.socket.emit('next-question');
    }

    setQuestionNum(num) {
        this.check();
        if (num < 0) return;
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

export { checkJoinCode, getUserInfo, join, auth, signIn, listTeams, getTournamentInfo, startTournament, reloadRound, setRound, advanceRound, createTeam, signOut, getActiveGames, SocketManager };
