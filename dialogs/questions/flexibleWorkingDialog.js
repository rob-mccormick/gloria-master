// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { delay, randomSentence, questionAnswered } = require('../../helperFunctions');
const { helpTopics } = require('../../companyDetails');

// Import other dialogs
const { CancelAndHelpDialog } = require('../cancelAndHelpDialog');

const FLEXIBLE_WORKING_DIALOG = 'flexibleWorkingDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const responses = {
    flexibleWorking: 'Flexible working',
    leaveBenefits: 'Leave benefits',
    internationalSupport: 'Support for international workers',
    flexible: `Flexible hours`,
    remote: `Working remotely`,
    partTime: `Part-time work`,
    annualLeave: 'Annual leave',
    parentalLeave: 'Parental leave',
    visa: 'Do you sponsor visas?',
    relocation: 'Do you help with relocations?',
    answered: 'Yes thanks',
    notAnswered: 'No'
};

class FlexibleWorkingDialog extends CancelAndHelpDialog {
    constructor() {
        super(FLEXIBLE_WORKING_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.levelOneStep.bind(this),
            this.levelTwoStep.bind(this),
            this.provideAnswerStep.bind(this),
            this.endStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Ask the user what they'd like to know about
     */
    async levelOneStep(stepContext) {
        // Check which topic they're interested in
        const options = [responses.flexibleWorking, responses.leaveBenefits, responses.internationalSupport];
        const question = MessageFactory.suggestedActions(options, `Would you like to know about flexible working, leave benefits or support for international workers?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Get more clarification from the user
     */
    async levelTwoStep(stepContext) {
        let options;
        let questionText;

        console.log(JSON.stringify(stepContext.result));

        switch (stepContext.result) {
        case responses.flexibleWorking:
            options = [responses.flexible, responses.remote, responses.partTime];
            questionText = `What type of flexibility are you interested in?`;
            break;
        case responses.leaveBenefits:
            options = [responses.annualLeave, responses.parentalLeave];
            questionText = `Did you want to know about annual or paternal leave?`;
            break;
        case responses.internationalSupport:
            options = [responses.visa, responses.relocation];
            questionText = `What's on your mind?`;
            break;
        }

        const question = MessageFactory.suggestedActions(options, questionText);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * Provide an answer to the user's question
     * Response is specific to the company - from helpTopics in companyDetails.js
     * Then ask whether it answered the user's question
     */
    async provideAnswerStep(stepContext) {
        let answer;

        // Get the correct answer
        switch (stepContext.result) {
        case responses.flexible:
            answer = helpTopics.workingOptions.flexible;
            break;
        case responses.remote:
            answer = helpTopics.workingOptions.remote;
            break;
        case responses.partTime:
            answer = helpTopics.workingOptions.partTime;
            break;
        case responses.annualLeave:
            answer = helpTopics.workingOptions.annualLeave;
            break;
        case responses.parentalLeave:
            answer = helpTopics.workingOptions.parentalLeave;
            break;
        case responses.visa:
            answer = helpTopics.workingOptions.visa;
            break;
        case responses.relocation:
            answer = helpTopics.workingOptions.relocation;
            break;
        }

        // Send the answer
        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(answer);

        // Ask if it answered their question
        const options = [responses.answered, responses.notAnswered];
        const question = randomSentence(questionAnswered);
        const response = MessageFactory.suggestedActions(options, question);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(2000);
        await stepContext.context.sendActivity(response);
        return Dialog.EndOfTurn;
    }

    /**
     * If question was answered, return 1
     * If question was not answered, return -1
     */
    async endStep(stepContext) {
        let answered;

        // Set answered based on the user's response
        if (stepContext.result === responses.answered) {
            answered = 1;
        } else if (stepContext.result === responses.notAnswered) {
            answered = -1;
        }

        // End the dialog and return the result
        return await stepContext.endDialog(answered);
    }
}

module.exports = { FlexibleWorkingDialog, FLEXIBLE_WORKING_DIALOG };
