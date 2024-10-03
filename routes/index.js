const express = require('express');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { verifyJWT } = require('../middleware/verifyJWT'); // Assuming you have an auth middleware
const router = express.Router();

// Import MongoDB client and connect to your database
const { client } = require('../db'); // Adjust this import as needed

// Tools route
router.get('/tool', async (req, res) => {
    const query = {};
    const cursor = client.db('manufacturing').collection('tools').find(query);
    const tools = await cursor.toArray();
    res.send(tools);
});

// User route
router.get('/user', verifyJWT, async (req, res) => {
    const users = await client.db('manufacturing').collection('users').find().toArray();
    res.send(users);
});

// Admin check
router.get('/admin/:email', async (req, res) => {
    const email = req.params.email;
    const user = await client.db('manufacturing').collection('users').findOne({ email: email });
    const isAdmin = user?.role === 'admin'; // Safely access role
    res.send({ admin: isAdmin });
});

// Update user role to admin
router.put('/user/admin/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;
    const requester = req.decoded.email;
    const requesterAccount = await client.db('manufacturing').collection('users').findOne({ email: requester });
    if (requesterAccount?.role === 'admin') {
        const filter = { email: email };
        const updateDoc = {
            $set: { role: 'admin' },
        };
        const result = await client.db('manufacturing').collection('users').updateOne(filter, updateDoc);
        res.send(result);
    } else {
        res.status(403).send({ message: 'forbidden' });
    }
});

// Update user details
router.put('/user/:email', async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = { email: email };
    const options = { upsert: true };
    const updateDoc = {
        $set: user,
    };
    const result = await client.db('manufacturing').collection('users').updateOne(filter, updateDoc, options);
    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ result, token });
});

// Get tool by ID
router.get('/tool/:_id', async (req, res) => {
    const _id = req.params._id;
    const query = { _id: ObjectId(_id) };
    const tool = await client.db('manufacturing').collection('tools').findOne(query);
    res.send(tool);
});

// Post new tool
router.post('/tool', async (req, res) => {
    const newTool = req.body;
    const result = await client.db('manufacturing').collection('tools').insertOne(newTool);
    res.send(result);
});

// Delete tool by name
router.delete('/tool/:name', async (req, res) => {
    const name = req.params.name;
    const filter = { name: name };
    const result = await client.db('manufacturing').collection('tools').deleteOne(filter);
    res.send(result);
});

// Get all reviews
router.get('/review', async (req, res) => {
    const query = {};
    const cursor = client.db('manufacturing').collection('reviews').find(query);
    const reviews = await cursor.toArray();
    res.send(reviews);
});

// Post new order
router.post('/order', async (req, res) => {
    const order = req.body;
    const result = await client.db('manufacturing').collection('orders').insertOne(order);
    res.send(result);
});

// Get orders by user email
router.get('/order', verifyJWT, async (req, res) => {
    const email = req.query.email;
    const decodedEmail = req.decoded.email;
    if (email === decodedEmail) {
        const query = { email: email };
        const orders = await client.db('manufacturing').collection('orders').find(query).toArray();
        return res.send(orders);
    } else {
        return res.status(403).send({ message: 'forbidden access' });
    }
});

module.exports = router;