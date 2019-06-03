// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.
const validator = require('validator');

const { ComponentDialog, WaterfallDialog, TextPrompt, Dialog } = require('botbuilder-dialogs');
const { MessageFactory, ActivityTypes } = require('botbuilder');

const { delay } = require('../helperFunctions');

const NAME_AND_EMAIL_DIALOG = 'nameAndEmailDialog';
const NAME_PROMPT = 'namePrompt';
const EMAIL_PROMPT = 'emailPrompt';

const WATERFALL_DIALOG = 'waterfallDialog';

const userResponses = {
    emailCorrect: 'Sure is',
    emailWrong: `That's not it`
};

class NameAndEmailDialog extends ComponentDialog {
    constructor() {
        super(NAME_AND_EMAIL_DIALOG);

        this.addDialog(new TextPrompt(NAME_PROMPT, this.nameValidator))
            .addDialog(new TextPrompt(EMAIL_PROMPT, this.emailValidator))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.getNameStep.bind(this),
                this.getEmailStep.bind(this),
                this.confirmEmailStep.bind(this),
                this.endStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Ask the user's name - use a prompt to check the data
     */
    async getNameStep(stepContext) {
        if (stepContext.options.name) {
            // Save the user's name and retryEmail value
            stepContext.values.name = stepContext.options.name;
            stepContext.values.retryEmail = true;
            // If going back due to wrong email, skip this step
            return stepContext.next();
        }

        const promptOptions = {
            prompt: 'Mind if I get your name?  You can type it below.',
            retryPrompt: `I didn't quite get that - I was expecting your name to be between 2 and 20 characters.  \n\nCan you try again?`
        };

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(500);
        return await stepContext.prompt(NAME_PROMPT, promptOptions);
    }

    /**
     * If the user's name is valid, save it - otherwise ask for it again
     * Ask the user's email
     */
    async getEmailStep(stepContext) {
        let promptQuestion;
        console.log(stepContext.result);

        // Check if retry step
        if (stepContext.values.retryEmail) {
            // Set the prompt question for the email
            promptQuestion = `So what email is best?`;

            // Reset the retryEmail value to false
            stepContext.values.retryEmail = false;
        } else {
            // Save the user's name
            stepContext.values.name = stepContext.result;

            // Set the prompt question for the email
            promptQuestion = `Thanks ${ stepContext.values.name }.  What's the best email to reach you on?`;
        }

        const promptOptions = {
            prompt: promptQuestion,
            retryPrompt: `Hmm, I don't think that's a valid email 🤔  \n\n Can you try again?`
        };

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        return await stepContext.prompt(EMAIL_PROMPT, promptOptions);
    }

    /**
     * Save the user's email is valid - if not ask for it again
     * Ask the user to confirm the email is correct
     */
    async confirmEmailStep(stepContext) {
        // Save the user's email
        stepContext.values.email = stepContext.result;

        // Confirm the email is correct with the user
        const options = [userResponses.emailCorrect, userResponses.emailWrong];
        const question = MessageFactory.suggestedActions(options, `Just to make sure I've got it right, your email is ${ stepContext.values.email }?`);

        await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
        await delay(1000);
        await stepContext.context.sendActivity(question);
        return Dialog.EndOfTurn;
    }

    /**
     * If the user's email is correct, save it
     * Otherwise collect it again - return to previous step
     * End the dialog and return the result
     */
    async endStep(stepContext) {
        // Save the user's results
        const userDetails = stepContext.values;

        // Check the user's response
        if (stepContext.result === userResponses.emailWrong) {
            await stepContext.context.sendActivity({ type: ActivityTypes.Typing });
            await delay(1000);
            await stepContext.context.sendActivity(`Let's try that again.`);

            // Send back to the beginning of the dialog
            return await stepContext.beginDialog(NAME_AND_EMAIL_DIALOG, userDetails);
        }

        // If user has confirmed email - return the results
        return await stepContext.endDialog(userDetails);
    }

    // ======================================
    // Validators
    // ======================================

    async nameValidator(promptContext) {
        // Check if the name is greater than 2 characters, but less than 20
        return promptContext.recognized.succeeded && promptContext.recognized.value.length > 1 && promptContext.recognized.value.length < 20;
    }

    async emailValidator(promptContext) {
        // Check if it is a valid email using validator
        return promptContext.recognized.succeeded && validator.isEmail(promptContext.recognized.value);
    }
}

module.exports.NameAndEmailDialog = NameAndEmailDialog;
module.exports.NAME_AND_EMAIL_DIALOG = NAME_AND_EMAIL_DIALOG;
