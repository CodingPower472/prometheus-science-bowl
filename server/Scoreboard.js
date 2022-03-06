
class Scoreboard {

    constructor() {
        this.questions = [];
        this.whoBuzzed = [];
        this.currentSize = 0;
        this.extendToSize(1);
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
        console.log('toss up correct');
        this.extendToSize(questionNum + 1); // question num should be zero-indexed
        this.questions[questionNum][teamInd] = [1];

        if (playerId) {
            // Individual statistics
            this.whoBuzzed[questionNum][teamInd] = playerId;
        }
    }

    tossUpIncorrect(questionNum, playerId, teamInd) {
        console.log('toss up incorrect');
        this.extendToSize(questionNum + 1);
        this.questions[questionNum][teamInd] = [0];

        if (playerId) {
            this.whoBuzzed[questionNum][teamInd] = playerId;
        }
    }

    tossUpNeg(questionNum, playerId, teamInd) {
        console.log('toss up neg');
        this.extendToSize(questionNum + 1);
        this.questions[questionNum][teamInd] = [-1];

        if (playerId) {
            this.whoBuzzed[questionNum][teamInd] = playerId;
        }
    }

    bonusCorrect(questionNum, teamInd) {
        console.log('bonus correct');
        this.extendToSize(questionNum + 1);
        this.questions[questionNum][teamInd] = [1, 1];
        console.log(this.questions[questionNum][teamInd])
    }

    bonusIncorrect(questionNum, teamInd) {
        console.log('bonus incorrect');
        this.extendToSize(questionNum + 1);
        this.questions[questionNum][teamInd] = [1, 0];
    }

    whoGotTU(questionNum) {
        if (questionNum < 0 || questionNum >= this.currentSize) return null;
        let q = this.questions[questionNum];
        console.log(q);
        for (let i = 0; i < 2; i++) {
            if (q[i].length > 0 && q[i][0] === 1) {
                return i;
            }
        }
        return null;
    }

}

module.exports = {
    Scoreboard
};
