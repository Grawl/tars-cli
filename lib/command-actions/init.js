'use strict';

var Download = require('download');
var exec = require('child_process').exec;
var extfs = require('extfs');
var fs = require('fs');
var chalk = require('chalk');
var runCommand = require('./utils/run-command');
var tarsUtils = require('../utils');
var configPromt = require('../promt/config-promt');
var fsPromt = require('../promt/fs-promt');
var saveAnswers = require('../promt/save-answers');
var tarsZipUrl = 'https://github.com/tars/tars/archive/master.zip';
var commandOptions = {};

/**
 * Main init funciton, download all additional tasks.
 * @param  {Object} answers         Object with answers from promt
 */
function mainInit(answers) {
    var cwd = process.cwd();
    var downloadTars = new Download({
        mode: '755',
        extract: true,
        strip: 1
    }).get(tarsZipUrl).dest(cwd);

    tarsUtils.tarsSay('Please, wait for a moment, while magic is happening...');

    downloadTars.run(function (downloadErr) {

        if (downloadErr) {
            tarsUtils.spinner.stop(true);
            throw downloadErr;
        }

        if (answers) {
            saveAnswers(answers);
        }

        var userPackage = require(cwd + '/user-package.json');

        // Get version of TARS from tars.json
        // or package.json if tars.json does not exist
        try {
            process.env.tarsVersion = require(cwd + '/tars.json').version;
        } catch (er) {
            process.env.tarsVersion = require(cwd + '/package.json').version;
        }

        tarsUtils.tarsSay('Tars version is: ' + process.env.tarsVersion);

        extfs.remove(['package.json', 'user-package.json', '_package.json'], function () {
            var packageJson = require(process.env.cliRoot + 'templates/package.json');

            packageJson.dependencies = userPackage.dependencies || {};
            packageJson.devDependencies = userPackage.devDependencies || {};
            packageJson.optionalDependencies = userPackage.optionalDependencies || {};
            fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
            tarsUtils.tarsSay('Local package.json has been created');

            exec('npm i && npm i gulp --save', function (error, stdout, stderr) {
                if (error) {
                    console.log(stderr);
                } else {
                    tarsUtils.tarsSay('Local gulp and other dependencies has been installed');
                    runCommand('gulp', ['init', '--silent']);
                }
            });
        });
    });
}

/**
 * Start initialization
 */
function startInit() {
    var cwd = process.cwd();

    tarsUtils.tarsSay(chalk.underline('Initialization has been started!') + '\n');
    tarsUtils.tarsSay('I\'ll be inited in ' + chalk.cyan('"' + cwd + '"'));
    tarsUtils.tarsSay('TARS source will be downloaded from ' + chalk.cyan('"' + tarsZipUrl + '"'));

    if (!commandOptions.source) {
        tarsUtils.tarsSay('You can specify source url by using flag ' + chalk.cyan('"--source"') + ' or ' + chalk.cyan('"-s"'));
        tarsUtils.tarsSay('Example: ' + chalk.cyan('"tars init -s http://url.to.zip.with.tars"'));
        tarsUtils.tarsSay('Run command ' + chalk.cyan('"tars init --help"') + ' for more info.\n');
    }

    tarsUtils.tarsSay('I\'m going to install "gulp" localy and create local package.json');
    tarsUtils.tarsSay('You can modify package.json by using command ' + chalk.cyan('"npm init"') + ' or manually.');

    if (commandOptions.silent) {
        mainInit();
    } else {
        configPromt(mainInit);
    }
}

/**
 * Init TARS
 * @param  {Object} options Options of init
 */
module.exports = function init(options) {
    var cwd = process.cwd();

    commandOptions = options;
    tarsUtils.spinner.start();

    if (options.source) {
        tarsZipUrl = options.source;
    }

    if (tarsUtils.isTarsInited()) {
        tarsUtils.tarsSay('Tars has been inited already!');
        tarsUtils.tarsSay('You can\'t init Tars in current directory again.');
        tarsUtils.tarsSay('If you need to change preproc or templater, run tars ' + chalk.cyan('"tars re-init"') + '.', true);
        return;
    }

    console.log('\n');
    extfs.isEmpty(cwd, function (empty) {
        if (!empty) {
            tarsUtils.tarsSay(chalk.red('Directory "' + cwd + '" is not empty.'), true);
            fsPromt(startInit);
        } else {
            startInit();
        }
    });
};
