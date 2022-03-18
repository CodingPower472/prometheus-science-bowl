
const db = require('./db');
const { google } = require('googleapis');
let sheets = google.sheets('v4');
const privateKey = require('./secure/prometheus-2022-1-23');
const chalk = require('chalk');
require('dotenv').config();

const MAX_TEAMS = 1000;

const tournamentSpreadsheetId = process.env.TOURNAMENT_SPREADSHEET;
const scoresSpreadsheetId = process.env.SCORES_SPREADSHEET;
const teamRoomsSheet = process.env.TEAM_ROOMS_SHEET;
const modRoomsSheet = process.env.MOD_ROOMS_SHEET;

// In the future supposed to set mods and players to their correct rooms

// From https://www.labnol.org/convert-column-a1-notation-210601
const getA1Notation = (row, column) => {
    const a1Notation = [`${row + 1}`];
    const totalAlphabets = "Z".charCodeAt() - "A".charCodeAt() + 1;
    let block = column;
    while (block >= 0) {
        a1Notation.unshift(
            String.fromCharCode((block % totalAlphabets) + "A".charCodeAt())
            );
        block = Math.floor(block / totalAlphabets) - 1;
    }
    return a1Notation.join("");
};
    
async function getSheetInfo(sheetName) {
    let jwtClient = new google.auth.JWT(
        privateKey.client_email,
        null,
        privateKey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets'/*,
    'https://www.googleapis.com/auth/drive'*/]
    );
    console.log(`Sheet name: ${sheetName}`);
    let sheet = await new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: tournamentSpreadsheetId,
            range: sheetName,
            majorDimension: 'COLUMNS'
        }, (err, response) => {
            if (err) {
                return reject(err);
            }
            resolve(response);
        });
    });
    return sheet.data.values;
}

async function saveScores(games, roundNum) {
    console.log(chalk.green('Uploading scores to spreadsheet...'));
    let jwtClient = new google.auth.JWT(
        privateKey.client_email,
        null,
        privateKey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );
    let title = `Round ${roundNum} ${new Date().getTime()}`;
    let values = [
        ['Room ID', 'Team A', 'Team B', 'Score A', 'Score B']
    ];
    for (let roomId in games) {
        let game = games[roomId];
        if (game.teams[0] === null || game.teams[1] === null) continue;
        let arr = [roomId, game.teams[0].name, game.teams[1].name, game.teams[0].score, game.teams[1].score];
        values.push(arr);
    }
    await new Promise((resolve, reject) => {
        const request = {
            auth: jwtClient,
            spreadsheetId: scoresSpreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title
                            }
                        }
                    }
                ]
            }
        };
        sheets.spreadsheets.batchUpdate(request, (err, response) => {
            if (err) return reject(err);
            resolve(response);
        });
    });
    let last = getA1Notation(values.length, values[0].length);
    console.log(last);
    const request = {
        auth: jwtClient,
        spreadsheetId: scoresSpreadsheetId,
        range: `'${title}'!A1:${last}`,
        valueInputOption: 'RAW',
        insertDataOption: 'OVERWRITE',
        resource: {
            values
        }
    }
    await sheets.spreadsheets.values.append(request);
}

async function updateTeamRoomAssignments(roundNum) {
    console.log(`Updating team room assignments, now in round ${roundNum}`);
    await db.clearTeamRoomAssignments();
    let sheet = await getSheetInfo(teamRoomsSheet);
    let teamNames = sheet[0];
    let col = sheet[roundNum];
    if (!col) {
        console.warn(chalk.yellow('Warning: cannot auto-assign rooms.'));
        return;
    }
    let promises = [];
    for (let i = 1; i < col.length; i++) {
        if (col[i].length === 0) continue;
        promises.push(new Promise(async (resolve, reject) => {
            try {
                let tn = teamNames[i];
                let team = await db.findTeamWithName(tn, { include: 'members' });
                if (!team) {
                    console.warn(chalk.yellow(`Warning: team with name ${tn} not found. Skipping.`));
                    return resolve();
                }
                let room = await db.findRoomWithName(col[i]);
                if (!room) {
                    console.warn(chalk.yellow(`Warning: room with name ${col[i]} not found. Skipping.`));
                    return resolve();
                }
                await db.assignTeamRoom(team, room.id);
                resolve();
            } catch (err) {
                reject(err);
            }
        }));
    }
    await Promise.all(promises);
}

async function updateModRoomAssignments(roundNum) {
    await db.clearModRoomAssignments();
    let sheet = await getSheetInfo(modRoomsSheet);
    let modEmails = sheet[0];
    let col = sheet[roundNum + 1];
    let promises = [];
    for (let i = 1; i < col.length; i++) {
        promises.push(new Promise(async (resolve, reject) => {
            try {
                let modEmail = modEmails[i];
                if (!modEmail) return;
                let mod = await db.findModWithEmail(modEmail);
                if (!mod) {
                    console.error(`Warning: moderator with email ${modEmail} not found. Skipping.`);
                    return resolve();
                }
                let room = await db.findRoomWithName(col[i]);
                if (!room) {
                    console.error(`Warning: room with name ${col[i]} not found. Skipping.`);
                    return resolve();
                }
                await db.assignModRoom(mod, room.id);
                resolve();
                
            } catch (err) {
                reject(err);
            }
        }));
    }
    await Promise.all(promises);
}

async function updateRoomAssignments(roundNum) {
    try {
        let teams = updateTeamRoomAssignments(roundNum);
        let mods = updateModRoomAssignments(roundNum);
        return await Promise.all([teams, mods]);
    } catch (err) {
        console.error(`Error updating room assignments: ${err}`);
    }
}

async function startTournament() {
    let currTournament = await db.getTournamentInfo();
    if (currTournament.currentRound !== null) {
        return false;
    }
    await db.updateTournamentInfo({
        currentRound: 1
    });
    await updateRoomAssignments(1);
    return true;
}

async function reloadRound() {
    let currTournament = await db.getTournamentInfo();
    await updateRoomAssignments(currTournament.currentRound);
    return currTournament.currentRound;
}

async function advanceRound() {
    // TODO: emd all matches in the previous round
    let currTournament = await db.getTournamentInfo();
    let currRound = currTournament.currentRound;
    if (currRound === null) return null;
    currRound++;
    await db.updateTournamentInfo({
        currentRound: currRound
    });
    await updateRoomAssignments(currRound);
    return currRound;
}

async function setRound(roundNum) {
    await db.updateTournamentInfo({
        currentRound: roundNum
    });
    await updateRoomAssignments(roundNum);
    return roundNum;
}

module.exports = {
    startTournament,
    reloadRound,
    advanceRound,
    setRound,
    updateRoomAssignments,
    saveScores
};
