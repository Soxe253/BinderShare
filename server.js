import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Card from './models/card.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(express.json());

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
app.post('/addCard', async (req, res) => {
    console.log("Received data:", req.body); 
    const {name, cardNumber, auto, variant, owner } = req.body;
    try{
        const card = new Card({name, cardNumber, auto, variant, owner});
        await card.save();
        res.status(201).send(card);
    } catch(e) {
        res.status(400).send(e.message);
    }
});

//delete card- real function
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
//add card- test function
// async function addCard(){
//     try{
//         const card = new Card ({
//             name: "testCard1",
//             cardNumber: "1/100",
//             auto: false,
//             variant: "Chrome"
//         });
//         await card.save();
//         console.log("card saved successfuly");
//     } catch(e){
//         console.log("error saving card", e);
//     }
// };

//addCard();

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

        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        res.json({ message: "Card deleted successfully", cardID });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

//route for individual card
app.get('/card/:id', async (req, res) => {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send('Card not found');
    res.render('card', { card });
});

// Collection route (list all cards)
app.get('/collection', async (req, res) => {
    const cards = await Card.find(); // Fetch all cards
    res.render('collection', { cards });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });
