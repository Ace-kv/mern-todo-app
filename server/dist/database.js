"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectedClient = exports.connectToMogoDB = void 0;
require("dotenv/config");
const mongodb_1 = require("mongodb");
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const options = {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
};
let client;
const connectToMogoDB = async () => {
    if (!client) {
        try {
            client = new mongodb_1.MongoClient(uri, options);
            await client.connect(); // Await the connection
            console.log("Connected to MongoDB");
        }
        catch (error) {
            console.error();
        }
    }
    return client;
};
exports.connectToMogoDB = connectToMogoDB;
const getConnectedClient = () => client;
exports.getConnectedClient = getConnectedClient;
