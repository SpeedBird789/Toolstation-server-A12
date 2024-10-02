const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

const options = [
    cors({
        origin: '*',
        methods: '*',
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
];

// Using middleware
app.use(options);

app.use(express.json());

// Original 2022
/* const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ielft.mongodb.net/?retryWrites=true&w=majority`;
*/


// 2024
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2024.cfbcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2024`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const toolCollection = client.db('manufacturing').collection('tools');
        const reviewsCollection = client.db('manufacturing').collection('reviews');
        const orderCollection = client.db('manufacturing').collection('orders');
        const usersCollection = client.db('manufacturing').collection('users');


        app.get('/tool', async (req, res) => {
            const query = {};
            const cursor = toolCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        app.get('/user', verifyJWT, async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        });

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await usersCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'forbidden' });
            }

        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })

        app.get('/tool/:_id', async (req, res) => {
            const _id = req.params._id;
            const query = { _id: ObjectId(_id) };
            const tool = await toolCollection.findOne(query);
            res.send(tool);
        })

        // GET
        app.get('/tool', verifyJWT, async (req, res) => {
            const tools = await toolCollection.find().toArray();
            res.send(tools);
        })

        // POST
        app.post('/tool', async (req, res) => {
            const newTool = req.body;
            const result = await toolCollection.insertOne(newTool);
            res.send(result);
        })

        // DELETE
        app.delete('/tool/:name', async (req, res) => {
            const name = req.params.name;
            const filter = { name: name };
            const result = await toolCollection.deleteOne(filter);
            res.send(result);
        })


        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        app.get('/order', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const orders = await orderCollection.find(query).toArray();
                return res.send(orders);
            }
            else {
                return res.status(403).send({ message: 'forbidden access' });
            }

        })
    }
    finally {
        await client.close();
    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Running manufacturing server portal');
});


app.listen(port, () => {
    console.log(`Manufacturing server is running on port: ${port}`);
})

// Whoashhhh!