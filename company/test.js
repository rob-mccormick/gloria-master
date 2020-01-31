function writeToFile (data, path) {
    const json = JSON.stringify(data, null, 2);

    fs.writeFile(path, json, (err) => {
        if (err) {
            console.error(err);
            throw err;
        }

        console.log('Saved data to file');
    });
};

function readFromFile (path) {
    fs.readFile(path, 'utf8', (err, json) => {
        if (err) {
            console.error(err);
            throw err;
        }

        const data = JSON.parse(json);
        console.log(data);
    });
};

// Send GET request to API
let companyChatbotInfo = companyChatbot.getCompanyData((error, response) => {
    if (error) {
        return { error };
    }

    return {
        name: response.company,
        privacyNotice: response.privacy_notice_url
    };
});
