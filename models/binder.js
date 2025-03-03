import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const binderSchema = new Schema({
    name: { type: String, required: true },
    cards: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Card' }
    ],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
})

const Binder = model('Binder', binderSchema);
export default Binder;
