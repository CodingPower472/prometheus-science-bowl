
const db = require('./db');
const gen = require('./gen-codes');
const autoRound = require('./auto-round');
const { Game } = require('./Game');

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const sessions = require('express-session');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const { application } = require('express');
const { use } = require('express/lib/application');
const client = new OAuth2Client(process.env.CLIENT_ID);
const http = require('http');
const chalk = require('chalk');
const sharedsession = require('express-socket.io-session');

const { Server } = require('socket.io');

const app = express();
const server = http.Server(app);
const io = new Server(server, {
    cors: {
        origin: `${process.env.CLIENT_URL}`,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());
let session = sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: true,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    }
})
app.use(session);
io.use(sharedsession(session, {
    autoSave: false // NOTE: if i need to change variables from socketio later, change this to true
}));

db.start(async () => {
    let info = await db.getTournamentInfo();
    if (info.currentRound !== null) {
        await saveGames();
        await autoRound.updateRoomAssignments(info.currentRound);
        await createGames();
    }
});

async function authSocket(socket) {
    let session = socket.handshake.session;
    if (!session.token) {
        let sessions = socket.handshake.sessionStore.sessions;
        if (Object.values(sessions).length > 1) {
            console.warn('Warning: more than one value in session store.');
        }
        sessions = Object.values(sessions);
        session = sessions[sessions.length - 1];
        if (!session) return null;
        session = JSON.parse(session);
    }
    return await db.findUserWithAuthToken(session.token);
}

let currentGames = {};

io.on('connection', async socket => {
    let user = await authSocket(socket);
    if (!user) {
        console.log('Unauthed user tried to join websocket');
        socket.emit('joinerr', {
            errorCode: 'unauthed',
            errorMessage: 'Could not successfully authenticate user.'
        });
        return;
    }
    socket.emit('authorized');
    socket.on('join', async data => {
        console.log('Request to join.')
        // TODO: check if player should actually be there
        let roomId = data.room;
        socket.join(roomId);
        let room = await db.findRoomWithId(data.room);
        let nextRoom = await room.get({ plain: true });
        let game = null;
        if (data.room in currentGames) {
            currentGames[data.room].setJoined(user.googleId, true);
            game = currentGames[data.room];
            nextRoom.game = game.state();
        } else {
            nextRoom.game = null;
        }
        function roomUpdate() {
            if (game) {
                io.to(roomId).emit('update', game.state());
            } else {
                console.error(chalk.red('Attempted to update game state when game does not exist'));
            }
        }
        function send(a, b) {
            if (game) {
                if (b) {
                    io.to(roomId).emit(a, b);
                } else {
                    io.to(roomId).emit(a);
                }
            }
        }
        console.log('Successfully joined');
        let found = game.findGoogleID(user.googleId);
        socket.emit('joined', {
            room: nextRoom,
            user: userInfo(user),
            teamIndex: found ? found[1] : null
        });
        socket.on('disconnect', () => {
            console.log('USER DISCONNECT');
            if (game) {
                game.setJoined(user.googleId, false);
            }
        });
        if (user.isAdmin || user.isMod) {
            socket.on('start', async () => {
                if (game) {
                    game.start();
                    roomUpdate();
                }
            });
        }
        if (user.isPlayer) {
            socket.on('buzz', async () => {
                if (!game.buzzActive) {
                    console.log('Successful buzz');
                    game.buzz(user.googleId);
                    send('timercancel');
                    roomUpdate();
                }
            });
        } else if (user.isMod || user.isAdmin) {
            socket.on('ignorebuzz', async () => {
                game.clearBuzzer();
                roomUpdate();
            });
            socket.on('correctanswer', async () => {
                if (game.onBonus) {
                    send('timercancel');
                }
                game.correctLive();
                roomUpdate();
            });
            socket.on('incorrectanswer', async () => {
                if (game.onBonus) {
                    send('timercancel');
                } else {
                    send('timerreset');
                }
                game.incorrectLive();
                roomUpdate();
            });
            socket.on('neganswer', async () => {
                game.negLive();
                roomUpdate();
            });

            socket.on('next-question', async () => {
                game.nextQuestion();
                send('timercancel');
                roomUpdate();
            });
            socket.on('set-question-num', async num => {
                game.setQuestionNum(num);
                send('timercancel');
                roomUpdate();
            });
            socket.on('set-on-bonus', isBonus => {
                game.setOnBonus(isBonus);
                send('timercancel');
                roomUpdate();
            });
            socket.on('set-locked', ({ teamInd, locked }) => {
                game.setLocked(teamInd, locked);
                roomUpdate();
            });

            socket.on('req_starttimer', () => {
                let time = game.startTimer(wasBonus => {
                    roomUpdate();
                });
                send('timerstart', time);
            });

            socket.on('req_canceltimer', () => {
                game.cancelTimer();
                send('timercancel');
            });

            socket.on('req_canceltimer', () => {
                game.cancelTimer();
            });
        }
    });
});

