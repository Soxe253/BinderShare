import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    cards: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Card' }
    ],
    binders: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Binder' }
    ],
})

const User = model('User', userSchema);
export default User;
