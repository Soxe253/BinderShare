import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import formidable from 'express-formidable';
import Card from './models/card.js';
import User from './models/user.js';
import Binder from './models/binder.js';
import fs from 'fs';
import fetch from 'node-fetch';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import session from 'express-session';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//static files
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views'); 


const dbURL = process.env.monConnect;
const pokemonKey = process.env.pokemontcg;
const sessionKey = process.env.sessionKey;
mongoose.connect(dbURL);

const saltRounds = 10;

// go home 
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/home.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/user.html'));
});

app.get('/signUp', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/views/signUp.html'));
});

app.get('/add-Card', (req,res) => {
    res.sendFile(path.join(__dirname, 'public/views/add-Card.html'));
});

app.use(session({
    secret: sessionKey, 
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
}));

//get cards
app.get('/cards', async (req,res) => {
    try{
        const userName = req.session.username;
        const user = await User.findOne({ name: userName }).populate('cards');
        res.json(user.cards);
    }catch(e){
        res.status(500).send(e.message);
    }
});

//get binders
app.get('/binders', async (req,res) => {
    try{
        const userName = req.session.username;
        const user = await User.findOne({ name: userName }).populate('binders');
        res.json(user.binders);
    }catch(e){
        res.status(500).send(e.message);
    }
});

app.get('/session-check', (req, res) => {
    if (req.session.userId) {
      res.json({ 
        loggedIn: true,
        userId: req.session.userId,
        username: req.session.username 
      });
    } else {
      res.json({ loggedIn: false });
    }
  });
  

//get card image
async function getCardLargeImage(cardId) {
    const url = `https://api.pokemontcg.io/v2/cards/${cardId}?select=images`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Api-Key': pokemonKey,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching card: ${response.statusText}`);
      }
  
      const cardData = await response.json();
  
      // Extract the large image URL from the response
      const largeImageUrl = cardData.data.images.large;
  
      return largeImageUrl; // Return the large image URL
  
    } catch (error) {
      console.error('Error fetching card data:', error);
      return null; // Return null if there's an error
    }
  }
  

