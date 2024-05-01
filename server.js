
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Wallet, Client, XrplNetwor, xrpToDrops  } = require('xrpl');
const crypto = require('crypto');
const cors = require('cors');

const app = express();

app.use(cors(
    { origin: '*' }
  ));

const port = process.env.PORT || 3000;

// MongoDB model
const walletSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true },
  encryptedSeed: { type: String, required: true }
});
const WalletModel = mongoose.model('Wallet', walletSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.json());

// Encrypt function
// function encrypt(text) {
//   const cipher = crypto.createCipher('aes-256-ctr', process.env.SECRET_KEY);
//   let crypted = cipher.update(text, 'utf8', 'hex');
//   crypted += cipher.final('hex');
//   return crypted;
// }

function encrypt(secret) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32);  // 256 bits key
  const iv = crypto.randomBytes(16);   // 16 bytes IV for AES

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      key: key.toString('hex')  // Storing key in hex format
  };
}

// Decrypt function
// function decrypt(text) {
//   const decipher = crypto.createDecipher('aes-256-ctr', process.env.SECRET_KEY);
//   let dec = decipher.update(text, 'hex', 'utf8');
//   dec += decipher.final('utf8');
//   return dec;
// }

function decrypt(text) {
    const {encryptedData, iv, key} = JSON.parse(text)
    const algorithm = 'aes-256-cbc';
    
    // Convert hexadecimal string back to binary data
    const keyH = Buffer.from(key, 'hex');
    const ivH = Buffer.from(iv, 'hex');
  
    const decipher = crypto.createDecipheriv(algorithm, keyH, ivH);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');  // Output as utf8 to match the input encoding
    return decrypted;
  }

// XRPL Client
const client = new Client('wss://s.altnet.rippletest.net:51233'); 

// Create a new wallet and store in database
app.post('/createWallet', async (req, res) => {
    console.log('enters create');
  try {
    await client.connect();
    const newWallet = Wallet.generate();
    const encryptedSeed = encrypt(newWallet.seed);

    const wallet = new WalletModel({
      username: req.body.username,
      walletAddress: newWallet.classicAddress,
      encryptedSeed: JSON.stringify(encryptedSeed)
    });

    await wallet.save();
    console.log('no errors');
    res.json({
      walletAddress: newWallet.classicAddress,
      message: "Wallet created successfully"
    });
  } catch (error) {
    res.status(500).send("Error creating wallet");
  } finally {
    await client.disconnect();
  }
});

// Fetch wallet info including balance
app.get('/wallet/:username', async (req, res) => {
    console.log('enters the username bal');
  try {
    const wallet = await WalletModel.findOne({ username: req.params.username });
    if (!wallet) {
      return res.status(404).json({"error": "Wallet not found"});
    }

    await client.connect();
    const account_info = await client.request({
      command: 'account_info',
      account: wallet.walletAddress,
      ledger_index: 'validated'
    });
    res.json({
      walletAddress: wallet.walletAddress,
      balance: account_info.result.account_data.Balance
    });
  } catch (error) {
    console.log(error.message);
    if(error.message == "Account not found."){
        res.json({
            balance: 0
          }); 
    } else{
        res.status(500).send("Error fetching wallet info");
    }
  } finally {
    await client.disconnect();
  }
});

// Send XRP transaction
app.post('/sendXrp', async (req, res) => {
  try {
    const { fromUsername, toUsername, amount } = req.body;

    const senderWallet = await WalletModel.findOne({ username: fromUsername });
    const receiverWallet = await WalletModel.findOne({ username: toUsername });

    if (!senderWallet || !receiverWallet) {
      return res.status(404).send("Wallet not found");
    }

    const senderSeed = decrypt(senderWallet.encryptedSeed);
    const sender = Wallet.fromSeed(senderSeed);

    await client.connect();
    const preparedTx = await client.autofill({
      TransactionType: "Payment",
      Account: sender.classicAddress,
      Amount: xrpToDrops(amount), // Convert XRP to drops
      Destination: receiverWallet.walletAddress
    });

    const signed = sender.sign(preparedTx);
    const result = await client.submitAndWait(signed.tx_blob);
    
    res.json({ result: result, message: "Transaction successful" });
  } catch (error) {
    console.log(error.message)
    res.status(500).send("Error during transaction");
  } finally {
    await client.disconnect();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
