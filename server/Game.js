
class Game {

    preprocessTeams() {
        for (let team of this.teams) {
            if (!team) continue;
            team.score = 0;
            for (let member of team.members) {
                member.joined = false;
                member.buzzing = false;
            }
        }
    }

    constructor(teamA, teamB) {
        this.teams = [teamA, teamB];
        this.preprocessTeams();
        this.opened = false;
        this.finished = false;
        this.buzzActive = false;
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
        return {
            teams: this.teams,
            opened: this.opened,
            finished: this.finished,
            buzzActive: this.buzzActive
        };
    }

    findGoogleID(googleId) {
        for (let team of this.teams) {
            if (!team) continue;
            for (let member of team.members) {
                if (googleId === member.googleId) {
                    return member;
                }
            }
        }
    }

    setJoined(googleId, joined) {
        this.findGoogleID(googleId).joined = joined;
    }

    start() {
        this.opened = true;
    }
    
    buzz(googleId) {
        this.findGoogleID(googleId).buzzing = true;
        this.buzzActive = true;
    }

}

module.exports = {
    Game
};
