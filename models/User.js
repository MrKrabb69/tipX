// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    wallet: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet'
    },
    walletAddress: {
        type: String,
        required: true
    },
    encryptedSecret: {
        type: String,
        required: true
    } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
