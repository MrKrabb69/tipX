// models/Wallet.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const walletSchema = new Schema({
    address: {
        type: String,
        required: true,
        unique: true
    },
    encryptedSecret: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
