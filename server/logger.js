
const fs = require('fs');
const chalk = require('chalk');
const LOG_FILE = 'log.txt';

fs.open(LOG_FILE, 'w');

function append(str) {
    fs.appendFile(LOG_FILE, str, {
        encoding: 'utf-8'
    }, err => {
        if (err) {
            console.error(chalk.red(`Error logging file: ${err}`));
            console.trace(err);
        }
        console.log(chalk.green('Saved game state to log.'));
    });
}

module.exports = {
    append
};
