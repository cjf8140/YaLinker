document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("chat-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
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
        const parts = message.split(/\s+/); // 띄어쓰기를 기준으로 메시지 나누기

        parts.forEach(part => {
            const messageWrapper = document.createElement("div");
            messageWrapper.classList.add("message-wrapper");

            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.textContent = part;
            messageWrapper.appendChild(messageElement);

            let decodedMessage = null;

            // 7자리 숫자면 Hitomi 링크 추가
            if (/^\d{7}$/.test(part)) {
                messageWrapper.appendChild(createLinkButton("👁️", `https://hitomi.la/galleries/${part}.html`));
            }
            // 개선된 RJ 감지 (rj, RJ, 대소문자 구분 없이)
            else if (/(?:rj|RJ|거)(\d{6,7})/i.test(part)) {
                const rjMatch = part.match(/(?:rj|RJ|거)(\d{6,7})/i);
                if (rjMatch) {
                    const rjNumber = rjMatch[1];
                    displayRJThumbnail(rjNumber, messageWrapper);
                }
            }
            // Base64 처리
            else if (isBase64(part)) {
                try {
                    const paddedStr = part.padEnd(part.length + (4 - part.length % 4) % 4, '=');
                    decodedMessage = atob(paddedStr);

                    const toggleButton = document.createElement("button");
                    toggleButton.textContent = "🔓";
                    toggleButton.classList.add("toggle-button");

                    const decodedElement = document.createElement("div");
                    decodedElement.classList.add("decoded-message");
                    decodedElement.textContent = decodedMessage;

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

            outputField.appendChild(messageWrapper);
        });

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
    imgElement.alt = `존재하지 않습니다.`;
    imgElement.classList.add("rj-thumbnail");
    messageWrapper.appendChild(imgElement);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(createLinkButton("🏬", `https://www.dlsite.com/maniax/work/=/product_id/RJ${rjNumber}.html`));
    buttonContainer.appendChild(createLinkButton("👂", `https://asmr.one/works?keyword=rj${rjNumber}`));
    buttonContainer.appendChild(createLinkButton("🌑", `https://arca.live/b/simya?target=all&keyword=rj${rjNumber}`));
    messageWrapper.appendChild(buttonContainer);
}

function createLinkButton(label, url) {
    const linkButton = document.createElement("a");
    linkButton.href = url;
    linkButton.textContent = label;
    linkButton.target = "_blank";
    linkButton.classList.add("link-button");
    return linkButton;
}