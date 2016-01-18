'use strict';

const fs = require('fs');
const fsExtra = require('fs-extra');
const chalk = require('chalk');
const addModulePromt = require('../promt/add-module-promt');
const tarsUtils = require('../utils');
const cwd = process.cwd();
const tarsConfig = tarsUtils.getTarsConfig();
// Path to new module. Includes module name
var nmd;
var templater = 'jade';
var cssPreprocessor = 'scss';
var extensions = {
    tpl: 'jade',
    css: 'scss'
};
var commandOptions;
var newModuleName;

// Get config from tars-config in cwd
templater = tarsConfig.templater.toLowerCase();
cssPreprocessor = tarsConfig.cssPreprocessor.toLowerCase();

if (templater === 'handlebars' ||
    templater === 'handelbars' ||
    templater === 'hdb' ||
    templater === 'hb') {
    extensions.tpl = 'html';
}

if (cssPreprocessor === 'stylus') {
    extensions.css = 'styl';
} else {
    extensions.css = cssPreprocessor;
}

/**
 * Generate base files for module. Js, Html and Css file
 */
function generateBaseFiles() {
    fs.appendFileSync(
        nmd + '/' + newModuleName + '.' + extensions.css, '\n');
    fs.appendFileSync(nmd + '/' + newModuleName + '.js', '\n');
    fs.appendFileSync(nmd + '/' + newModuleName + '.' + extensions.tpl, '\n');

    if (extensions.tpl === 'jade') {
        fs.writeFileSync(
            nmd + '/' + newModuleName + '.' + extensions.tpl,
            'mixin ' + newModuleName + '(data)'
        );
    }
}

/**
 * Create folder for IE's stylies
 */
function createIEFolder() {
    fs.mkdirSync(nmd + '/ie');
}

/**
 * Create folder for assets
 */
function createAssetsFolder() {
    fs.mkdirSync(nmd + '/assets');
}

/**
 * Create folder for data
 */
function createDataFolder() {
    var processedModuleName = newModuleName;

    if (processedModuleName.indexOf('-') > -1) {
        processedModuleName = '\'' + processedModuleName + '\'';
    }

    fs.mkdirSync(nmd + '/data');
    fs.appendFileSync(nmd + '/data/data.js', '\n');

    fs.writeFileSync(
        nmd + '/data/data.js',
        processedModuleName + ': {}'
    );
}

function createCopyOfTemplate() {
    fsExtra.copy(cwd + '/markup/modules/_template', nmd,  error => {

        if (error) {
            tarsUtils.tarsSay(chalk.red('"_template module does not exist in the "markup/modules" directory.'));
            tarsUtils.tarsSay('This folder is used as template for new module.');
            tarsUtils.tarsSay('Create template or run the command ' + chalk.cyan('"tars add-module <moduleName>"') + ' to create module with another options.\n', true);
        } else {
            successLog();
        }
    });
}

/**
 * Create module with structure based on command options
 */
function createModule() {
    if (commandOptions.template) {
        createCopyOfTemplate();
    } else {
        fs.mkdir(nmd, () => {
            var generateStructure = true;

            if (commandOptions.empty) {
                generateStructure = false;
            }

            if (commandOptions.full && generateStructure) {
                generateBaseFiles();
                createIEFolder();
                createAssetsFolder();
                createDataFolder();
                generateStructure = false;
            }

            if (commandOptions.basic && generateStructure) {
                generateBaseFiles();
            }

            if (commandOptions.assets && generateStructure) {
                createAssetsFolder();
            }

            if (commandOptions.data && generateStructure) {
                createDataFolder();
            }

            if (commandOptions.ie && generateStructure) {
                createIEFolder();
            }

            successLog();
        });
    }
}

/**
 * Create module with structure based on answers from promt
 * @param  {Object} answers Answers from promt
 */
function createModuleWithPromt(answers) {

    if (answers.mode.indexOf(' Make a copy of _template') > -1) {
        createCopyOfTemplate();
    } else {
        fs.mkdir(nmd, () => {
            if (answers.mode.indexOf(' Just empty dir, without files') > -1) {
                void 0;
            } else if (answers.mode.indexOf(' Full pack (all available folders and files)') > -1) {
                generateBaseFiles();
                createIEFolder();
                createAssetsFolder();
                createDataFolder();
            } else {
                answers.mode.forEach(mode => {
                    switch (mode) {
                        case ' Assets dir':
                            createAssetsFolder();
                            break;
                        case ' IE dir':
                            createIEFolder();
                            break;
                        case ' Data dir':
                            createDataFolder();
                            break;
                        case ' Basic files (js, html and stylies)':
                        default:
                            generateBaseFiles();
                            break;
                    }
                });
            }

            successLog();
        });
    }
}

function successLog() {
    tarsUtils.tarsSay(chalk.green('Module "' + newModuleName + '" has been added to markup/modules.\n'), true);
}

/**
 * Create module in markup directory
 * @param  {String} moduleName The name of new module
 * @param  {Object} options       Options
 */
module.exports = function addModule(moduleName, options) {
    const validateStatus = tarsUtils.validateFolderName(moduleName);

    console.log('\n');

    // If moduleName has depricated symbols, log the error
    if (typeof validateStatus === 'string') {
        tarsUtils.tarsSay(chalk.red(validateStatus + '\n'), true);
        return;
    }

    commandOptions = options;
    newModuleName = moduleName;
    // Path to new module. Includes module name
    nmd = cwd + '/markup/modules/' + newModuleName;
    // Create new module if module with newModuleName is not existed already
    fs.stat(nmd, (fsErr, stats) => {

        if (!stats) {
            if (
                !commandOptions.full && !commandOptions.ie && !commandOptions.assets &&
                !commandOptions.template && !commandOptions.data && !commandOptions.empty &&
                !commandOptions.silent && !commandOptions.basic
            ) {
                addModulePromt(createModuleWithPromt);
            } else {
                createModule();
            }
        } else {
            tarsUtils.tarsSay(chalk.red('Module "' + newModuleName + '" already exists.\n'), true);
        }
    });
};
