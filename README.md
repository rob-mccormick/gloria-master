# Gloria Chatbot

Gloria is a chatbot that helps people find a job on a company’s career site (built with the Microsoft Bot Framework in JavaScript).

The key tasks Gloria can perform are:
- Help users to find the jobs they want.
- If the user doesn’t find a job they like, take their details to let them know when new jobs become available.
- Answer most common questions people have.
- But also let the user ask a specific question, which is passed to a member of the recruitment team to respond. 

## Background
The idea for the chatbot started when I was speaking to people about applying for jobs. Often they had questions but no way of getting answers. So they didn’t apply.

While the questions people had were varied, they tended to fall into common categories. Which meant a chatbot could answer most of them in a couple of minutes, 24/7. The chatbot’s goal was to guide people to the right job and help them to apply. Getting more candidates for the companies using it.

The chatbot had three parts: 
1. The chatbot (this repo)
	2. The web chat window
	3. A REST API to access specific company details and save analytics data ([repo](https://github.com/rob-mccormick/app-company-api)).

You can learn more about the chatbot on [my portfolio site](https://robmc.dev/portfolio/chatbot).

Below are details about this codebase. My code got the job done, but would benefit from a thorough refactor to be more maintainable.


## To run the bot locally

You'll need Node.js version 10.14 or higher.
- Install modules
    ```bash
    npm install
    ```
- Run the bot
    ```bash
    npm start

## Conversation Data
Conversation data is an object used to keep track of the conversation and direct the user to the correct dialogs.  It is initiated at the beginning of the conversation and tracks the following parameters:

- seenJobDisclaimer (Boolean): if the user has seen the job disclaimer
- jobSearch (Boolean): if the user wants to search for jobs
- jobSearchComplete (Boolean): Used to check if the user has any questions after the job search
- addToPipeline (Boolean): if the user wants to be contacted about specific jobs
- hasQuestion (Boolean): if the user has a question to ask
- userConfirmedEmail (Boolean): if the user has confirmed their email during the conversation
- finishedConversation (Boolean): if the user has finished the conversation flow and not reset

## User Object
The userProfile object is data generated by the user's chat and is saved in the UserState.  It is an instance of the UserProfile class, and consists of:

- name (string)
- email (string)
- gdprAccepted (Boolean)
- location (string)
- specialism (string)
- experience (int)
- jobs (array of job objects)
- pipeline (array of objects containing categoryTwo and location - for jobs to be notified about)
- question (array of strings)

## Company Specific Information
In order for the chat to be specific to a company, information is taken from the company object. 
This information needs to be kept up to date for the dialog to remain relevant.  The job object includes:

- name - The company name as will be presented to the user.  It should be the commonly used name.
- locations - An array of the cities in which the company has offices that it can potentially hire for
- categoryOne - An array of the top level job categories.
- specialisms - An array with arrays of the second level options for each category one option.
- nextSteps - a string encouraging the user to apply for the job
- companyVideo - the video explaining what it's like to work at the company (culture, office, testimonials, etc.)
- benefits:
  - siteLink: the link to the company's benefits on their website (if available)
  - message: Intro to the benefits - should focus on non-monetary benefits
  - cards: The benefits to be displayed in a carousel to the user
- emailContacts - a list of email addresses for the people to receive email notifications
- privacyNotice - href to link to the companies privacy notice

### Notes on arrays of options
To keep the SuggestedActions manageable, try to keep any lists of possible options to 4 or less.
This is relevant for:
- offices
- categoryOne
- categoryTwo

## Jobs
Jobs are a list of job objects that contain information to help the user decide if they want to learn more.  If so, they can link to the job on the company's career site (or ATS).  Each job object needs to include:

- id - Unique id for each job (does not relate to the job id in the ATS).
- title - The job title
- location - the office location (currently set up for one option)
- specialism - A list of the relevant specialisms for the job (can be one or more)
- minExperience - The minimum years of experience needed for the role
- intro - a short introduction to the job to give the user an idea of what it is about (and entice them to see more)
- jdLink - href link to the job description
- applyLink - href link to the job application
- video - href link to the job's video (usually by the hiring manager)

## helpTopics Object
The helpTopics object contains responses to frequently asked questions in the questionDialog.  Each answer is part of five top level help topics:

- applications - Question about the application process and how to apply
- inteviews - tips and what to expect at the interview stage
- workingOptions - the different kinds of flexible working options available
- recruitmentProcess - general questions about the recruitment process so the user knows what to expect
- students - covers internships, work placement and graduate jobs offered by the company

## Testing the bot using Bot Framework Emulator
[Bot Framework Emulator][5] is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.3.0 or greater from [here][6]

### Connect to the bot using Bot Framework Emulator
- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`

## Deploy the bot to Azure
After creating the bot and testing it locally, you can deploy it to Azure to make it accessible from anywhere.
To learn how, see [Deploy your bot to Azure][40] for a complete set of deployment instructions.


## Further reading
- [Bot Framework Documentation][20]
- [Azure Bot Service Documentation][22]
- [Azure CLI][7]
- [msbot CLI][9]
- [Azure Portal][10]
- [Language Understanding using LUIS][11]

[4]: https://nodejs.org
[5]: https://github.com/microsoft/botframework-emulator
[6]: https://github.com/Microsoft/BotFramework-Emulator/releases
[7]: https://docs.microsoft.com/cli/azure/?view=azure-cli-latest
[8]: https://docs.microsoft.com/cli/azure/install-azure-cli?view=azure-cli-latest
[9]: https://github.com/Microsoft/botbuilder-tools/tree/master/packages/MSBot
[10]: https://portal.azure.com
[11]: https://www.luis.ai
[20]: https://docs.botframework.com
[22]: https://docs.microsoft.com/azure/bot-service/?view=azure-bot-service-4.0
