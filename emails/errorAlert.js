// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

const fs = require('fs');
const sgMail = require('@sendgrid/mail');

// Send an email alert when the chatbot can't connect to the app via the API
const sendErrorMessageEmail = (alertError) => {
    const company = JSON.parse(fs.readFileSync('company/companyInfo.json'));

    sgMail.send({
        to: 'rob@idealrole.com',
        from: 'gloria@idealrole.com',
        subject: `${ company.name }: Error connecting to database`,
        html: `<div style="font-size: 14px;">
        <p>The ${ company.name } chatbot is unable to connect to the API.</p>
        <p>The details of the error are:</p>
        <ul>
            <li style="padding-bottom: 8px;">errno: ${ alertError.errno }</li>
            <li style="padding-bottom: 8px;">code: ${ alertError.code }</li>
            <li style="padding-bottom: 8px;">syscall: ${ alertError.syscall }</li>
            <li style="padding-bottom: 8px;">address: ${ alertError.address }</li>
            <li style="padding-bottom: 8px;">port: ${ alertError.port }</li>
        </ul>
        <br>
        <p>- Gloria</p>
        <br><br>
        </div>`
    });
};

module.exports = { sendErrorMessageEmail };
