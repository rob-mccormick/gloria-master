// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { delay, randomSentence, questionAnswered } = require('../../helperFunctions');
const { helpTopics } = require('../../companyDetails');

// Import other dialogs
const { CancelAndHelpDialog } = require('../cancelAndHelpDialog');

const INTERVIEW_DIALOG = 'interviewDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const responses = {
    expect: `What to expect`,
    prepare: `How to prepare`,
    wear: `What to wear`,
    answered: 'Yes thanks',
    notAnswered: 'No'
};

class InterviewDialog extends CancelAndHelpDialog {
    constructor() {
        super(INTERVIEW_DIALOG);

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.levelOneStep.bind(this),
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
        const options = [responses.expect, responses.prepare, responses.wear];
        const question = MessageFactory.suggestedActions(options, `What would you like to know?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        await stepContext.context.sendActivity('We want you to be comfortable in your interview, so happy to help.');

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1500);
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
        case responses.expect:
            answer = helpTopics.interviews.expect;
            break;
        case responses.prepare:
            answer = helpTopics.interviews.prepare;
            break;
        case responses.wear:
            answer = helpTopics.interviews.wear;
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

module.exports = { InterviewDialog, INTERVIEW_DIALOG };
