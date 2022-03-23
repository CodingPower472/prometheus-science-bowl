
const chalk = require('chalk');

const INITIAL_SIZE = 24;

class Scoreboard {

    constructor() {
        this.questions = [];
        this.whoBuzzed = [];
        this.offsets = [0, 0];
        this.currentSize = 0;
        this.extendToSize(INITIAL_SIZE);
    }

    rawScore(teamInd) {
        if (this.checktoob(teamInd)) return;
        let res = 0;
        for (let i = 0; i < this.currentSize; i++) {
            let oppInd = (teamInd === 0 ? 1 : 0);
            let q = this.questions[i][teamInd];
            let opp = this.questions[i][oppInd];
            if (opp.length > 0 && opp[0] === -1) {
                res += 4;
            }
            if (q.length > 0 && q[0] === 1) {
                res += 4;
            }
            if (q.length > 1) {
                res += q[1] * 10;
            }
        }
        return res;
    }

    totalScores() {
        let res = [this.offsets[0], this.offsets[1]];
        for (let i = 0; i < 2; i++) {
            res[i] += this.rawScore(i);
        }
        return res;
    }

    state() {
        return this.questions;
    }

    // will change nothing if size < this.currentSize
    extendToSize(size) {
        for (let i = this.currentSize; i < size; i++) {
            this.questions.push([[], []]);
            this.whoBuzzed.push([null, null]);
        }
        this.currentSize = Math.max(this.currentSize, size);
    }

    tossUpCorrect(questionNum, playerId, teamInd) {
        this.extendToSize(questionNum + 1); // question num should be zero-indexed
        if (this.checktoob(teamInd)) return;
        if (this.checkqoob(questionNum)) return;
        console.log('toss up correct');
        this.questions[questionNum][teamInd] = [1, 0];

        if (playerId) {
            // Individual statistics
            this.whoBuzzed[questionNum][teamInd] = playerId;
        }
    }

    tossUpIncorrect(questionNum, playerId, teamInd) {
        this.extendToSize(questionNum + 1);
        if (this.checktoob(teamInd)) return;
        if (this.checkqoob(questionNum)) return;
        console.log('toss up incorrect');
        this.questions[questionNum][teamInd] = [0];

        if (playerId) {
            this.whoBuzzed[questionNum][teamInd] = playerId;
        }
    }

    tossUpNeg(questionNum, playerId, teamInd) {
        this.extendToSize(questionNum + 1);
        if (this.checktoob(teamInd)) return;
        if (this.checkqoob(questionNum)) return;
        console.log('toss up neg');
        this.questions[questionNum][teamInd] = [-1];

        if (playerId) {
            this.whoBuzzed[questionNum][teamInd] = playerId;
        }
    }

    bonusCorrect(questionNum, teamInd) {
        this.extendToSize(questionNum + 1);
        if (this.checktoob(teamInd)) return;
        if (this.checkqoob(questionNum)) return;
        console.log('bonus correct');
        this.questions[questionNum][teamInd] = [1, 1];
    }

    bonusIncorrect(questionNum, teamInd) {
        this.extendToSize(questionNum + 1);
        if (this.checktoob(teamInd)) return;
        if (this.checkqoob(questionNum)) return;
        console.log('bonus incorrect');
        this.questions[questionNum][teamInd] = [1, 0];
    }

    noAnswer(questionNum, teamInd) {
        this.extendToSize(questionNum + 1);
        if (this.checktoob(teamInd)) return;
        if (this.checkqoob(questionNum)) return;
        this.questions[questionNum][teamInd] = [];
    }

    whoGotTU(questionNum) {
        if (this.checkqoob(questionNum)) return;
        if (questionNum < 0 || questionNum >= this.currentSize) return null;
        let q = this.questions[questionNum];
        for (let i = 0; i < 2; i++) {
            if (q[i].length > 0 && q[i][0] === 1) {
                return i;
            }
        }
        return null;
    }

    setOffset(teamInd, val) {
        if (this.checktoob(teamInd)) return;
        this.offsets[teamInd] = val;
    }

    checktoob(teamInd) {
        let fail = teamInd < 0 || teamInd > 1;
        if (fail) {
            console.log(chalk.red('Error: team index out of bounds'));
        }
        return fail;
    }

    checkqoob(questionNum) {
        let fail = questionNum < 0 || questionNum >= this.currentSize;
        if (fail) {
            console.log(chalk.red('Error: question num out of bounds'));
        }
        return fail;
    }

}

module.exports = {
    Scoreboard
};
