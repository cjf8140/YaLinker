document.getElementById("send-button").addEventListener("click", handleMessageSend);
document.getElementById("chat-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        handleMessageSend();
    }
});

document.getElementById("paste-clipboard-button").addEventListener("click", async function() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            document.getElementById("chat-input").value = text;
        }
    } catch (e) {
        alert("클립보드 접근이 허용되지 않았습니다. 브라우저 권한을 확인하세요.");
    }
});

document.addEventListener("click", function(event) {
    const inputField = document.getElementById("chat-input");

    if (!event.target.closest("#chat-input, button, .message, a")) {
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
    const outputField = document.getElementById("chat-output");

    const message = inputField.value.trim();
    if (message) {
        const parts = message.split(/\s+/);

        parts.forEach(part => {
            const partWrapper = document.createElement("div");
            partWrapper.classList.add("message-wrapper");

            const partMessage = document.createElement("div");
            partMessage.classList.add("message");
            partMessage.textContent = part;
            partWrapper.appendChild(partMessage);

            let decodedMessage = null;

            if (/^\d{7}$/.test(part)) {
                partWrapper.appendChild(createStyledLinkButton("👁️", `https://hitomi.la/galleries/${part}.html`));
            } else if (/(?:rj|RJ|거)(\d{6,7})/i.test(part)) {
                const rjMatch = part.match(/(?:rj|RJ|거)(\d{6,7})/i);
                if (rjMatch) {
                    const rjNumber = rjMatch[1];
                    renderRJThumbnail(rjNumber, partWrapper);
                }
            } else if (isValidBase64(part)) {
                try {
                    const paddedStr = part.padEnd(part.length + (4 - part.length % 4) % 4, '=');
                    decodedMessage = atob(paddedStr);

                    const toggleDecodedButton = document.createElement("button");
                    toggleDecodedButton.textContent = "🔓";
                    toggleDecodedButton.classList.add("toggle-button");

                    const decodedMessageDiv = document.createElement("div");
                    decodedMessageDiv.classList.add("decoded-message");
                    decodedMessageDiv.textContent = decodedMessage;

                    toggleDecodedButton.addEventListener("click", () => {
                        if (decodedMessageDiv.style.display === "none") {
                            decodedMessageDiv.style.display = "block";
                            toggleDecodedButton.textContent = "🔒";
                        } else {
                            decodedMessageDiv.style.display = "none";
                            toggleDecodedButton.textContent = "🔓";
                        }
                    });

                    partWrapper.appendChild(toggleDecodedButton);
                    partWrapper.appendChild(decodedMessageDiv);

                    if (/^(https?:\/\/[^\s]+)$/i.test(decodedMessage)) {
                        partWrapper.appendChild(createStyledLinkButton("B64LINK", decodedMessage));
                    }
                } catch (error) {}
            }

            outputField.appendChild(partWrapper);
        });

        outputField.scrollTop = outputField.scrollHeight;
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
    rjLinkButtonGroup.appendChild(createStyledLinkButton("🌑", `https://arca.live/b/simya?target=all&keyword=rj${rjNumber}`));
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