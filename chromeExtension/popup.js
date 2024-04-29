// const xrpl = require('xrpl')
// const axios = require('axios');


// async function sendXRP(sender, receiver, amount) {
//     // Connect to XRP Ledger
//     const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233")
//     await client.connect();
  
//     // Define sender's wallet from seed
//     const wallet = xrpl.Wallet.fromSeed(sender);
//   //   const wallet = xrpl.Wallet.fromSeed("sYourSenderSeedHere");
  
//     // Prepare transaction
//     const preparedTx = await client.autofill({
//       "TransactionType": "Payment",
//       "Account": wallet.classicAddress,
//       "Amount": xrpl.xrpToDrops(amount),  // Convert XRP to drops
//       "Destination": receiver
//     });
  
//     // Sign the transaction
//     const signedTx = wallet.sign(preparedTx);
  
//     // Submit the transaction
//     const result = await client.submitAndWait(signedTx.tx_blob);
    
//     console.log("Transaction result:", result);
  
//     // Disconnect when done
//     await client.disconnect();
//   }

// document.getElementById('sendTip').addEventListener('click', async () => {
//     const seedPhrase = document.getElementById('seedPhrase').value;
//     const amount = document.getElementById('amount').value;
//     if (!seedPhrase || !amount) {
//         alert("Please fill all fields.");
//         return;
//     }

//     await sendXRP(seedPhrase, )
//     // You would need to handle the wallet creation and transaction sending here
//     console.log(`Sending ${amount} XRP...`);
// });


document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('authForm');
    const sendXrpForm = document.getElementById('sendXrpForm');

    console.log({sendXrpForm, authForm})

    function showSendXrpForm() {
        authForm.classList.add('hidden');
        sendXrpForm.classList.remove('hidden');
    }

    function showAuthForm() {
        authForm.classList.remove('hidden');
        sendXrpForm.classList.add('hidden');
    }

    document.getElementById('Login').addEventListener('click', async () => {
        alert("Login?");
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) throw new Error('Login failed');
            showSendXrpForm();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    });

    // //     const username = document.getElementById('username').value;
    // //     const password = document.getElementById('password').value;
    // //     try {
    // //         const response = await fetch('http://localhost:3000/api/users/login', {
    // //             method: 'POST',
    // //             headers: { 'Content-Type': 'application/json' },
    // //             body: JSON.stringify({ username, password })
    // //         });
    // //         if (!response.ok) throw new Error('Login failed');
    // //         showSendXrpForm();
    // //     } catch (error) {
    // //         alert('Login failed: ' + error.message);
    // //     }
    // // };

    document.getElementById('Signup').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('http://localhost:3000/api/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            console.log({response})
            if (!response.ok) throw new Error('Signup failed');
            const data = await response.json();
            console.log('Fetched data:', data.data._doc)

            alert(JSON.stringify(data.data._doc))
            localStorage.setItem('tipxUser', JSON.stringify(data.data._doc))
            showSendXrpForm();
        } catch (error) {
            alert('Signup failed: ' + error.message);
        }
    })

    // document.getElementById('Login').addEventListener('click', async () => {
    //     const username = document.getElementById('username').value;
    //     const password = document.getElementById('password').value;
    //     try {
    //         const response = await axios.post('http://localhost:3000/api/users/login', {
    //             username,
    //             password
    //         });
    //         // Store user info in localStorage
    //         localStorage.setItem('tipxUser', JSON.stringify(response.data));
    //         showSendXrpForm();
    //     } catch (error) {
    //         alert('Login failed: ' + (error.response ? error.response.data.message : error.message));
    //     }
    // });
    
    // document.getElementById('Signup').addEventListener('click', async () => {
    //     const username = document.getElementById('username').value;
    //     const password = document.getElementById('password').value;
    //     try {
    //         const response = await axios.post('http://localhost:3000/api/users/signup', {
    //             username,
    //             password
    //         });
    //         // Assuming the server response includes user data on successful signup
    //         localStorage.setItem('tipxUser', JSON.stringify(response.data));
    //         showSendXrpForm();
    //     } catch (error) {
    //         alert('Signup failed: ' + (error.response ? error.response.data.message : error.message));
    //     }
    // });

    function getUserFromStorage() {
        const userData = localStorage.getItem('tipxUser');
        return userData ? JSON.parse(userData) : null;
    }
    

    window.sendXRP = async () => {
        const recipientUsername = document.getElementById('recipientTwitterUsername').value;
        const amount = document.getElementById('xrpAmount').value;
        const user = getUserFromStorage();
    
        if (!user || !user.token) {
            alert('You are not logged in');
            return;
        }
    
        try {
            // Example: API should require authentication token
            const response = await axios.post('http://localhost:3000/api/transaction/send', {
                sender: user.username,
                receiver: recipientUsername,
                amount
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            });
            console.log('Transaction successful:', response.data);
        } catch (error) {
            console.error('Failed to send XRP:', (error.response ? error.response.data.message : error.message));
        }
    };

    window.logout = () => {
        localStorage.removeItem('tipxUser');
        showAuthForm();
    };
});


