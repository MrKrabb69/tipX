function insertTipButton(username, element) {
    if (!element.querySelector('.tip-sol-btn')) {  // Prevent multiple buttons
        const tipButton = document.createElement('img');
        tipButton.src = chrome.runtime.getURL('icons/icon128.png');
        tipButton.alt = 'Tip Solana';
        tipButton.title = 'Tip Solana';
        tipButton.className = 'tip-sol-btn';
        tipButton.style.cursor = 'pointer';
        tipButton.style.marginLeft = '5px';
        tipButton.style.width = '20px';
        tipButton.onclick = function() {
            fetch(`http://localhost:3001/api/getWallet/${username}`)
                .then(response => response.json())
                .then(data => {
                    if (data.walletAddress) {
                        sendSolanaTip(data.walletAddress);
                    } else {
                        console.error('No wallet address found');
                    }
                })
                .catch(error => console.error('Error fetching wallet address:', error));
        };

        element.appendChild(tipButton);
    }
}

function sendSolanaTip(walletAddress) {
    console.log(`Sending Solana tip to ${walletAddress}`);
    // Here, integrate with Solana blockchain to perform the transaction
}

function detectTwitterUsers() {
    const profileLinks = document.querySelectorAll('a[href*="/"]');
    profileLinks.forEach(link => {
        const isUserProfile = link.href.includes('twitter.com') && link.pathname.split('/').length === 2;
        if (isUserProfile) {
            const username = link.pathname.split('/')[1];
            if (username) insertTipButton(username, link);
        }
    });
}

setInterval(detectTwitterUsers, 1000);  // Re-run periodically to capture new elements
