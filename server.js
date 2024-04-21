const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  username: String,
  walletAddress: String
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
const db = process.env.MONGO_DB_URL;

mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Endpoint to get wallet address by Twitter username
app.get('/api/getWallet/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      res.json({ walletAddress: user.walletAddress });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
