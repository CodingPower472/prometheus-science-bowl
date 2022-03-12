
class CountdownTimer {

    constructor(oldTimer) {
        if (oldTimer) {
            console.log('Good init');
            this.totalTime = oldTimer.totalTime;
            this.remainingTime = oldTimer.remainingTime;
            this.timer = oldTimer.timer;
            this.secondCallback = oldTimer.secondCallback;
            this.completeCallback = oldTimer.completeCallback;
            this.isActive = oldTimer.isActive;
        } else {
            console.log('Initialization');
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
        console.log(`Total time: ${this.totalTime}`);
        clearInterval(this.timer);
        if (this.totalTime === null) return;
        this.remainingTime = this.totalTime;
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
        this.secondCallback(this.totalTime);
    }

    reset() {
        this.start();
    }

    cancel() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.isActive = false;
        this.secondCallback(this.totalTime);
    }

    active() {
        return this.isActive;
    }

}

export default CountdownTimer;
