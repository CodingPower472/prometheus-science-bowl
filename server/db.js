
const Sequelize = require('sequelize');
require('dotenv').config();

console.log(process.env.DB_URL);

const db = new Sequelize(process.env.DB_URL);

const { Team, User, SessionToken, TournamentInfo, Room } = require('./models');

try {
    db.authenticate().then(() => {
        console.log('Authenticated successfully');
    });
} catch (err) {
    console.error('Unable to connect to database', err);
}

async function addMod(fullName) {
    return await User.create({
        fullName,
        teamId: null,
        teamPosition: null,
        roomId: null,
        isPlayer: false,
        isMod: true,
        isAdmin: false
    })
        .catch(console.error);
}

async function addAdmin(fullName, payload) {
    console.log('add admin');
    return await User.create({
        fullName,
        email: payload.email,
        googleId: payload.sub,
        teamId: null,
        teamPosition: null,
        roomId: null,
        isPlayer: false,
        isMod: false,
        isAdmin: true
    })
        .catch(console.error);
}

async function addTeamMember(team, fullName, payload) {
    return await User.create({
        fullName,
        email: payload.email,
        googleId: payload.sub,
        teamId: team.id,
        teamPosition: Math.floor(Math.random() * 1000000),
        roomId: null,
        isPlayer: true,
        isMod: false,
        isAdmin: false
    });
}

async function findUserWithGID(gid) {
    return await User.findOne({
        where: {
            googleId: gid
        },
        include: [
            {
                model: SessionToken,
                as: 'sessionTokens'
            }
        ]
    });
}

async function findUserWithAuthToken(token) {
    let sessionToken = await SessionToken.findOne({
        where: {
            token
        },
        include: {
            model: User,
            include: Team
        }
    });
    return sessionToken ? sessionToken.User : null;
}

async function findTeamWithJoinCode(code) {
    return await Team.findOne({
        where: {
            joinCode: code
        }
    });
}

async function findTeamWithName(name, options) {
    let opts = options || {};
    return await Team.findOne({
        where: {
            name
        },
        ...opts
    });
}

async function findModWithEmail(email) {
    return await User.findOne({
        where: {
            email,
            isMod: true
        }
    });
}

async function findRoomWithName(name) {
    return await Room.findOne({
        where: {
            roomName: name
        }
    });
}

async function addToken(user, token) {
    let sessionToken = await SessionToken.create({
        token
    });
    await user.addSessionToken(sessionToken.id);
}

async function createTeam(teamName, joinCode) {
    await Team.create({
        name: teamName,
        joinCode,
        roomId: null
    });
}

async function getTeamOfUser(user) {
    let id = user.teamId;
    return await Team.findByPk(id);
}

async function getTournamentInfo() {
    return await TournamentInfo.findOne();
}

async function updateTournamentInfo(next) {
    return await TournamentInfo.update(
        next,
        { where: {} }
    );
}

async function clearTeamRoomAssignments() {
    return await Team.update(
        {
            roomId: null
        },
        { where: {} }
    );
}

async function assignTeamRoom(team, roomId) {
    let changeTeamProm = team.update({
        roomId
    });
    let changeMembersProm = User.update({
        roomId
    }, {
        where: {
            teamId: team.id
        }
    });
    return await Promise.all([changeTeamProm, changeMembersProm])
}

async function clearModRoomAssignments() {
    return await User.update(
        {
            roomId: null
        },
        {
            where: {
                isMod: true
            }
        }
    );
}

async function assignModRoom(mod, roomId) {
    return await mod.update({
        roomId
    });
}

function getRole(user) {
    if (user.isAdmin) {
        return 'admin';
    }
    if (user.isMod) {
        return 'mod';
    }
    if (user.isPlayer) {
        return 'player';
    }
    throw new Error('User has no role.');
}

module.exports = {
    addMod,
    addAdmin,
    addTeamMember,
    findUserWithGID,
    findUserWithAuthToken,
    findTeamWithJoinCode,
    findTeamWithName,
    findRoomWithName,
    findModWithEmail,
    addToken,
    createTeam,
    getTournamentInfo,
    updateTournamentInfo,
    clearTeamRoomAssignments,
    assignTeamRoom,
    clearModRoomAssignments,
    assignModRoom,
    getRole
};