const MOD_JOIN_CODE = process.env.MOD_JOIN_CODE;
const ADMIN_JOIN_CODE = process.env.ADMIN_JOIN_CODE;

const INVALID_TOKEN = {
    success: false,
    errorCode: 'errInvalidToken',
    errorMessage: 'Sorry, your session token is either invalid or missing.'
};

const INTERNAL = {
    success: false,
    errorCode: 'errInternal',
    errorMessage: 'Sorry, an internal server error occured.'
};

const NO_PERMS = {
    success: false,
    errorCode: 'errNoPerms',
    errorMessage: 'You do not have sufficient permissions to do this.'
};

app.post('/api/check-code', async (req, res) => {
    console.log('check code');
    let code = req.body.code;
    if (code === MOD_JOIN_CODE) {
        res.send({
            success: true,
            role: 'mod'
        });
    } else if (code === ADMIN_JOIN_CODE) {
        res.send({
            success: true,
            role: 'admin'
        });
    } else {
        // Search for join code's team and send the team name back
        let team = await db.findTeamWithJoinCode(code);
        if (team) {
            res.send({
                success: true,
                role: 'player',
                teamName: team.name
            });
        } else {
            res.send({
                success: false,
                role: null,
                errorCode: 'errInvalidCode',
                errorMessage: 'Code could not be found.'
            });
        }
    }
});

app.post('/api/user-info', async (req, res) => {
    let token = req.body.googleToken;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID
        });
        const { name, email, picture, sub } = ticket.getPayload();
        // USE SUB FOR USER ID
        res.send({
            success: true,
            name,
            email,
            picture
        });
    } catch (err) {
        console.error(`Error getting user info: ${err}`);
        res.send({
            success: false,
            errorMessage: 'Error getting user info. The OAuth token is probably invalid.'
        });
    }
});

async function assignToken(req, user) {
    let token = gen.genSessionToken();
    req.session.token = token;
    req.session.created = Date.now();
    await db.addToken(user, token);
    return token;
}

