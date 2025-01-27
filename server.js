import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';

const app = express();
app.use('/public', express.static('public'));
app.use(bodyParser.json());

//static files
app.use(express.static('public'));

// Serve home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(path.resolve(), 'public/home.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});