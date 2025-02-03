import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import mongoose from 'mongoose';
import Card from './models/card.js';
import { filterOptions } from 'mongodb/lib/utils.js';
import 'dotenv/config';

const app = express();
app.use('/public', express.static('public'));
app.use(bodyParser.json());

//static files
app.use(express.static('public'));

const dbURL = process.env.monConnect;
mongoose.connect(dbURL);

//get cards
app.get('/cards', async (req,res) => {
    try{
        const cards = await Card.find();
        res.json({cards});
    }catch(e){
        res.status(500).send(error.message);
    }
});

//add card- real function
app.post('/cards', async (req, res) => {
    const {name, cardNumber, auto, variant } = req.body;
    try{
        const card = new Card({name, cardNumber, auto, variant});
        await card.save();
        res.status(201).send(card);
    } catch(e) {
        res.status(400).send(e.message);
    }
});

//delete card- real function
app.delete('/cards', async (req, res) => {
    const {name, cardNumber, auto, variant } = req.body;
    try{
        const card = Card.findOneAndDelete({name, cardNumber, auto, variant });

        if(!card){
            return res.status(404).send('Card not found');
        }
        
        res.status(200).send('Card deleted successfully');
    }catch (e) {
        res.status(500).send(e.message);
    }
   
});
//add card- test function
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
