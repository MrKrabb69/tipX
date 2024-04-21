document.getElementById('saveWallet').addEventListener('click', () => {
    const walletAddress = document.getElementById('walletAddress').value;
    if (walletAddress) {
        chrome.storage.local.set({walletAddress: walletAddress}, () => {
            console.log('Wallet address saved:', walletAddress);
        });
    }
});
