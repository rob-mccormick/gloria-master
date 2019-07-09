// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { delay, randomSentence, questionAnswered } = require('../../helperFunctions');
const { helpTopics } = require('../../companyDetails');

// Import other dialogs
const { CancelAndHelpDialog } = require('../cancelAndHelpDialog');

const APPLYING_DIALOG = 'applyingDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const responses = {
    applicationRules: 'Your application rules',
    prepareCv: 'Preparing my CV',
    practicalDetails: 'Some practical details',
    multipleJobs: `Applying for multiple jobs`,
    reapply: `Can I reapply?`,
    bestWay: `The best way to apply`,
    cvFormat: 'What file format should I use?',
    cvInfo: 'What to put in my CV?',
    cvLength: 'How long should my CV be?',
    coverLetter: 'Cover letter',
    deadlines: `Application deadlines`,
    csDegree: `Do I need a computer science degree?`,
    answered: 'Yes thanks',
    notAnswered: 'No'
};

class ApplyingDialog extends CancelAndHelpDialog {
    constructor() {
        super(APPLYING_DIALOG);

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
        const options = [responses.applicationRules, responses.prepareCv, responses.practicalDetails];
        const question = MessageFactory.suggestedActions(options, `What would you like to know more about?`);
        const welcome = randomSentence([
            `Very excited to hear your thinking of applying 😊`,
            `That's awesome you're thinking of applying`,
            `Brilliant - we love new applications 😍`
        ]);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(welcome);

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
        case responses.applicationRules:
            options = [responses.multipleJobs, responses.reapply, responses.bestWay];
            questionText = `No problem. Is your question on appling for more than one job, reapplying or the best way to apply?`;
            break;
        case responses.prepareCv:
            options = [responses.cvInfo, responses.cvFormat, responses.cvLength];
            questionText = `Sure, what would you like to know?`;
            break;
        case responses.practicalDetails:
            options = [responses.coverLetter, responses.deadlines, responses.csDegree];
            questionText = `Can I help you with your cover letter, application deadlines, or if you need a computer science degree?`;
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
        case responses.multipleJobs:
            answer = helpTopics.applications.multipleJobs;
            break;
        case responses.reapply:
            answer = helpTopics.applications.reapply;
            break;
        case responses.bestWay:
            answer = helpTopics.applications.bestWay;
            break;
        case responses.cvInfo:
            answer = helpTopics.applications.cvInfo;
            break;
        case responses.cvFormat:
            answer = helpTopics.applications.cvFormat;
            break;
        case responses.cvLength:
            answer = helpTopics.applications.cvLength;
            break;
        case responses.coverLetter:
            answer = helpTopics.applications.coverLetter;
            break;
        case responses.deadlines:
            answer = helpTopics.applications.deadlines;
            break;
        case responses.csDegree:
            answer = helpTopics.applications.csDegree;
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

module.exports = { ApplyingDialog, APPLYING_DIALOG };
