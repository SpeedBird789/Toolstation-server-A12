const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2024.cfbcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2024`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

connectToDB();

module.exports = { client };