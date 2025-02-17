import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const cardSchema = new Schema({
    name: { type: String, required: true },
    cardNumber: { type: String, required: true},
    auto: { type: Boolean, required: true},
    variant: { type: String },
    owner : { type: String },
})

const Card = model('Card', cardSchema);
export default Card;
