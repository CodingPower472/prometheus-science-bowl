
const Sequelize = require('sequelize');
require('dotenv').config();

console.log(process.env.DB_URL);

const db = new Sequelize(process.env.DB_URL);

const { Team, User, SessionToken, TournamentInfo } = require('./models');

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
    await User.create({
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
        include: User
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

module.exports = {
    addMod,
    addAdmin,
    addTeamMember,
    findUserWithGID,
    findUserWithAuthToken,
    findTeamWithJoinCode,
    addToken,
    createTeam,
    getTournamentInfo,
    updateTournamentInfo
};
