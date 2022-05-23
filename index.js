const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// Using middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Running manufacturing server portal');
});


app.listen(port, ()=>{
    console.log('Manufactring server is running');
})