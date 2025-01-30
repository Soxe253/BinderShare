import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
import Card from './models/card.js';

const app = express();
app.use('/public', express.static('public'));
app.use(bodyParser.json());

//static files
app.use(express.static('public'));

mongoose.connect("mongodb+srv://soxe:scooby253@profiles-cards.hg2f4.mongodb.net/?retryWrites=true&w=majority&appName=Profiles-Cards");

//get cards
app.get('/cards', async (req,res) => {
    try{
        const cards = await Card.find();
        res.json({cards});
    }catch(e){
        res.status(500).send(error.message);
    }
});

//add card
async function addCard(){
    try{
        const card = new Card ({
            name: "testCard",
            cardNumber: "1/100",
            auto: false,
            variant: "Chrome"
        });
        await card.save();
        console.log("card saved successfuly");
    } catch(e){
        console.log("error saving card", e);
    }
};

//addCard();

// Serve home.html
app.get('/', (req, res) => {
    res.sendFile(path.join(path.resolve(), 'public/home.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
