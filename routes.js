const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Initialize Router
const router = express.Router();

// MongoDB setup (move this to a config or separate file if needed)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2024.cfbcm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2024`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect().then(() => {
    const toolCollection = client.db('manufacturing').collection('tools');
    const reviewsCollection = client.db('manufacturing').collection('reviews');
    const orderCollection = client.db('manufacturing').collection('orders');
    const usersCollection = client.db('manufacturing').collection('users');

    // JWT verification middleware
    function verifyJWT(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send({ message: 'UnAuthorized access' });
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).send({ message: 'Forbidden access' });
            }
            req.decoded = decoded;
            next();
        });
    }

    // Routes

    // Tools
    router.get('/tool', async (req, res) => {
        const tools = await toolCollection.find().toArray();
        res.send(tools);
    });

    router.get('/tool/:_id', async (req, res) => {
        const _id = req.params._id;
        const query = { _id: ObjectId(_id) };
        const tool = await toolCollection.findOne(query);
        res.send(tool);
    });

    router.post('/tool', async (req, res) => {
        const newTool = req.body;
        const result = await toolCollection.insertOne(newTool);
        res.send(result);
    });

    router.delete('/tool/:name', async (req, res) => {
        const name = req.params.name;
        const result = await toolCollection.deleteOne({ name: name });
        res.send(result);
    });

    // Users
    router.get('/user', verifyJWT, async (req, res) => {
        const users = await usersCollection.find().toArray();
        res.send(users);
    });

    router.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const result = await usersCollection.updateOne(
            { email: email },
            { $set: user },
            { upsert: true }
        );
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.send({ result, token });
    });

    router.put('/user/admin/:email', verifyJWT, async (req, res) => {
        const email = req.params.email;
        const requester = req.decoded.email;
        const requesterAccount = await usersCollection.findOne({ email: requester });
        if (requesterAccount.role === 'admin') {
            const result = await usersCollection.updateOne(
                { email: email },
                { $set: { role: 'admin' } }
            );
            res.send(result);
        } else {
            res.status(403).send({ message: 'Forbidden' });
        }
    });

    // Reviews
    router.get('/review', async (req, res) => {
        const reviews = await reviewsCollection.find().toArray();
        res.send(reviews);
    });

    // Orders
    router.post('/order', async (req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order);
        res.send(result);
    });

    router.get('/order', verifyJWT, async (req, res) => {
        const email = req.query.email;
        const decodedEmail = req.decoded.email;
        if (email === decodedEmail) {
            const orders = await orderCollection.find({ email }).toArray();
            res.send(orders);
        } else {
            res.status(403).send({ message: 'Forbidden access' });
        }
    });
});

module.exports = router;