//add card- real function
app.post('/addCard', async (req, res) => {
    console.log("Received data:", req.body); 
    const {name, set, cardNumber, auto, variant, owner } = req.body;

    const tempSet = set.split(" ");
    const tempNum = cardNumber.split("/");
    
    const cardId = tempSet[1] + "-" + tempNum[0];
    console.log("cardID " + cardId);
    
    try {
        // Fetch the large image URL using the cardId
        const largeImageUrl = await getCardLargeImage(cardId);
        
        // Create the card object including the image URL
        const card = new Card({
            name,
            set,
            cardNumber,
            auto,
            variant,
            image: largeImageUrl,
            owner
        });

        // Save the card to the database
        await card.save();

        // Add the card to the user's collection
        const userName = req.session.username;
        await User.updateOne(
            { name: userName },
            { $push: { cards: card._id.toString() } }
        );

        // Respond with the created card
        res.status(201).send(card);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

app.post("/add-to-collection", async (req, res) => {
    try {
        const { cardId } = req.body;
        if (!cardId) return res.status(400).json({ error: "Missing card ID." });

        // Fetch the card data from the Pokémon TCG API
        const apiUrl = `https://api.pokemontcg.io/v2/cards/${cardId}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch card data.");

        const data = await response.json();
        const card = data.data;

        if (!card) return res.status(404).json({ error: "Card not found." });

        const number = card.number + "/" + card.set?.printedTotal;

        const newCard = new Card({
            name: card.name,
            set: card.set?.name,
            cardNumber: number,
            auto: false,
            variant: card.rarity || "none",
            image: card.images?.large,
            owner: req.session.username
        });

        await newCard.save();

        // Add the card to the user's collection
        const userName = req.session.username;
        await User.updateOne(
            { name: userName },
            { $push: { cards: newCard._id.toString() } }
        );

        // Respond with the created card
        res.status(201).send(newCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});


//get all pokemon card names
app.get('/card-names', (req, res) => {
    const filePath = path.join(__dirname, 'pokemonNames.txt');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to read card names' });
        }

        const cardNames = data.split('\n').map(name => name.trim()).filter(name => name);
        res.json(cardNames);
    });
});

//get all pokemon card set names
app.get('/set-names', (req, res) => {
    const filePath = path.join(__dirname, 'pokemonSets.txt');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to read card names' });
        }

        const setNames = data.split('\n').map(name => name.trim()).filter(name => name);
        res.json(setNames);
    });
});

//delete card- real function - not in use?
app.delete('/cards', async (req, res) => {
    const {name, set, cardNumber, auto, variant, owner } = req.body;
    try{
        const card = Card.findOneAndDelete({name, set, cardNumber, auto, variant, owner });

        if(!card){
            return res.status(404).send('Card not found');
        }
        
        res.status(200).send('Card deleted successfully');
    }catch (e) {
        res.status(500).send(e.message);
    }
   
});

app.post('/signup', async (req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    try {
        // check if username already exists
        const existingUser = await User.findOne({ name: username });
    
        if (existingUser) {
          console.log("Username Taken");
          return res.redirect("/signUp");
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User ({
            name: username,
            password: hashedPassword,
            cards: [],
            binders: []
        });
    
        await user.save();

    res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
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
app.post('/login', async (req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    try{
        const user = await User.findOne({ name: username });
        

        if(!user){
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({ error: 'Invalid password' });
        }
        if (isMatch) {
            req.session.userId = user._id;
            req.session.username = user.name;
            return res.status(200).json({ message: 'Login successful' });
          }
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again later.' });
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
        const userName = req.session.username;
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
    const userName = req.session.username;
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
//delete a binder from db and user
app.delete('/deleteBinder', async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const {binderID} = req.body;

        // Remove the card
        const binder = await Binder.findByIdAndDelete(binderID);
        const userName = req.session.username;
        await User.updateOne(
            { name: userName },
            { $pull: { binders: binder._id.toString() } }
        );
        if (!binder) {
            return res.status(404).json({ message: "Binder not found" });
        }

        res.json({ message: "Binder deleted successfully", binderID });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//route for individual card
app.get('/card/:id', async (req, res) => {
    try{
        const userName = req.session.username;
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
    const userName = req.session.username;
    const user = await User.findOne({ name: userName }).populate('cards');
    await user.populate('binders');
    res.render('collection', { cards: user.cards, binders: user.binders });
});

//Binders route
app.get('/binder/:id', async (req,res) => {
    try{
        const userName = req.session.username;
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

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
  
      res.clearCookie('connect.sid');
      res.redirect("/");
    });
  });

//add card to a binder
app.post('/add-to-binder', formidable(), async (req, res) => {
    const { cardId, binderId } = req.fields;
    
    try {  
        console.log('cardId:', cardId);
        console.log('binderId:', binderId);
  
        const userName = req.session.username;
        const user = await User.findOne({ name: userName }).populate('binders');
        
        const binder = user.binders.find(b => b._id.toString() === binderId);

        if (!binder) {
            return res.status(404).json({ error: 'Binder not found' });
        }

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        // **Check if card already exists in the binder**
        const cardExists = binder.cards.some(c => c.toString() === card._id.toString());

        if (cardExists) {
            return res.status(400).json({ error: 'Card is already in this binder' });
        }

        // **Add the card only if it's not already present**
        await binder.updateOne({ $push: { cards: card._id } });

        res.status(200).json({ message: 'Card added to binder' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error adding card to binder' });
    }
});


app.post('/binder/:binderId/remove-card/:cardId', async (req, res) => {
    const { binderId, cardId } = req.params;
    await Binder.findByIdAndUpdate(binderId, { $pull: { cards: cardId } });
    res.sendStatus(200);
  });
  

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });
