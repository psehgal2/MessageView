/**
Author: Purvi Sehgal
Date: October, 2023
This is the javascript file to set up the server. 
*/

"use strict";

const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const multer = require("multer");
const app = express();

const SERVER_ERR_CODE = 500;
const SERVER_ERROR = "Something went wrong on the server, please try again later.";

app.use(express.static("public"));

app.use(express.urlencoded({extended: true}))
app.use(express.json());
app.use(multer().none());

// returns a json with the supported platforms as read from the file system
app.get("/getPlatforms", async (req, res, next) => {
    try {
        let platformPath = path.join(__dirname, "Platforms");
        let platforms = await fs.readdir(platformPath);
        res.json({ success: true, platforms });
    }
    catch (err) {
        res.status(SERVER_ERR_CODE).json({success: false, statusText: SERVER_ERROR})
    }
});

// reads the question-answer.json file and returns a json with the questions as the
// keys and the answers as the values
app.get("/getQAndA", async (req, res, next) => {
    try {
        let questionPath = path.join(__dirname, "question-answer.json");
        let questions = await fs.readFile(questionPath, "utf-8");
        questions = JSON.parse(questions);
        res.json({ success: true, questions});
    }
    catch (err) {
        res.status(SERVER_ERR_CODE).json({success: false, statusText: SERVER_ERROR})
    }
});

// adds form information (name, email, and questions) into the contact-form-info.json file
// returns status text for displaying on the webpage
app.post("/contactUs", async (req, res, next) => {
    res.type("text");
    let name = req.body.name;
    let email = req.body.email;
    let questions = req.body.questions;
    if (!name || !email || !questions) {
        res.send("All fields are required. Please try again.")
    }
    else {
        try {
            let data = {name, email, questions};
            data = JSON.stringify(data);
            let file = "contact-form-info.json";
            await fs.appendFile(file, data + "\n", "utf-8");
            res.send("Form was successfully submitted!");
        }
        catch (err) {
            res.status(SERVER_ERR_CODE).send(SERVER_ERROR)
        }
    }
});

// returns a json that stores the message chat data
// if no query was entered, it gets the message chat data
// for all of the supported platforms. Otherwise, it gets
// the message chat data for the provided query platform
app.get("/getMessages", async (req, res, next) => {
    try {
        const platform = req.query.platform;
        let platformPath = path.join(__dirname, "Platforms");
        let platformsList;
        let messageData = await getMessageInfo(platform, platformPath, platformsList);
        res.json({ success: true, data: messageData});
    }
    catch (err) {
        res.status(SERVER_ERR_CODE).json({success: false, statusText: SERVER_ERROR})
    }
});

/**
 * This function identifies the platform list. If 
 * a query was provided, then the platform list is 
 * just the query input. Otherwise, it is the supported
 * platforms. It then iterates through the platform list
 * and gets the message chats data
 * @param {platform, platformPath, platformsList}
 * @returns {None}
 */
async function getMessageInfo(platform, platformPath, platformsList) {
    let messageData = [];
    if (!platform) {
        let supportedPlatforms = await fs.readdir(platformPath);
        platformsList = supportedPlatforms;
    }
    else {
        platformsList = [platform];
    }
    for (let platformElement of platformsList) {
        let platformData = await getPlatformMessageData(platformPath, platformElement);
        messageData.push(platformData);
    }
    return messageData
}

/**
 * This function gets the icon, api, and message
 * associated with each message chat
 * @param {platformPath, platform}
 * @returns {{platform: platform, icon: platformProperty.icon, api, messages: messages_list}}
 */
async function getPlatformMessageData(platformPath, platform) {
    platformPath = path.join(platformPath, platform);
    let propertyPath = path.join(platformPath, "properties.json");
    let platformProperty = await fs.readFile(propertyPath, "utf-8");
    platformProperty = JSON.parse(platformProperty);
    let api = platformProperty["platform-API-URL"];
    let senders = await fs.readdir(platformPath);
    let messages_list = await getMessagesList(senders, platformPath);
    return {platform: platform, icon: platformProperty.icon, api, messages: messages_list};
}

// returns a json object that has all of the messages for a specific
// chat from a certain sender on a platform (i.e. Mom on Instagram)
app.get("/getMessageContent/:platform/:sender", async (req, res, next) => {
    try {
        let platform = req.params.platform;
        let sender = req.params.sender;
        let platformPath = path.join(__dirname, "Platforms");
        platformPath = path.join(platformPath, platform);
        let senderPath = path.join(platformPath, sender + ".json");
        let messages = await getAllMessages(senderPath);
        res.json({ success: true, all_messages: messages});
    }
    catch (err) {
        res.status(SERVER_ERR_CODE).json({success: false, statusText: SERVER_ERROR})
    }
});

// when user sends a message, this adds the message to the correct 
// files. It then sends the status of the action.
app.post("/addMessage/:platform/:sender", async (req, res, next) => {
    res.type("text");
    try {
        let platform = req.params.platform;
        let sender = req.params.sender;
        let message = req.body.message;
        let platformPath = path.join(__dirname, "Platforms");
        platformPath = path.join(platformPath, platform);
        let senderPath = path.join(platformPath, sender + ".json");
        let messages = await fs.readFile(senderPath, "utf-8");
        messages = JSON.parse(messages);
        messages.push({"Me" : message});
        await fs.writeFile(senderPath, JSON.stringify(messages));
        res.send("success");
    }
    catch (err) {
        res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
    }
});

/**
 * This function gets the first 50 characters of a message chat
 * with a particular sender on a platform
 * @param {sender, platformPath}
 * @returns {messages_list}
 */
async function getMessagesList(senders, platformPath) {
    let messages_list = [];
    for (let sender of senders) {
        if (sender !== ("properties.json")){
            let senderPath = path.join(platformPath, sender);
            let messages = await getAllMessages(senderPath);
            messages = messages[0];
            let keys = Object.keys(messages);
            messages = messages[keys[0]];
            const totalCharacters = 50;
            let displayMessages = messages.slice(0, totalCharacters); 
            sender = path.basename(sender, path.extname(sender));
            messages_list.push({sender, displayMessages});                
        } 
    }
    return messages_list;
}

/**
 * This function gets all messages associated with a sender
 * @param {senderPath}
 * @returns {messages}
 */
async function getAllMessages(senderPath) {
    let messages = await fs.readFile(senderPath, "utf-8");
    messages = JSON.parse(messages);
    return messages;
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log("Listening on port " + PORT));