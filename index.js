const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Using middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Running manufacturing server portal');
});


app.listen(port, ()=>{
    console.log('Manufactring server is running');
})