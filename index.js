// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

// Import required packages
const path = require('path');
const restify = require('restify');
const sgMail = require('@sendgrid/mail');

// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');

// Import Azure storage
const { BlobStorage } = require('botbuilder-azure');

// This bot's main dialog.
const { DialogAndWelcomeBot } = require('./bots/dialogAndWelcomeBot');
const { MainDialog } = require('./dialogs/mainDialog');

const { getCompanyData, receiveCompanyData } = require('./company/getNewCompanyData');
// const getData = require('./company/getNewCompanyData');

// Read environment variables from .env file
const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    channelService: process.env.ChannelService,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log
    // TO SET UP production environment - Azure application insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    await conversationState.delete(context);
};

// Define a state store for bot.
// A bot requires a state store to persist the dialog and user state between messages.
let conversationState, userState;

// Set storage based on development or production environment
let mode = 'Prod';
let storage;

if (mode === 'Dev') {
    // For local development, in-memory storage is used.
    storage = new MemoryStorage();
} else {
    // For production create access to Blob Storage (default)
    storage = new BlobStorage({
        containerName: process.env.BLOB_NAME_STATE,
        storageAccountOrConnectionString: process.env.BLOB_STRING
    });
}

conversationState = new ConversationState(storage);
userState = new UserState(storage);

// Pass in a logger to the bot.  Use app insights for production.
const logger = console;

// Create the main dialog.
const dialog = new MainDialog(conversationState, userState, logger);
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog, logger);

// Add the SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Add variable to capture the Ideal Role API key
const apiKey = process.env.IR_API_KEY;
// const companyId = process.env.COMPANY_ID;

// Load company data
// getData.getCompanyData(apiKey);

// Create HTTP server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
});

// Middleware
server.use(restify.plugins.bodyParser());

// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
    });
});

server.post('/api/hooks', (req, res, next) => {
    let data = req.body || {};
    console.log(data);

    if (data.data.skinny) {
        console.log('Skinny payload');
        getCompanyData(apiKey);
        res.send('Requesting data from API');
    } else {
        receiveCompanyData(data);
        res.send('Information received');
    }

    return next();
});

// module.exports = { apiKey };
exports.apiKey = apiKey;
