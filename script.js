// Helper function to encode messages in Base64 with UTF-8 support
function encodeMessagesToBase64(messages) {
    try {
        const jsonString = JSON.stringify(messages);
        const utf8Bytes = new TextEncoder().encode(jsonString);
        return btoa(String.fromCharCode(...utf8Bytes));
    } catch (e) {
        console.error("Failed to encode messages to Base64:", e);
        return "";
    }
}

// Helper function to decode messages from Base64 with UTF-8 support
function decodeMessagesFromBase64(encodedMessages) {
    try {
        const binaryString = atob(encodedMessages);
        const utf8Bytes = new Uint8Array([...binaryString].map(char => char.charCodeAt(0)));
        const jsonString = new TextDecoder().decode(utf8Bytes);
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to decode messages from Base64:", e);
        return [];
    }
}

// Helper function to get messages from the URL
function getMessagesFromURL() {
    const params = new URLSearchParams(window.location.search);
    const encodedMessages = params.get('a'); // Use 'a' as the tag name
    return encodedMessages ? decodeMessagesFromBase64(encodedMessages) : [];
}

// Helper function to set messages to the URL
function setMessagesToURL(messages) {
    const params = new URLSearchParams(window.location.search);
    params.set('a', encodeMessagesToBase64(messages)); // Use 'a' as the tag name
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

// Function to render a single message in the chat window
function renderMessage(message) {
    const outputField = document.getElementById("chat-output");
    const partWrapper = document.createElement("div");
    partWrapper.classList.add("message-wrapper");

    if (message === "link" || message === "링크") {
        const links = [
            "https://www.youtube.com/",
            "https://kone.gg/",
            "https://arca.live/",
            "https://www.dlsite.com/index.html",
            "https://x.com/home",
            "https://asmr.one/works",
            "https://kemono.su/",
            "https://www.pixiv.net/",
            "https://www.pornhub.com/",
            "https://newtoki.me/%eb%89%b4%ed%86%a0%ed%82%a4-%ec%b5%9c%ec%8b%a0-%ec%a3%bc%ec%86%8c/",
            "https://www.base64decode.org/",
            "https://hitomi.la/"
        ];

        links.forEach(link => {
            const linkElement = document.createElement("a");
            linkElement.href = link;
            linkElement.textContent = link;
            linkElement.target = "_blank";
            linkElement.classList.add("link-button");
            partWrapper.appendChild(linkElement);
            partWrapper.appendChild(document.createElement("br"));
        });
    } else {
        const partMessage = document.createElement("div");
        partMessage.classList.add("message");
        partMessage.textContent = message;
        partWrapper.appendChild(partMessage);

        let decodedMessage = null;

        if (/^\d{7}$/.test(message)) {
            partWrapper.appendChild(createStyledLinkButton("👁️", `https://hitomi.la/galleries/${message}.html`));
        } else if (/(?:rj|RJ|거)(\d+)/i.test(message)) {
            const rjMatch = message.match(/(?:rj|RJ|거)(\d+)/i);
            if (rjMatch) {
                const rjNumber = rjMatch[1];
                renderRJThumbnail(rjNumber, partWrapper);
            }
        } else if (isValidBase64(message)) {
            try {
                const paddedStr = message.padEnd(message.length + (4 - message.length % 4) % 4, '=');
                decodedMessage = atob(paddedStr);

                const decodedMessageDiv = document.createElement("div");
                decodedMessageDiv.classList.add("decoded-message");
                decodedMessageDiv.textContent = decodedMessage;
                decodedMessageDiv.style.display = "block";
                decodedMessageDiv.style.cursor = "pointer";
                decodedMessageDiv.title = "클릭하면 복사됩니다";
                decodedMessageDiv.addEventListener("click", async function() {
                    try {
                        await navigator.clipboard.writeText(decodedMessage);
                        decodedMessageDiv.title = "복사됨!";
                        setTimeout(() => { decodedMessageDiv.title = "클릭하면 복사됩니다"; }, 1000);
                    } catch (e) {
                        decodedMessageDiv.title = "복사 실패";
                    }
                });
                partWrapper.appendChild(decodedMessageDiv);

                if (/^(https?:\/\/[^\s]+|www\.[^\s]+)$/i.test(decodedMessage)) {
                    partWrapper.appendChild(createStyledLinkButton("B64LINK", decodedMessage));
                }
            } catch (error) {}
        }
    }

    outputField.appendChild(partWrapper);
}

// Function to render all messages in the chat window
function renderAllMessages(messages) {
    const outputField = document.getElementById("chat-output");
    outputField.innerHTML = ""; // Clear existing messages
    messages.forEach(renderMessage);
    outputField.scrollTop = outputField.scrollHeight; // Scroll to bottom
}

// 입력값을 URL에 저장 (최신 메시지만)
window.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('chat-input');
    inputField.value = ''; // Clear any pre-filled value

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
        document.getElementById('chat-input').value = q;
    }

    const messages = getMessagesFromURL();
    renderAllMessages(messages);
});
document.getElementById("send-button").addEventListener("click", handleMessageSend);
document.getElementById("chat-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        handleMessageSend();
    }
});


