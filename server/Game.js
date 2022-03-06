
const chalk = require('chalk');
const { Scoreboard } = require('./Scoreboard');

class Game {

    preprocessTeams() {
        for (let team of this.teams) {
            if (!team) continue;
            team.score = 0;
            team.lockedOut = false;
            for (let member of team.members) {
                member.joined = false;
                member.buzzing = false;
            }
        }
    }

    constructor(teamA, teamB, sendMessage) {
        this.teams = [teamA, teamB];
        this.preprocessTeams();
        this.opened = true; // TODO: change this line and following to false and -1 in production
        this.questionNum = 0;
        this.finished = false;
        this.buzzActive = null;
        this.onBonus = false;
        this.scoreboard = new Scoreboard();
        this.questionTimer = null;
        this.timeUp = false;
        this.sendMessage = sendMessage;
    }
    
    teamA() {
        return this.teams[0];
    }
    teamB() {
        return this.teams[1];
    }

    setTeamA(team) {
        team.score = 0;
        this.teams[0] = team;
    }
    setTeamB(team) {
        team.score = 0;
        this.teams[1] = team;
    }

    state() {
        console.log(this.scoreboard.state());
        return {
            teams: this.teams,
            opened: this.opened,
            finished: this.finished,
            buzzActive: this.buzzActive,
            answeringTeam: this.answeringTeam,
            questionNum: this.questionNum,
            onBonus: this.onBonus,
            scoreboard: this.scoreboard.state(),
            timeUp: this.timeUp
        };
    }

    findGoogleID(googleId) {
        for (let i = 0; i < 2; i++) {
            let team = this.teams[i];
            if (!team) continue;
            for (let j = 0; j < team.members.length; j++) {
                let member = team.members[j];
                if (googleId === member.googleId) {
                    return [member, i, j];
                }
            }
        }
        return null;
    }

    setJoined(googleId, joined) {
        let user = this.findGoogleID(googleId);
        if (user) {
            user[0].joined = joined;
        }
    }

    start() {
        this.opened = true;
        this.questionNum = 1;
    }
    
    buzz(googleId) {
        if (this.buzzActive || this.onBonus) return;
        let user = this.findGoogleID(googleId);
        if (!user) return;
        if (this.teams[user[1]].lockedOut) return;
        user[0].buzzing = true;
        this.buzzActive = user[0];
        this.answeringTeam = user[1];
        this.teams[user[1]].lockedOut = true;
    }

    clearBuzzer() {
        if (!this.buzzActive) return;
        this.findGoogleID(this.buzzActive.googleId)[0].buzzing = false;
        this.buzzActive = null;
        this.answeringTeam = null;
    }

    ignoreBuzz() {
        this.clearBuzzer();
        teams[this.findGoogleID(this.buzzActive.googleId)[1]].lockedOut = false;
    }

    correctAnswer(questionNum, playerId, teamInd, isBonus) {
        if (isBonus) {
            this.scoreboard.bonusCorrect(questionNum, teamInd);
        } else {
            this.scoreboard.tossUpCorrect(questionNum, playerId, teamInd);
        }
    }

    incorrectAnswer(questionNum, playerId, teamInd, isBonus) {
        if (isBonus) {
            this.scoreboard.bonusIncorrect(questionNum, teamInd);
        } else {
            this.scoreboard.tossUpIncorrect(questionNum, playerId, teamInd);
        }
    }

    negAnswer(questionNum, playerId, teamInd) {
        this.scoreboard.tossUpNeg(questionNum, playerId, teamInd);
    }

    allLocked() {
        return this.teams[0].lockedOut && this.teams[1].lockedOut;
    }

    unlockAll() {
        if (this.teams[0]) this.teams[0].lockedOut = false;
        if (this.teams[1]) this.teams[1].lockedOut = false;
    }

    lockAll() {
        if (this.teams[0]) this.teams[0].lockedOut = true;
        if (this.teams[1]) this.teams[1].lockedOut = true;
    }

    correctLive() {
        this.correctAnswer(this.questionNum, this.buzzActive ? this.buzzActive.googleId : null, this.answeringTeam, this.onBonus);
        this.cancelTimer();
        if (this.onBonus) {
            this.questionNum++;
            this.answeringTeam = null;
            this.onBonus = false;
        } else {
            let answeringTeam = this.answeringTeam;
            this.unlockAll();
            this.clearBuzzer();
            this.answeringTeam = answeringTeam; // undo the reset of answering team done by clearBuzzer()
            this.onBonus = true;
        }
    }

    incorrectLive() {
        this.incorrectAnswer(this.questionNum, this.buzzActive ? this.buzzActive.googleId : null, this.answeringTeam, this.onBonus);
        if (this.onBonus) {
            this.questionNum++;
            this.answeringTeam = null;
            this.cancelTimer();
        } else {
            this.teams[this.answeringTeam].lockedOut = true;     
            this.clearBuzzer();
            if (this.allLocked()) {
                this.questionNum++;
                this.unlockAll();
            }
            this.resetTimer();
        }
        this.onBonus = false;
    }

    negLive() {
        this.cancelTimer();
        if (!this.buzzActive) {
            console.error(chalk.red('Trying to mark neg when no buzz active.'));
            return;
        }
        this.negAnswer(this.questionNum, this.buzzActive.googleId, this.answeringTeam);
        this.teams[this.answeringTeam].lockedOut = true;
        this.onBonus = false;
        this.clearBuzzer();
        if (this.allLocked()) {
            this.questionNum++;
            this.unlockAll();
        }
    }

    tossUpTimeUp() {
        this.lockAll();
        this.timeUp = true;
    }

    bonusTimeUp() {
        this.timeUp = true;
    }

    nextQuestion() {
        this.setQuestionNum(this.questionNum + 1);
        if (this.onBonus) {
            this.setOnBonus(false);
        }
        this.cancelTimer();
    }

    setQuestionNum(num) {
        this.questionNum = num;
        this.unlockAll();
        this.cancelTimer();
    }

    setOnBonus(isBonus) {
        this.onBonus = isBonus;
        this.unlockAll();
        if (this.onBonus) {
            this.answeringTeam = this.scoreboard.whoGotTU(this.questionNum);
        }
        this.cancelTimer();
    }

    setLocked(teamInd, locked) {
        this.teams[teamInd].lockedOut = locked;
    }

    startTimer(onTimeUp) {
        this.onTimeUp = onTimeUp;
        this.timeUp = false;
        let time = this.onBonus ? 22 : 7;
        this.questionTimer = setTimeout(() => {
            if (this.onBonus) {
                this.bonusTimeUp();
            } else {
                this.tossUpTimeUp();
            }
            if (onTimeUp) {
                onTimeUp(this.onBonus);
            }
        }, time*1000);
        console.log('Going to send start timer');
        this.sendMessage('timerstart');
        return time;
    }

    resetTimer() {
        clearTimeout(this.questionTimer);
        this.timeUp = false;
        let time = this.onBonus ? 22 : 7;
        this.questionTimer = setTimeout(() => {
            if (this.onBonus) {
                this.bonusTimeUp();
            } else {
                this.tossUpTimeUp();
            }
            if (this.onTimeUp) {
                this.onTimeUp(this.onBonus);
            }
        }, time*1000);
        this.sendMessage('timerreset');

    }

    cancelTimer() {
        this.timeUp = false;
        clearTimeout(this.questionTimer);
        this.sendMessage('timercancel');
    }

}

module.exports = {
    Game
};