app.post('/api/join', async (req, res) => {
    let code = req.body.code;
    let fullName = req.body.fullName;
    let googleAuthToken = req.body.googleToken;
    const ticket = await client.verifyIdToken({
        idToken: googleAuthToken,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();
    let previous = await db.findUserWithGID(payload.sub);
    if (previous !== null) {
        res.send({
            success: false,
            errorCode: 'errAlreadyExists',
            errorMessage: 'Sorry, a user has already been created with this Google account.'
        });
        return;
    }
    let toSend = {
        success: true,
        fullName,
        email: payload.email,
        picture: payload.picture,
        googleId: payload.sub
    };
    let success = true;
    let user = null;
    if (code === MOD_JOIN_CODE) {
        user = await db.addMod(fullName, payload);
        toSend.role = 'mod';
    } else if (code === ADMIN_JOIN_CODE) {
        user = await db.addAdmin(fullName, payload);
        toSend.role = 'admin';
    } else {
        // Search for join code's team
        let team = await db.findTeamWithJoinCode(code);
        if (team) {
            user = await db.addTeamMember(team, fullName, payload);
            toSend.role = 'player';
        } else {
            // If nothing found
            res.send({
                success: false,
                errorCode: 'errInvalidCode',
                errorMessage: 'This join code was not recognized.'
            });
            success = false;
        }
    }
    if (success) {
        let token = await assignToken(req, user);
        toSend.token = token;
        res.send(toSend);
    }
});

function userInfo(user) {
    let role = db.getRole(user);
    return {
        fullName: user.fullName,
        email: user.email,
        teamPosition: user.teamPosition,
        roomId: user.roomId,
        isPlayer: user.isPlayer,
        isMod: user.isMod,
        isAdmin: user.isAdmin,
        team: user.Team,
        role
    };
}

app.post('/api/signin', async (req, res) => {
    let googleAuthToken = req.body.googleToken;
    const ticket = await client.verifyIdToken({
        idToken: googleAuthToken,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();
    let googleId = payload.sub;
    let user = await db.findUserWithGID(googleId);
    if (user) {
        let token = await assignToken(req, user);
        res.send({
            success: true,
            isAuthed: true,
            token,
            user: userInfo(user)
        });
    } else {
        res.send({
            success: false,
            isAuthed: false,
            errorCode: 'errUserNotFound',
            errorMessage: 'Existing user with this Google account could not be found'
        });
    }
});

app.post('/api/signout', async (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.send(INTERNAL);
        } else {
            res.send({
                success: true
            });
        }
    });
});

async function authUser(req) {
    let token = req.session.token || (req.body && req.body.authToken);
    if (!token) return null;
    let user = await db.findUserWithAuthToken(token);
    return user;
}

app.get('/api/auth', async (req, res) => {
    let user = await authUser(req);
    if (user) {
        let role = db.getRole(user);
        res.send({
            success: true,
            isAuthed: true,
            user: userInfo(user)
        });
    } else {
        res.send({
            success: true,
            isAuthed: false,
            user: null
        });
    }
});

app.get('/api/get-room', async (req, res) => {
    let user = await authUser(req);
    if (!user) {
        res.send(INVALID_TOKEN);
        return;
    }
    // If you're an admin, you don't have room assignments
    if (user.isAdmin) {
        res.send({
            success: false,
            errorCode: 'errIsAdmin',
            errorMessage: 'Admins don\'t have room assignments.'
        });
        return;
    }
    let roomId = user.roomId;
    let hasRoom = (roomId !== null);
    res.send({
        success: true,
        hasRoom,
        roomId
    });
});

app.post('/api/create-team', async (req, res) => {
    let user = await authUser(req);
    if (!user) {
        res.send(INVALID_TOKEN);
        return;
    }
    if (!user.isAdmin) {
        res.send(NO_PERMS);
        return;
    }
    let teamName = req.body.teamName;
    let joinCode = gen.genJoinCode();
    try {
        await db.createTeam(teamName, joinCode);
        res.send({
            success: true,
            teamName,
            joinCode
        });
    } catch (err) {
        console.error(`Error creating team: ${err}`);
        res.send(INTERNAL);
    }
});

app.get('/api/tournament-info', async (req, res) => {
    let user = await authUser(req);
    if (!user) {
        res.send(INVALID_TOKEN);
        return;
    }
    if (!user.isAdmin) {
        res.send(NO_PERMS);
    }
    try {
        let tournamentInfo = await db.getTournamentInfo();
        res.send(tournamentInfo);
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.post('/api/start-tournament', async (req, res) => {
    console.log('Request to start the tournament');
    let user = await authUser(req);
    if (!user) {
        res.send(INVALID_TOKEN);
        return;
    }
    if (!user.isAdmin) {
        res.send(NO_PERMS);
    }
    try {
        let worked = await autoRound.startTournament();
        if (worked) {
            res.send({
                success: true,
                currentRound: 1
            });
        } else {
            res.send({
                success: false,
                errorCode: 'errAlreadyStarted',
                errorMessage: 'Can\'t start the tournament because it\'s already started!'
            });
        }
        await createGames();
    } catch (err) {
        console.error(`Error starting the tournament: ${err}`);
        res.send(INTERNAL);
    }
});

async function saveGames() {
    // TODO: save all games from this current round to database
}

async function createGames() {
    let teams = await db.listTeams();
    teams.sort((a, b) => a.name.localeCompare(b.name));
    console.log(teams.map(team => team.name));
    currentGames = {};
    for (let team of teams) {
        team = await team.get({ plain: true })
        let roomId = team.roomId;
        if (roomId === null) continue;
        if (roomId in currentGames) {
            let game = currentGames[roomId];
            if (game.teamB() !== null) {
                console.warn('More than two teams assigned to the same room.');
                continue;
            }
            game.setTeamB(team);
        } else {
            currentGames[roomId] = new Game(team, null, (a, b) => {
                console.log(`sending message: ${a}`)
                if (b) {
                    io.to(roomId).emit(a, b);
                } else {
                    io.to(roomId).emit(a);
                }
            });
        }
    }
}

app.post('/api/advance-round', async (req, res) => {
    await saveGames();
    console.log('Request to advance round');
    let user = await authUser(req);
    if (!user) {
        res.send(INVALID_TOKEN);
        return;
    }
    if (!user.isAdmin) {
        res.send(NO_PERMS);
        return;
    }
    try {
        let worked = await autoRound.advanceRound();
        if (worked === null) {
            res.send({
                success: false,
                errorCode: 'errNotStarted',
                errorMessage: 'You must start the tournament before attempting to advance the round'
            });
            return;
        }
        res.send({
            success: true,
            currentRound: worked
        });
        await createGames();
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.get('/api/list-teams', async (req, res) => {
    let user = await authUser(req);
    if (!user) {
        res.send(INVALID_TOKEN);
        return;
    }
    if (!user.isAdmin) {
        res.send(NO_PERMS);
        return;
    }
    try {
        let teams = await db.listTeams();
        teams.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        teams = teams.map(team => {
            team.members = team.members.map(userInfo);
            return team;
        });
        res.json({
            success: true,
            teams
        });
    } catch (err) {
        console.error(err);
        res.send(INTERNAL);
    }
});

server.listen(8080);
