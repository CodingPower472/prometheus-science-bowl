
const db = require('./db');
const gen = require('./gen-codes');
const autoRound = require('./auto-round');

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const sessions = require('express-session');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');
const { application } = require('express');
const { use } = require('express/lib/application');
const client = new OAuth2Client(process.env.CLIENT_ID);

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(bodyParser.json());
app.use(sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'none'
    }
}));

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
        console.log(ticket.getPayload());
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
    console.log(user);
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
    console.log(payload.sub);
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
        console.log('req session');
        console.log(req.session);
        toSend.token = token;
        res.send(toSend);
    }
});

function userInfo(user) {
    let role = db.getRole(user);
    console.log(user);
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
    console.log(req.session);
    let token = req.session.token || req.body.authToken;
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
    console.log(user);
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
    } catch (err) {
        console.error(`Error starting the tournament: ${err}`);
        res.send(INTERNAL);
    }
});

app.post('/api/advance-round', async (req, res) => {
    console.log('Request to advance round');
    let user = await authUser(req);
    console.log(user);
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
    } catch (err) {
        res.send(INTERNAL);
        console.error(err);
    }
});

app.listen(8080);
