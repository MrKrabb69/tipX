document.addEventListener('DOMContentLoaded', function() {
    // get local address and username
    chrome.storage.local.get(['username', 'walletAddress', 'walletSeed'], function(result) {
        if (result.username && result.walletAddress) {
            // Display wallet information if already available
            alert(result.username)
            getWalletBalance(result.username, result.walletAddress);

        } else {
            // Show username creation form
            document.getElementById('usernameForm').style.display = 'block';
        }
    });

    // create address if not present 
    document.getElementById('createWallet').addEventListener('click', function() {
        const username = document.getElementById('username').value;
        createWallet(username);
        // getWalletBalance(username)
    });

    document.getElementById('giveTip').addEventListener('click', () => {
        document.getElementById('tipForm').style.display = 'block';
    });

    // Event listener for sending XRP
    document.getElementById('sendXrp').addEventListener('click', function() {
        const toUsername = document.getElementById('toUsername').value.trim();
        const amount = document.getElementById('amount').value;
        sendXrp(toUsername, amount);
    });





    // Auxilliary functions --------

    function createWallet(username) {
        fetch('http://localhost:3000/createWallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        })
        .then(response => response.json())
        .then(data => {
            chrome.storage.local.set({
                username: username,
                walletAddress: data.walletAddress,
                walletSeed: data.encryptedSeed
            });
            displayWalletInfo(data.walletAddress, null, username);
        })
        .catch(error => {alert(error.message); console.error('Error creating wallet:', error)});
    }

    function getWalletBalance(username, walletAdd) {
        fetch(`http://localhost:3000/wallet/${username}`)
        .then(response => response.json())
        .then(data => {
            chrome.storage.local.set({
                walletBalance: data.balance,
                walletAddress: data.walletAddress,
            });
            displayWalletInfo(walletAdd, data.balance,username);
        })
        .catch(error => {alert(error.message); console.error('Error fetching wallet:', error)});
    }

    function displayWalletInfo(walletAddress, balance, username) {
        document.getElementById('walletAddress').textContent = walletAddress;
        document.getElementById('storedUsername').textContent = username;
        document.getElementById('walletInfo').style.display = 'block';
        document.getElementById('usernameForm').style.display = 'none';
        if(balance){
            document.getElementById('balance').textContent = `${balance} XRP`;
        } else {
            document.getElementById('balance').textContent = `Fund with XRP`;
        }
       
    }

    function sendXrp(toUsername, amount) {
        // Retrieve sender's username from local storage
        chrome.storage.local.get(['username'], function(result) {
            if (result.username) {
                const fromUsername = result.username;
    
                // Make the API call to send XRP
                fetch('http://localhost:3000/sendXrp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fromUsername: fromUsername,
                        toUsername: toUsername,
                        amount: amount
                    })
                })
                .then(response => response.json())
                .then(data => {
                    alert('Transaction successful!');
                    console.log(data); // Further handling based on your backend response
                })
                .catch(error => {
                    console.error('Error sending XRP:', error);
                    alert('Transaction failed!');
                });
            } else {
                alert('Sender username not found in storage.');
            }
        });
    }
});


function copyAddress() {
    const walletAddress = document.getElementById('walletAddress').textContent;
    navigator.clipboard.writeText(walletAddress).then(() => {
        alert('Wallet address copied to clipboard!');
    }).catch(err => {
        console.error('Error copying text: ', err);
    });
}
