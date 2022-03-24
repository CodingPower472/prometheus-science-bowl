
const fs = require('fs');
const chalk = require('chalk');
const LOG_FILE = 'log.txt';

fs.openSync(LOG_FILE, 'w');

function append(str) {
    fs.appendFile(LOG_FILE, str + '\n\n', {
        encoding: 'utf-8'
    }, err => {
        if (err) {
            console.error(chalk.red(`Error logging file: ${err}`));
            console.trace(err);
        }
    });
}

module.exports = {
    append
};
