// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const app = express();
// const port = process.env.PORT || 3001;

// app.use(cors());
// app.use(express.json());

// const userSchema = new mongoose.Schema({
//   username: String,
//   walletAddress: String
// });

// const User = mongoose.model('User', userSchema);

// // Connect to MongoDB
// const db = process.env.MONGO_DB_URL;

// mongoose.connect(db, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// // Endpoint to get wallet address by Twitter username
// app.get('/api/getWallet/:username', async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.params.username });
//     if (user) {
//       res.json({ walletAddress: user.walletAddress });
//     } else {
//       res.status(404).send('User not found');
//     }
//   } catch (error) {
//     res.status(500).send('Server error');
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

// ...... 

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // MongoDB model for Users
const { Wallet } = require('xrpl');
require('dotenv').config();
const cors = require('cors');



const app = express();
const port = 3000;

app.use(cors(
  { origin: '*' }
));

app.use(express.json());

const db = process.env.MONGO_DB_URL;

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });

// const encryptSecret = (secret) => {
//   const cipher = crypto.createCipher('aes-256-cbc', 'encryption-key');
//   let encrypted = cipher.update(secret, 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return encrypted;
// };

function encryptSecret(secret) {
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


app.post('/api/users/signup', async (req, res) => {
    console.log("enters signup")
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        // Create a new wallet
        const newWallet = Wallet.generate();
        const encryptedSecret = encryptSecret(newWallet.seed);

        const newUser = new User({ 
          username, 
          password: hashedPassword, 
          walletAddress: newWallet.classicAddress,
          encryptedSecret: JSON.stringify(encryptedSecret)
        });

       resul = await newUser.save();
       console.log({resul})
       const { password, ...d} = resul;
        res.status(201).json({ message: 'User registered successfully', data: d});
    } catch (error) {
        console.log("Error", error.message);
        res.status(500).send('Error registering new user');
    }
});

app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).send({ message: 'Authentication failed' });
    }
    const token = jwt.sign({ userId: user._id }, 'hzR+LhT52k402KT/xmChtpIKbwE4tJaHoW2ce0dOobA=');
    res.send({ message: 'Login successful', user: { username: user.username, walletAddress: user.walletAddress }, token });
});

app.get('/api/users/get-wallet/:twitterUsername', async (req, res) => {
    const { twitterUsername } = req.params;
    const user = await User.findOne({ username: twitterUsername });
    if (user) {
        res.json({ walletAddress: user.walletAddress });
    } else {
        res.status(404).send('User not found');
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
