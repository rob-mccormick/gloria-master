// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ComponentDialog, DialogTurnStatus } = require('botbuilder-dialogs');
// const { MessageFactory } = require('botbuilder');

/**
 * This base class watches for common phrases like "help" and "cancel" and takes action on them
 * BEFORE they reach the normal bot logic.
 */
class CancelAndHelpDialog extends ComponentDialog {
    async onBeginDialog(innerDc, options) {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }
        return await super.onBeginDialog(innerDc, options);
    }

    async onContinueDialog(innerDc) {
        const result = await this.interrupt(innerDc);
        if (result) {
            return result;
        }
        return await super.onContinueDialog(innerDc);
    }

    async interrupt(innerDc) {
        const text = innerDc.context.activity.text.toLowerCase();

        switch (text) {
        case 'help':
        case '?':
            await innerDc.context.sendActivity(`If you're stuck - or have a question for someone - I can take your message and have someone get back to you.
            \n\nJust answer yes when I ask if you have any questions.`);
            return { status: DialogTurnStatus.waiting };
        case 'cancel':
        case 'reset':
        case 'restart':
        case 'quit':
            await innerDc.context.sendActivity(`No problem, I'll restart now`);
            return await innerDc.cancelAllDialogs();
        // case 'testing':
        //     await innerDc.context.sendActivity('This is where we send a message.');
        //     await innerDc.context.sendActivity(MessageFactory.suggestedActions(['yes', 'no'], 'Did you find a job you like?'));
        //     return { status: DialogTurnStatus.waiting };
        }
    }
}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;
