document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("chat-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

document.addEventListener("click", function(event) {
    const inputField = document.getElementById("chat-input");

    // 클릭한 요소가 입력창, 버튼, 메시지, 링크가 아니라면 입력창으로 포커스 이동
    if (!event.target.closest("#chat-input, button, .message, a")) {
        inputField.focus();
    }
});

function isBase64(str) {
    if (!str || str.length % 4 !== 0) {
        return false;
    }
    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
    if (!base64Pattern.test(str)) {
        return false;
    }
    try {
        return btoa(atob(str)) === str;
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

        // 원본 메시지 출력
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        messageElement.style.marginBottom = "10px";
        messageElement.style.padding = "10px";
        messageElement.style.backgroundColor = "#eeeeee";
        messageElement.style.borderRadius = "4px";
        messageWrapper.appendChild(messageElement);

        let decodedMessage = null;
        if (isBase64(message)) {
            try {
                decodedMessage = atob(message);

                // 🔓 버튼 (토글 버튼)
                const toggleButton = document.createElement("button");
                toggleButton.textContent = "🔓";
                toggleButton.style.marginBottom = "5px";
                toggleButton.style.padding = "8px 12px";
                toggleButton.style.backgroundColor = "#4baef3";
                toggleButton.style.color = "white";
                toggleButton.style.border = "none";
                toggleButton.style.borderRadius = "4px";
                toggleButton.style.cursor = "pointer";
                toggleButton.style.transition = "background-color 0.2s ease";

                // 디코딩된 메시지 (초기에는 숨김)
                const decodedElement = document.createElement("div");
                decodedElement.textContent = decodedMessage;
                decodedElement.style.padding = "10px";
                decodedElement.style.backgroundColor = "#dfffe0";
                decodedElement.style.borderRadius = "4px";
                decodedElement.style.marginBottom = "5px";
                decodedElement.style.display = "none"; // 처음엔 숨김 처리

                // 버튼 클릭 시 토글
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

                // 디코딩된 메시지가 URL인지 확인
                if (/^(https?:\/\/[^\s]+)$/i.test(decodedMessage)) {
                    messageWrapper.appendChild(createLinkButton("B64LINK", decodedMessage));
                }
            } catch (error) {}
        }

        const targetMessage = decodedMessage || message;

        // Hitomi 링크 감지
        if (/^\d{7}$/.test(targetMessage)) {
            messageWrapper.appendChild(createLinkButton("👁️", `https://hitomi.la/reader/${targetMessage}.html#1`));
        }

        // rj숫자 패턴 감지
        const match = targetMessage.match(/rj(\d+)/i);
        if (match) {
            const rjNumber = match[1];
            messageWrapper.appendChild(createLinkButton("🧺", `https://www.dlsite.com/maniax/work/=/product_id/RJ${rjNumber}.html`));
            messageWrapper.appendChild(createLinkButton("👂", `https://asmr.one/works?keyword=rj${rjNumber}`));
            messageWrapper.appendChild(createLinkButton("🌑", `https://arca.live/b/simya?target=all&keyword=rj${rjNumber}`));
        }

        outputField.appendChild(messageWrapper);
        outputField.scrollTop = outputField.scrollHeight;
        inputField.value = "";
    }
}



// 링크 버튼 생성 함수
function createLinkButton(label, url) {
    const linkButton = document.createElement("a");
    linkButton.href = url;
    linkButton.textContent = label;
    linkButton.target = "_blank"; // 새 탭에서 열기
    linkButton.style.display = "inline-block";
    linkButton.style.marginTop = "-5px";
    linkButton.style.marginRight = "10px"; // 버튼 간격 추가
    linkButton.style.marginBottom = "10px"; // 버튼 간격 추가
    linkButton.style.padding = "8px 12px";
    linkButton.style.backgroundColor = "#333333";
    linkButton.style.color = "white";
    linkButton.style.borderRadius = "4px";
    linkButton.style.textDecoration = "none";
    linkButton.style.fontSize = "14px";
    linkButton.style.transition = "background-color 0.2s ease";

    // 호버 효과
    linkButton.addEventListener("mouseover", () => {
        linkButton.style.backgroundColor = "#4baef3";
    });
    linkButton.addEventListener("mouseout", () => {
        linkButton.style.backgroundColor = "#333333";
    });

    return linkButton;
}