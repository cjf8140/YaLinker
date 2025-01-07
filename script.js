document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("chat-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

function sendMessage() {
    const inputField = document.getElementById("chat-input");
    const outputField = document.getElementById("chat-output");

    const message = inputField.value.trim();
    if (message) {
        // 메시지 요소 생성
        const messageElement = document.createElement("div");
        messageElement.textContent = message;
        messageElement.style.marginBottom = "10px";
        messageElement.style.padding = "10px";
        messageElement.style.backgroundColor = "#eeeeee";
        messageElement.style.borderRadius = "4px";
        outputField.appendChild(messageElement);

        try {
            // Base64 디코딩
            const decodedMessage = atob(message);

            // 디코딩된 메시지 출력
            // const decodedElement = document.createElement("div");
            // decodedElement.textContent = `B64 Decoded: ${decodedMessage}`;
            // decodedElement.style.marginBottom = "10px";
            // decodedElement.style.padding = "10px";
            // decodedElement.style.backgroundColor = "#dfffe0";
            // decodedElement.style.borderRadius = "4px";
            // outputField.appendChild(decodedElement);

            // 디코딩된 메시지가 URL 형태인지 확인
            const urlPattern = /^(https?:\/\/[^\s]+)$/i;
            if (urlPattern.test(decodedMessage)) {
                const linkButton = createLinkButton("B64LINK", decodedMessage);
                outputField.appendChild(linkButton);
            }
        } catch (error) {}

        const sevenDigitPattern = /^\d{7}$/;
        if (sevenDigitPattern.test(message)) {
            const hitomiLink = `https://hitomi.la/reader/${message}.html#1`;
            const hitomiButton = createLinkButton("👁️", hitomiLink);
            outputField.appendChild(hitomiButton);
        }

        // 특정 패턴(rj 뒤에 숫자)을 감지
        const pattern = /rj(\d+)/i; // rj 뒤에 숫자가 오는 패턴 (대소문자 구분 없음)
        const match = message.match(pattern);
        if (match) {
            const rjNumber = match[1]; // 패턴에서 숫자 부분 추출

            // DLsite 링크 버튼 생성
            const dlsiteLinkUrl = `https://www.dlsite.com/maniax/work/=/product_id/RJ${rjNumber}.html`;
            const dlsiteLinkButton = createLinkButton("🧺", dlsiteLinkUrl);

            // ASMR.one 링크 버튼 생성
            const asmrLinkUrl = `https://asmr.one/works?keyword=rj${rjNumber}`;
            const asmrLinkButton = createLinkButton("👂", asmrLinkUrl);


            const simyaLinkUrl = `https://arca.live/b/simya?target=all&keyword=rj${rjNumber}`;
            const simyaLinkButton = createLinkButton("🌑", simyaLinkUrl);

            // 링크 버튼을 메시지 아래에 추가
            outputField.appendChild(dlsiteLinkButton);
            outputField.appendChild(asmrLinkButton);
            outputField.appendChild(simyaLinkButton);
        }

        // 스크롤을 아래로 이동
        outputField.scrollTop = outputField.scrollHeight;

        // 입력 필드 비우기
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