
class CountdownTimer {

    constructor(oldTimer) {
        if (oldTimer) {
            this.totalTime = oldTimer.totalTime;
            this.remainingTime = oldTimer.remainingTime;
            this.timer = oldTimer.timer;
            this.secondCallback = oldTimer.secondCallback;
            this.completeCallback = oldTimer.completeCallback;
            this.isActive = oldTimer.isActive;
        } else {
            this.totalTime = null;
            this.remainingTime = null;
            this.timer = null;
            this.secondCallback = null;
            this.completeCallback = null;
            this.isActive = false;
        }
    }

    setTimer(duration) {
        this.totalTime = duration;
    }

    setSecondCallback(cb) {
        this.secondCallback = cb;
    }

    setCompleteCallback(cb) {
        this.completeCallback = cb;
    }

    start() {
        if (this.totalTime === null) return;
        this.remainingTime = this.totalTime;
        //this.secondCallback(this.totalTime);
        this.timer = setInterval(() => {
            this.remainingTime -= 1;
            if (this.secondCallback) {
                this.secondCallback(this.remainingTime);
            }
            if (this.remainingTime === 0) {
                this.cancel();
                if (this.completeCallback) {
                    this.completeCallback();
                }
            }
        }, 1000);
        this.isActive = true;
    }

    reset() {
        this.cancel();
        this.startTimer();
    }

    cancel() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.isActive = false;
    }

    active() {
        return this.isActive;
    }

}

module.exports = CountdownTimer;
