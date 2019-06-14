// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const { WaterfallDialog, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { delay, randomSentence, questionAnswered } = require('../../helperFunctions');
const { company, helpTopics } = require('../../companyDetails');

// Import other dialogs
const { CancelAndHelpDialog } = require('../cancelAndHelpDialog');

const RECRUITMENT_PROCESS_DIALOG = 'recruitmentProcessDialog';

const WATERFALL_DIALOG = 'waterfallDialog';

const responses = {
    generalProcess: 'The general process',
    afterApplication: 'After I apply',
    process: `What's your application process?`,
    futureApplications: `Do you keep applications for future jobs?`,
    registerInterest: `How do I register my interest in ${ company.name }?`,
    afterApply: 'What happens after I apply',
    hiringDecision: 'When a decision will be made',
    answered: 'Yes thanks',
    notAnswered: 'No'
};

class RecruitmentProcessDialog extends CancelAndHelpDialog {
    constructor() {
        super(RECRUITMENT_PROCESS_DIALOG);

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
        const options = [responses.generalProcess, responses.afterApplication];
        const question = MessageFactory.suggestedActions(options, `Are you interested in our general process, or after you apply?`);

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

        switch (stepContext.result) {
        case responses.generalProcess:
            options = [responses.process, responses.futureApplications, responses.registerInterest];
            questionText = `What would you like to know?`;
            break;
        case responses.afterApplication:
            options = [responses.afterApply, responses.hiringDecision];
            questionText = `Good to hear you're applying!
                \n\nWould you like to know what happens after you apply, or when a hiring decision will be made?`;
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
        case responses.process:
            answer = helpTopics.recruitmentProcess.process;
            break;
        case responses.futureApplications:
            answer = helpTopics.recruitmentProcess.futureApplications;
            break;
        case responses.registerInterest:
            answer = helpTopics.recruitmentProcess.registerInterest;
            break;
        case responses.afterApply:
            answer = helpTopics.recruitmentProcess.afterApply;
            break;
        case responses.hiringDecision:
            answer = helpTopics.recruitmentProcess.hiringDecision;
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

module.exports = { RecruitmentProcessDialog, RECRUITMENT_PROCESS_DIALOG };
