// const xrpl = require('xrpl')

// async function createWallet() {
//     const wallet = xrpl.Wallet.generate();
//     console.log(`New wallet address: ${wallet.classicAddress}`)
//     return wallet;
// }

// // You might trigger this function when the extension is first installed or first opened.
// createWallet().then(wallet => {
//     // Transmit the wallet details securely to your server
//     saveWalletDetails(wallet);
// });

// async function saveWalletDetails(wallet) {
//     try {
//         const response = await fetch('https://yourserver.com/api/wallets', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 address: wallet.classicAddress,
//                 secret: wallet.seed
//             })
//         });
//         const jsonResponse = await response.json();
//         console.log('Wallet saved:', jsonResponse);
//     } catch (error) {
//         console.error('Error saving wallet:', error);
//     }
// }


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("x.com") && changeInfo.status === "complete") {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: checkTwitterProfile
        }, (results) => {
            if (results[0].result.username) {
                const username = results[0].result.username;
                fetch(`http://localhost:3000/getWallet/${username}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.walletAddress) {
                            // Store the wallet address in Chrome storage or handle as needed
                            chrome.storage.local.set({[username]: data.walletAddress});
                        }
                    })
                    .catch(error => console.error('Error fetching wallet address:', error));
            }
        });
    }
});




function checkTwitterProfile() {
    chrome.runtime.sendMessage({message: "isProfilePage"}, function(response) {
        return {username: response.username};
    });
}
