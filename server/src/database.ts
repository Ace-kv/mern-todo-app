import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb'

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}

let client: undefined | MongoClient
export const connectToMogoDB = async () => {
    if (!client) {
        try {
            client = await MongoClient.connect(uri, options)
            console.log("Connected to MongoDB");
            
        } catch (error) {
            console.error();
        }
    }
    return client
}

export const getConnectedClient = () => client