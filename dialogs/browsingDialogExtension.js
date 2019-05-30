// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const WATERFALL_DIALOG = 'waterfallDialog';

class BrowsingDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'browsingDialog');

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.testStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Test that the dialog is connecting correctly
     */
    async testStep(stepContext) {
        await stepContext.context.sendActivity('This is a message from the browsingDialog');
        return await stepContext.endDialog();
    }
}

module.exports.BrowsingDialog = BrowsingDialog;
