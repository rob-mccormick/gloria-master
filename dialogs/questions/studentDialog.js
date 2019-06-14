// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { delay, randomSentence, questionAnswered } = require('../../helperFunctions');
const { helpTopics } = require('../../companyDetails');

// Import other dialogs
const { CancelAndHelpDialog } = require('../cancelAndHelpDialog');

const STUDENT_DIALOG = 'studentDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const responses = {
    internship: `Internships`,
    workPlacement: `Work placements`,
    gradScheme: `Graduate program`,
    answered: 'Yes thanks',
    notAnswered: 'No'
};

class StudentDialog extends CancelAndHelpDialog {
    constructor() {
        super(STUDENT_DIALOG);

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
        const options = [responses.internship, responses.workPlacement, responses.gradScheme];
        const question = MessageFactory.suggestedActions(options, `Which program are you looking for?`);

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
        case responses.internship:
            answer = helpTopics.students.internship;
            break;
        case responses.workPlacement:
            answer = helpTopics.students.workPlacement;
            break;
        case responses.gradScheme:
            answer = helpTopics.students.gradScheme;
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

module.exports = { StudentDialog, STUDENT_DIALOG };
