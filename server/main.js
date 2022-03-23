
const db = require('./db');
const gen = require('./gen-codes');
const autoRound = require('./auto-round');
const { Game } = require('./Game');

const express = require('express');
require('dotenv').config();
const cors = require('cors');
//const sessions = require('express-session');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const { application } = require('express');
const { use } = require('express/lib/application');
const client = new OAuth2Client(process.env.CLIENT_ID);
const http = require('http');
const chalk = require('chalk');
//const sharedsession = require('express-socket.io-session');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const path = require('path');

const { Server } = require('socket.io');

const app = express();
const server = http.Server(app);
let ioOptions = {};

if (process.env.CORS === 'on') {
    app.use(cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    ioOptions.cors = {
        origin: `${process.env.CLIENT_URL}`,
        methods: ['GET', 'POST'],
        credentials: true
    };
}

const io = new Server(server, ioOptions);

app.set('trust proxy', 1);
app.use(bodyParser.json());
const cparser = cookieParser(process.env.SESSION_SECRET);
app.use(cparser);

try {
    db.start(async () => {
        let info = await db.getTournamentInfo();
        if (info.currentRound !== null) {
            await saveGames();
            await autoRound.updateRoomAssignments(info.currentRound);
            await createGames(info.currentRound);
        }
    });
} catch (err) {
    console.error(chalk.red(err));
}

async function authSocket(socket) {
    try {
        if (!socket.handshake.headers.cookie) return null;
        let ourCookie = cookie.parse(socket.handshake.headers.cookie);
        let token = cookieParser.signedCookie(ourCookie.authtoken, process.env.SESSION_SECRET);
        if (!token) return null;
        return await db.findUserWithAuthToken(token);
    } catch (err) {
        console.error(chalk.red(err));
        console.trace(err);
        return null;
    }
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
        //return; TODO: IN PRODUCTION PLEASE UNCOMMENT THIS FOR THE LOVE OF GOD
    }
    socket.emit('authorized');
    socket.on('join', async data => {
        if (data.authToken) {
            user = await db.findUserWithAuthToken(data.authToken);
        }
        try {
            console.log('Request to join.');
            let roomId = parseInt(data.room);
            let unassignedMessage = {
                errorCode: 'noassign',
                errorMessage: 'User is not assigned to this room.',
                correctRoom: roomId
            };
            if (user.isPlayer && user.roomId !== roomId) {
                socket.emit('joinerr', unassignedMessage);
                return;
            }
            let roomWarning = false;
            if (user.isMod && user.roomId !== roomId) {
                if (process.env.TRUST_MODS === 'on') {
                    console.warn('Moderator is joining an unassigned room.');
                    roomWarning = true;
                } else {
                    console.warn('Moderator is being prevented from joining an unassigned room.');
                    socket.emit('joinerr', unassignedMessage);
                }
            }
            socket.join(roomId);
            let room = await db.findRoomWithId(roomId);
            if (!room) return;
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
                try {
                    if (game) {
                        io.to(roomId).emit('update', game.state());
                    } else {
                        console.error(chalk.red('Attempted to update game state when game does not exist'));
                    }
                } catch (err) {
                    console.error(chalk.red(err));
                }
            }
            function send(a, b) {
                try {
                    if (game) {
                        if (b) {
                            io.to(roomId).emit(a, b);
                        } else {
                            io.to(roomId).emit(a);
                        }
                    }
                } catch (err) {
                    console.error(chalk.red(err));
                }
            }
            function broadcast(val) {
                if (!val) return false;
                if (val.length > 1) {
                    let msg = val[0];
                    let data = val[1];
                    send(msg, data);
                    return true;
                } else if (val.length > 0) {
                    let msg = val[0];
                    send(msg);
                    return true;
                }
                return false;
            }
            console.log('Successfully joined');
            if (!game) {
                console.warn(chalk.yellow('Game not found.'));
                return;
            }
            try {
                let found = game.findGoogleID(user.googleId);
                socket.emit('joined', {
                    room: nextRoom,
                    user: userInfo(user),
                    teamIndex: found ? found[1] : null,
                    roomWarning: roomWarning // if TRUST_MODS is on, a warning message will be displayed to mods when they join a room they are not assigned to.  Otherwise, they will be prevented from joining.
                });
                roomUpdate();
            } catch (err) {
                console.error(chalk.red(err));
            }
            
            socket.on('disconnect', () => {
                try {
                    if (game) {
                        game.setJoined(user.googleId, false);
                        roomUpdate();
                    }
                } catch (err) {
                    console.error(chalk.red(err));
                }
            });
            if (user.isPlayer) {
                socket.on('buzz', async () => {
                    try {
                        console.log('Buzz sent');
                        let hasMessage = broadcast(game.buzz(user.googleId));
                        if (hasMessage) {
                            roomUpdate();
                        }
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('focus', async () => {
                    try {
                        game.setPlayedFocused(user.googleId, true);
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                        console.trace(err);
                    }
                });
                socket.on('blur', async () => {
                    try {
                        game.setPlayedFocused(user.googleId, false);
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
            } else if (user.isMod || user.isAdmin) {
                socket.on('start', async () => {
                    try {
                        if (game) {
                            game.start();
                            roomUpdate();
                        }
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('end', async () => {
                    try {
                        game.end();
                        roomUpdate();
                        gameSave(roomId);
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('ignorebuzz', async () => {
                    try {
                        game.ignoreBuzz();
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('correctanswer', async () => {
                    try {
                        broadcast(game.correctLive());
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('incorrectanswer', async () => {
                    try {
                        let onBonus = game.onBonus;
                        let wereAllLocked = game.incorrectLive();
                        if (onBonus) {
                            send('timercancel');
                        } else if (!wereAllLocked) {
                            broadcast(game.startTimer(() => {
                                roomUpdate();
                            }));
                        }
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('neganswer', async () => {
                    try {
                        game.negLive();
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('set-correct', ({questionNum, teamInd, isBonus}) => {
                    try {
                        console.log(`Correct ${teamInd}`);
                        game.correctAnswer(questionNum, null, teamInd, isBonus);
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-incorrect', ({questionNum, teamInd, isBonus}) => {
                    try {
                        console.log(`Incorrect ${teamInd}`)
                        game.incorrectAnswer(questionNum, null, teamInd, isBonus);
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-neg', ({questionNum, teamInd}) => {
                    try {
                        console.log(`Negging ${teamInd}`);
                        game.negAnswer(questionNum, null, teamInd);
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-no-buzz', ({questionNum, teamInd}) => {
                    try {
                        console.log(`No buzz ${teamInd}`);
                        game.noAnswer(questionNum, teamInd);
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('next-question', async () => {
                    try {
                        broadcast(game.nextQuestion());
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-question-num', async num => {
                    try {
                        broadcast(game.setQuestionNum(num));
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-on-bonus', isBonus => {
                    try {
                        broadcast(game.setOnBonus(isBonus));
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                socket.on('set-locked', ({ teamInd, locked }) => {
                    try {
                        game.setLocked(teamInd, locked);
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('req_starttimer', () => {
                    try {
                        if (game.timerRunning) return;
                        broadcast(game.startTimer(wasBonus => {
                            console.log('timer done!');
                            roomUpdate();
                        }));
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
                socket.on('req_canceltimer', () => {
                    try {
                        if (!game.timerRunning) return;
                        broadcast(game.cancelTimer());
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });

                socket.on('set-offset', ({teamInd, amount}) => {
                    try {
                        game.setOffset(teamInd, amount);
                        roomUpdate();
                    } catch (err) {
                        console.error(chalk.red(err));
                    }
                });
                
            }
        } catch (err) {
            console.error(chalk.red(err));
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
    try {
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
    } catch (err) {
        console.error(chalk.red(`Error checking code: ${err}`));
    }
});

app.post('/api/user-info', async (req, res) => {
    try {
        let token = req.body.googleToken;
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

async function assignToken(req, res, user) {
    try {
        let token = gen.genSessionToken();
        /*req.session.token = token;
        req.session.created = Date.now();*/
        res.cookie('authtoken', token, {
            expires: new Date(2147483647 * 1000), // maximum expiry date
            httpOnly: true,
            secure: (process.env.SECURE !== 'off'),
            signed: true
        });
        await db.addToken(user, token);
        return token;
    } catch (err) {
        console.error(chalk.red(`Error assigning token: ${err}`));
        return null;
    }
}

app.post('/api/join', async (req, res) => {
    try {
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
            let token = await assignToken(req, res, user);
            toSend.token = token;
            res.send(toSend);
        }
    } catch (err) {
        console.error(chalk.red(`Error joining: ${err}`));
    }
});

function userInfo(user) {
    try {
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
    } catch (err) {
        console.error(chalk.red(`Error getting user info: ${err}`));
        return null;
    }
}

app.post('/api/signin', async (req, res) => {
    try {
        let googleAuthToken = req.body.googleToken;
        const ticket = await client.verifyIdToken({
            idToken: googleAuthToken,
            audience: process.env.CLIENT_ID
        });
        const payload = ticket.getPayload();
        let googleId = payload.sub;
        let user = await db.findUserWithGID(googleId);
        if (user) {
            let token = await assignToken(req, res, user);
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
    } catch (err) {
        console.error(chalk.red(`Error signing in: ${err}`));
    }
});

app.post('/api/signout', async (req, res) => {
    try {
        console.log('Signing out');
        res.clearCookie('authtoken');
        res.send({
            success: true
        });
    } catch (err) {
        console.error(chalk.red(`Error signing out: ${err}`));
    }
});

async function authUser(req) {
    try {
        let token = req.signedCookies.authtoken;
        if (!token) return null;
        let user = await db.findUserWithAuthToken(token);
        return user;
    } catch (err) {
        console.error(`Error authenticating user: ${err}`);
    }
}

app.get('/api/auth', async (req, res) => {
    try {
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
    } catch (err) {
        console.error(chalk.red(`Error authenticating: ${err}`));
    }
});

app.get('/api/get-room', async (req, res) => {
    try {
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
    } catch (err) {
        console.error(chalk.red(`Error getting room: ${err}`));
    }
});

app.post('/api/create-team', async (req, res) => {
    try {
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
    try {
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
        }
        let tournamentInfo = await db.getTournamentInfo();
        res.send(tournamentInfo);
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.post('/api/start-tournament', async (req, res) => {
    try {
        console.log('Request to start the tournament');
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
        }
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
        await createGames(worked);
    } catch (err) {
        console.error(`Error starting the tournament: ${err}`);
        res.send(INTERNAL);
    }
});

async function gameSave(roomId) {
    try {
        let game = currentGames[roomId];
        let roundNum = game.roundNum;
        game.updateScores();
        let teams = game.teams;
        let gameRecord = await db.createGameRecord(roundNum, roomId, teams);
        return await db.saveToGameRecord(gameRecord.id, teams, game.scoreboard);
    } catch (err) {
        console.error(`Database saving games error: ${chalk.red(err)}`);
    }
}

async function saveGames() {
    let arr = Object.keys(currentGames);
    if (arr.length > 0) {
        let roundNum = currentGames[arr[0]].roundNum;
        await autoRound.saveScores(currentGames, roundNum)
    }
    // TODO: save all games from this current round to database
    let promises = [];
    for (let roomId in currentGames) {
        if (!currentGames[roomId].active()) continue;
        let game = gameSave(roomId);
        if (game) {
            promises.push(game);
        }
    }
    return promises;
}

async function createGames(roundNum) {
    try {
        console.log(chalk.green('Create games has been called.'));
        let teams = await db.listTeams();
        teams.sort((a, b) => a.name.localeCompare(b.name));
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
                currentGames[roomId] = new Game(team, null, roundNum);
            }
        }
        for (let roomId in currentGames) {
            let game = currentGames[roomId];
            if (game.teams[0] === null || game.teams[1] === null) {
                console.warn(`Warning: game on room ${roomId} is being deleted because it does not have two teams.`);
                delete game[roomId];
            }
        }
    } catch (err) {
        console.error(chalk.red(`Error creating games: ${err}`));
    }
}

app.post('/api/reload-round', async (req, res) => {
    try {
        console.log('Request to reload round');
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
            return;
        }
        await saveGames();
        let round = await autoRound.reloadRound();
        res.send({
            success: true,
            currentRound: round
        });
        await createGames(round);
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.post('/api/advance-round', async (req, res) => {
    try {
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
        await saveGames();
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
        await createGames(worked);
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.post('/api/set-round', async (req, res) => {
    try {
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
        await saveGames();
        let roundNum = req.body.roundNum;
        await autoRound.setRound(roundNum);
        res.send({
            success: true,
            currentRound: roundNum
        });
        await createGames(roundNum);
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.get('/api/list-teams', async (req, res) => {
    try {
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
            return;
        }
        let teams = await db.listTeams();
        teams.sort((a, b) => b.members.length - a.members.length);
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

app.get('/api/active-games', async (req, res) => {
    try {
        let user = await authUser(req);
        if (!user) {
            res.send(INVALID_TOKEN);
            return;
        }
        if (!user.isAdmin) {
            res.send(NO_PERMS);
            return;
        }
        let active = [];
        for (let roomId in currentGames) {
            let game = currentGames[roomId];
            let roomName = (await db.findRoomWithId(roomId)).roomName;
            //if (game.active()) {
            if (!game.finished) {
                active.push({
                    ...game,
                    roomName
                });
            }
        }
        res.json({
            success: true,
            activeGames: active
        });
    } catch (err) {
        console.error(chalk.red(`Error listing active games: ${err}`));
    }
});

app.get('/api/packets/:roundNum', async (req, res) => {
    try {
        let roundNum = parseInt(req.params.roundNum);
        let tournamentInfo = await db.getTournamentInfo();
        if (tournamentInfo.currentRound !== roundNum) {
            res.status(403).end();
            return;
        }
        let user = await authUser(req);
        if (!user) {
            res.status(403).end();
            return;
        }
        let allowed = user.isAdmin;
        if (user.isMod) {
            allowed = (user.roomId !== null);
        }
        if (!allowed) {
            res.status(403).end();
            return;
        }
        res.sendFile(path.join(__dirname, 'rounds', `round${roundNum}.pdf`));
    } catch (err) {
        console.error(chalk.red(`Error getting packet: ${err}`));
    }
});

process.on('uncaughtException', err => {
    console.error(chalk.red(`Uncaught error: ${err}`));
    console.trace(err);
    saveGames()
        .then(() => {
            console.log('Emergency backup of games completed.');
        })
        .catch(console.error);
});

server.listen(8080);