document.addEventListener("click", function(event) {
    const inputField = document.getElementById("chat-input");

    if (!event.target.closest("#chat-input, button, .message, a, .decoded-message")) {
        inputField.focus();
    }
});

function decodeBase64Safely(str) {
    try {
        str = str.replace(/=+$/, '');
        const padding = str.length % 4;
        if (padding === 2) {
            str += '==';
        } else if (padding === 3) {
            str += '=';
        } else if (padding !== 0) {
            return null;
        }
        return atob(str);
    } catch (e) {
        return null;
    }
}

function isValidBase64(str) {
    if (!str) {
        return false;
    }

    const base64Pattern = /^[A-Za-z0-9+/]+={0,}$/;
    if (!base64Pattern.test(str)) {
        return false;
    }

    try {
        const decoded = decodeBase64Safely(str);
        if (!decoded) {
            return false;
        }

        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i);
            if (charCode < 9 || (charCode > 13 && charCode < 32)) {
                return false;
            }
        }

        return true;
    } catch (e) {
        return false;
    }
}

function handleMessageSend() {
    const inputField = document.getElementById("chat-input");
    const message = inputField.value.trim();

    if (message) {
        const messages = getMessagesFromURL();
        messages.push(message);
        setMessagesToURL(messages);
        renderMessage(message);

        const outputField = document.getElementById("chat-output");
        outputField.scrollTop = outputField.scrollHeight; // Scroll to bottom
        inputField.value = "";
    }
}

function renderRJThumbnail(rjNumber, partWrapper) {
    const numberWithoutLastThree = rjNumber.slice(0, -3);
    const incrementedNumber = (parseInt(numberWithoutLastThree, 10) + 1).toString().padStart(numberWithoutLastThree.length, '0');
    const rjPrefix = incrementedNumber + '000';

    const thumbnailUrl = `https://img.dlsite.jp/modpub/images2/work/doujin/RJ${rjPrefix}/RJ${rjNumber}_img_main.webp`;

    const imgElement = document.createElement("img");
    imgElement.src = thumbnailUrl;
    imgElement.alt = `존재하지 않습니다.`;
    imgElement.classList.add("rj-thumbnail");
    partWrapper.appendChild(imgElement);

    const rjLinkButtonGroup = document.createElement("div");
    rjLinkButtonGroup.classList.add("button-container");
    rjLinkButtonGroup.appendChild(createStyledLinkButton("🏬", `https://www.dlsite.com/maniax/work/=/product_id/RJ${rjNumber}.html`));
    rjLinkButtonGroup.appendChild(createStyledLinkButton("👂", `https://asmr.one/works?keyword=rj${rjNumber}`));
    rjLinkButtonGroup.appendChild(createStyledLinkButton("👃", `https://kone.gg/search?k=rj${rjNumber}`));
    partWrapper.appendChild(rjLinkButtonGroup);
}

function createStyledLinkButton(label, url) {
    const linkButton = document.createElement("a");
    linkButton.href = url;
    linkButton.textContent = label;
    linkButton.target = "_blank";
    linkButton.classList.add("link-button");
    return linkButton;
}

// Function to clear all messages
function clearMessages() {
    setMessagesToURL([]); // Clear messages in the URL
    renderAllMessages([]); // Clear messages in the chat window
}

// Add event listener for the clear button
window.addEventListener('DOMContentLoaded', () => {
    const clearButton = document.getElementById('clear-button');
    if (clearButton) {
        clearButton.addEventListener('click', clearMessages);
    }
});
