document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("chat-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

document.addEventListener("click", function(event) {
    const inputField = document.getElementById("chat-input");

    if (!event.target.closest("#chat-input, button, .message, a")) {
        inputField.focus();
    }
});

function safeBase64Decode(str) {
    try {
        // 끝에 '=' 여러 개 붙어 있으면 전부 제거하고,
        // 다시 필요하면 적절하게 채워 넣기
        str = str.replace(/=+$/, ''); // 끝의 = 전부 제거
        const padding = str.length % 4;
        if (padding === 2) {
            str += '==';
        } else if (padding === 3) {
            str += '=';
        } else if (padding !== 0) {
            // 1일 경우 복구 불가 (잘못된 base64)
            return null;
        }
        return atob(str);
    } catch (e) {
        return null;
    }
}
// 개선된 Base64 체크 함수
function isBase64(str) {
    if (!str) {
        return false;
    }

    const base64Pattern = /^[A-Za-z0-9+/]+={0,}$/;
    if (!base64Pattern.test(str)) {
        return false;
    }

    try {
        // 끝에 = 여러 개 있으면 무시하고 디코딩 시도
        const decoded = safeBase64Decode(str);
        if (!decoded) {
            return false;
        }

        // 디코딩된 결과가 ASCII 범위인지 검사
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


function sendMessage() {
    const inputField = document.getElementById("chat-input");
    const outputField = document.getElementById("chat-output");

    const message = inputField.value.trim();
    if (message) {
        const messageWrapper = document.createElement("div");
        messageWrapper.style.marginBottom = "10px";

        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.textContent = message;
        messageElement.style.marginBottom = "10px";
        messageElement.style.padding = "10px";
        messageElement.style.backgroundColor = "#eeeeee";
        messageElement.style.borderRadius = "4px";
        messageWrapper.appendChild(messageElement);

        let decodedMessage = null;
        if (isBase64(message)) {
            try {
                const paddedStr = message.padEnd(message.length + (4 - message.length % 4) % 4, '=');
                decodedMessage = atob(paddedStr);

                const toggleButton = document.createElement("button");
                toggleButton.textContent = "🔓";
                toggleButton.classList.add("toggle-button");

                const decodedElement = document.createElement("div");
                decodedElement.classList.add("message");
                decodedElement.textContent = decodedMessage;
                decodedElement.style.padding = "10px";
                decodedElement.style.backgroundColor = "#e1eddf";
                decodedElement.style.borderRadius = "4px";
                decodedElement.style.marginTop = "-10px";
                decodedElement.style.marginBottom = "10px";
                decodedElement.style.display = "none";

                toggleButton.addEventListener("click", () => {
                    if (decodedElement.style.display === "none") {
                        decodedElement.style.display = "block";
                        toggleButton.textContent = "🔒";
                    } else {
                        decodedElement.style.display = "none";
                        toggleButton.textContent = "🔓";
                    }
                });

                messageWrapper.appendChild(toggleButton);
                messageWrapper.appendChild(decodedElement);

                // 디코딩된 결과가 URL이면 링크 버튼 생성
                if (/^(https?:\/\/[^\s]+)$/i.test(decodedMessage)) {
                    messageWrapper.appendChild(createLinkButton("B64LINK", decodedMessage));
                }
            } catch (error) {}
        }

        const targetMessage = decodedMessage || message;

        // 7자리 숫자면 Hitomi 링크 추가
        if (/^\d{7}$/.test(targetMessage)) {
            messageWrapper.appendChild(createLinkButton("👁️", `https://hitomi.la/reader/${targetMessage}.html#1`));
        }

        // 개선된 RJ 감지 (rj, RJ, 대소문자 구분 없이)
        const rjMatch = targetMessage.match(/(?:rj|RJ|거)(\d{6,7})/i);
        if (rjMatch) {
            const rjNumber = rjMatch[1];
            displayRJThumbnail(rjNumber, messageWrapper);
        }

        outputField.appendChild(messageWrapper);
        outputField.scrollTop = outputField.scrollHeight;
        inputField.value = "";
    }
}

function displayRJThumbnail(rjNumber, messageWrapper) {
    const numberWithoutLastThree = rjNumber.slice(0, -3);
    const incrementedNumber = (parseInt(numberWithoutLastThree, 10) + 1).toString().padStart(numberWithoutLastThree.length, '0');
    const rjPrefix = incrementedNumber + '000';

    const thumbnailUrl = `https://img.dlsite.jp/modpub/images2/work/doujin/RJ${rjPrefix}/RJ${rjNumber}_img_main.webp`;

    const imgElement = document.createElement("img");
    imgElement.src = thumbnailUrl;
    imgElement.alt = `RJ${rjNumber} Thumbnail`;
    imgElement.style.maxWidth = "200px";
    imgElement.style.marginTop = "0px";
    imgElement.style.marginBottom = "10px";

    messageWrapper.appendChild(imgElement);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex"; // flex 정렬
    buttonContainer.style.flexWrap = "wrap"; // 줄바꿈 허용
    buttonContainer.style.gap = "8px"; // 버튼 간격

    buttonContainer.appendChild(createLinkButton("🧺", `https://www.dlsite.com/maniax/work/=/product_id/RJ${rjNumber}.html`));
    buttonContainer.appendChild(createLinkButton("👂", `https://asmr.one/works?keyword=rj${rjNumber}`));
    buttonContainer.appendChild(createLinkButton("🌑", `https://arca.live/b/simya?target=all&keyword=rj${rjNumber}`));

    messageWrapper.appendChild(buttonContainer);
}

function createLinkButton(label, url) {
    const linkButton = document.createElement("a");
    linkButton.href = url;
    linkButton.textContent = label;
    linkButton.target = "_blank";
    linkButton.style.display = "inline-block";
    linkButton.style.padding = "8px 12px";
    linkButton.style.backgroundColor = "#333333";
    linkButton.style.color = "white";
    linkButton.style.borderRadius = "4px";
    linkButton.style.textDecoration = "none";
    linkButton.style.fontSize = "14px";
    linkButton.style.transition = "background-color 0.2s ease";

    linkButton.addEventListener("mouseover", () => {
        linkButton.style.backgroundColor = "#4baef3";
    });
    linkButton.addEventListener("mouseout", () => {
        linkButton.style.backgroundColor = "#333333";
    });

    return linkButton;
}