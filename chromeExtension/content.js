chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "isProfilePage") {
        const username = window.location.pathname.slice(1); // Assuming URL structure is twitter.com/username
        if (username && !username.includes('/')) { // Simple check to ensure it's a profile page
            sendResponse({username: username});
        } else {
            sendResponse({username: null});
        }
    }
});
