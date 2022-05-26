const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
        const reviewsCollection = client.db('manufacturing').collection('reviews');
        const orderCollection = client.db('manufacturing').collection('orders');

        app.get('/tool', async(req, res)=>{
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        app.get('/tool/:_id', async(req, res) =>{
            const _id = req.params._id;
            const query = {_id: ObjectId(_id)};
            const tool = await toolCollection.findOne(query);
            res.send(tool);
        })


        app.get('/review', async(req, res)=>{
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


        app.post('/order', async(req, res)=>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        app.get('/order', async(req, res)=>{
            const email = req.query.email;
            const query = {email:email};
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);

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