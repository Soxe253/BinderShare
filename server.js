import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import formidable from 'express-formidable';
import Card from './models/card.js';
import User from './models/user.js';
import Binder from './models/binder.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(formidable());


//static files
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views'); 


const dbURL = process.env.monConnect;
mongoose.connect(dbURL);

// go home 
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/home.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/user.html'));
});

//get cards
app.get('/cards', async (req,res) => {
    try{
        const userName = admin.username;
        const user = await User.findOne({ name: userName }).populate('cards');
        res.json(user.cards);
    }catch(e){
        res.status(500).send(e.message);
    }
});

//add card- real function
app.post('/addCard', async (req, res) => {
    console.log("Received data:", req.body); 
    const {name, cardNumber, auto, variant, owner } = req.body;
    try{
        const card = new Card({name, cardNumber, auto, variant, owner});
        await card.save();
        const userName = admin.username;
        await User.updateOne(
            { name: userName },
            { $push: { cards: card._id.toString() } }
        );
        res.status(201).send(card);
    } catch(e) {
        res.status(400).send(e.message);
    }
});

//delete card- real function - not in use?
app.delete('/cards', async (req, res) => {
    const {name, cardNumber, auto, variant, owner } = req.body;
    try{
        const card = Card.findOneAndDelete({name, cardNumber, auto, variant, owner });

        if(!card){
            return res.status(404).send('Card not found');
        }
        
        res.status(200).send('Card deleted successfully');
    }catch (e) {
        res.status(500).send(e.message);
    }
   
});

async function addUser(){
    try{
        const user = new User ({
            name: "soxe",
            cards: [],
            binders: []
        });
        await user.save();
        console.log("user saved successfuly");
    } catch(e){
        console.log("error saving user", e);
    }
};

//addUser();

//login check
//hardcoded login
const admin = {username: "soxe", password: "123"};
app.post('/login', (req,res) => {
    const {username,password} = req.body;
    if(username === admin.username && password === admin.password){
        res.status(200).json({ message: "Login successful", user: { username } });
    } else {
        res.status(401).json({ message: "Invalid username or password" });
    }
});

// send to login
app.get('/', (req, res) => {
    res.sendFile(path.join(path.resolve(), 'public/views/login.html'));
});

//delete
app.delete('/deleteCard', async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const {cardID} = req.body;

        // Remove the card
        const card = await Card.findByIdAndDelete(cardID);
        const userName = admin.username;
        await User.updateOne(
            { name: userName },
            { $pull: { cards: card._id.toString() } }
        );
        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        res.json({ message: "Card deleted successfully", cardID });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//add a binder
app.post('/addBinder', async (req, res) => {
    console.log("Received data:", req.body); 
    const {name} = req.body;
    const userName = admin.username;
    const user = await User.findOne({ name: userName })
    console.log('user id: ' + user._id);
    try{
        const binder = new Binder({
            name,
            cards: [],
            owner: user._id
        })
        console.log(binder);
        await binder.save();
        await User.updateOne(
            { name: userName },
            { $push: { binders: binder._id } }  // Push the binder's ObjectId to the binders array
        );
        res.status(201).send(binder);
    } catch(e) {
        res.status(400).send(e.message);
    }
});

//route for individual card
app.get('/card/:id', async (req, res) => {
    try{
        const userName = admin.username;
        const user = await User.findOne({ name: userName }).populate('cards');
        const card = user.cards.find(card => card._id.toString() === req.params.id);
        await user.populate('binders');
        if (!card) return res.status(404).send('Card not found');
        res.render('card', { card, binders: user.binders });
    }catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Collection route (list all cards)
app.get('/collection', async (req, res) => {
    const userName = admin.username;
    const user = await User.findOne({ name: userName }).populate('cards');
    await user.populate('binders');
    res.render('collection', { cards: user.cards, binders: user.binders });
});

//Binders route
app.get('/binder/:id', async (req,res) => {
    try{
        const userName = admin.username;
        //find user and pop binders then cards in binder
        const user = await User.findOne({ name: userName })
            .populate({
                path: 'binders',
                populate: { path: 'cards' } // Populate the cards inside each binder
            });

        const binder = user.binders.find(binder => binder._id.toString() === req.params.id);
        if (!binder) return res.status(404).send('Binder not found');
        res.render('binder', { binder });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//add card to a binder
app.post('/add-to-binder', async (req, res) => {
    const { cardId, binderId } = req.fields;
    
    try{  
        console.log('cardId:', cardId);
        console.log('binderId:', binderId);
  
        const userName = admin.username;
        const user = await User.findOne({ name: userName }).populate('binders');
        
        const binder = user.binders.find(b => b._id.toString() === binderId);

        if (!binder) {
            return res.status(404).send('Binder not found');
        }

        const card = await Card.findById(cardId);

        if (!card) {
            return res.status(404).send('Card not found');
        }

        await binder.updateOne(
            { $push: { cards: card._id } }
        );

    res.status(200).send('Card added to binder');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding card to binder');
      }
  });
  

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });
