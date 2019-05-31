// Copyright (c) Ideal Role Limited. All rights reserved.
// Bot Framework licensed under the MIT License from Microsoft Corporation.

class UserProfile {
    constructor(name, email, location, categoryOne, categoryTwo) {
        // User's details
        this.name = name;
        this.email = email;

        // User's behaviour default values
        this.gdprAccepted = false;
        this.addToPipeline = false;

        // User's job search
        this.location = location;
        this.categoryOne = categoryOne;
        this.categoryTwo = categoryTwo;
        this.jobs = [];
    }
}

module.exports.UserProfile = UserProfile;
