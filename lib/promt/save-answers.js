'use strict';

const fs = require('fs');

/**
 * Save answers from promt to local tars-config
 * @param  {Object} answers Answers from fs-promts
 */
module.exports = function saveAnswers(answers) {
    const cwd = process.cwd();

    // We need to read file frm fs enstean require because of comments inside tars-config.js
    const configString = fs.readFileSync(cwd + '/tars-config.js', 'utf8');

    configString = configString.replace(
            /templater:\s('\w*')/gi,
            'templater: ' + '\'' + answers.templater + '\''
        );

    configString = configString.replace(
            /cssPreprocessor: ('\w*')/gi,
            'cssPreprocessor: ' + '\'' + answers.preprocessor + '\''
        );

    configString = configString.replace(
            /useBabel:\s(\w*)/gi,
            'useBabel: ' + answers.useBabel
        );

    configString = configString.replace(
            /useNotify:\s(\w*)/gi,
            'useNotify: ' + answers.useNotify
        );

    configString = configString.replace(
            /staticFolderName:\s('\w*')/gi,
            'staticFolderName: ' + '\'' + answers.staticFolderName + '\''
        );

    configString = configString.replace(
            /imagesFolderName:\s('\w*')/gi,
            'imagesFolderName: ' + '\'' + answers.imagesFolderName + '\''
        );

    configString = configString.replace(
            /staticPrefix:\s('\w*\/?')/gi,
            'staticPrefix: ' + '\'' + answers.staticFolderName + '/\''
        );

    configString = configString.replace(
            /useImagesForDisplayWithDpi:\s\[(\d*,?\s?)*\]/gi,
            'useImagesForDisplayWithDpi: [' + answers.useImagesForDisplayWithDpi + ']'
        );

    fs.writeFileSync(cwd + '/tars-config.js', configString);
};
