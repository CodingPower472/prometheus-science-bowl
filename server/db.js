
const Sequelize = require('sequelize');
require('dotenv').config();

console.log(process.env.DB_URL);

const db = new Sequelize(process.env.DB_URL);

const { Team, User, SessionToken, TournamentInfo, Room, GameRecord, ScoreboardHalfRow } = require('./models');


function start(onAuth) {
    try {
        db.authenticate().then(() => {
            onAuth();
            console.log('Authenticated successfully');
        });
    } catch (err) {
        console.error('Unable to connect to database', err);
    }
}

async function addMod(fullName) {
    return await User.create({
        fullName,
        email: payload.email,
        googleId: payload.sub,
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

async function findRoomWithId(id) {
    return await Room.findByPk(id);
}

async function addToken(user, token) {
    let sessionToken = await SessionToken.create({
        token
    });
    await user.addSessionToken(sessionToken.id);
}

async function createTeam(teamName, joinCode) {
    // TODO: fix issue with primary keys here
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
    console.log(`Assigning team ${team.name} to room ${roomId}`);
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

async function listTeams() {
    return await Team.findAll({
        where: {},
        include: ['members', Room]
    });
}

async function createGameRecord(roundNum, roomId, teams) {
    return await GameRecord.create({
        roundNum,
        roomId,
        teamAId: teams[0].id,
        teamBId: teams[1].id,
        scoreA: teams[0].score,
        scoreB: teams[1].score
    });
}

async function saveToGameRecord(gameRecordId, teams, scoreboard) {
    let promises = [];
    console.log(scoreboard);
    for (let i = 0; i < scoreboard.currentSize; i++) {
        let question = scoreboard.questions[i];
        let whoBuzzed = scoreboard.whoBuzzed[i];
        for (let teamInd = 0; teamInd < 2; teamInd++) {
            let frag = question[teamInd];
            let score = 0;
            if (frag.length > 0) {
                if (frag[0] === -1) {
                    score = -4;
                } else if (frag[0] === 1) {
                    if (frag.length > 1 && frag[1] === 1) {
                        score = 14;
                    } else {
                        score = 4;
                    }
                }
            }
            let buzzer = whoBuzzed[teamInd];
            let teamId = teams[teamInd].id;
            let isTeamA = (teamInd === 0);
            /*promises.push(ScoreboardHalfRow.create({
                gameRecordId,
                score,
                whoBuzzedGID: buzzer,
                teamId,
                isTeamA
            }));*/
            await ScoreboardHalfRow.create({
                gameRecordId,
                score,
                whoBuzzedGID: buzzer,
                teamId,
                isTeamA,
                isEmpty: (frag.length === 0)
            });
        }
    }
    return Promise.all(promises);
}

module.exports = {
    start,
    addMod,
    addAdmin,
    addTeamMember,
    findUserWithGID,
    findUserWithAuthToken,
    findTeamWithJoinCode,
    findTeamWithName,
    findRoomWithName,
    findRoomWithId,
    findModWithEmail,
    addToken,
    createTeam,
    getTournamentInfo,
    updateTournamentInfo,
    clearTeamRoomAssignments,
    assignTeamRoom,
    clearModRoomAssignments,
    assignModRoom,
    getRole,
    listTeams,
    createGameRecord,
    saveToGameRecord
};
