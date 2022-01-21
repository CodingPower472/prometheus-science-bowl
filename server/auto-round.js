
const db = require('./db');
const { google } = require('googleapis');
require('dotenv').config();

// In the future supposed to set mods and players to their correct rooms

async function startTournament() {
    let currTournament = await db.getTournamentInfo();
    console.log(currTournament);
    if (currTournament.currRound !== null) {
        return false;
    }
    await db.updateTournamentInfo({
        currentRound: 1
    });
    return true;
}

async function advanceRound() {
    let currTournament = await db.getTournamentInfo();
    let currRound = currTournament.currentRound;
    if (currRound === null) return null;
    currRound++;
    await db.updateTournamentInfo({
        currentRound: currRound
    });
    return currRound;
}

module.exports = {
    startTournament,
    advanceRound
};
