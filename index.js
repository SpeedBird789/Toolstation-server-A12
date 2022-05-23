const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

// Using middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ielft.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const toolCollection = client.db('manufacturing').collection('tools');

        app.get('/tool', async(req, res)=>{
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        const reviewsCollection = client.db('manufacturing').collection('reviews');

        app.get('/review', async(req, res)=>{
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
    }
    finally{

    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running manufacturing server portal');
});


app.listen(port, ()=>{
    console.log('Manufactring server is running');
})