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
        // Base64 디코딩
        const decoded = atob(str);

        // 디코딩된 메시지가 정상적인 텍스트인지 확인
        // 예: ASCII 범위 안에 있는지 체크
        for (let i = 0; i < decoded.length; i++) {
            if (decoded.charCodeAt(i) < 32 || decoded.charCodeAt(i) > 126) {
                // 제어 문자나 비정상적인 문자가 포함되면 유효한 메시지가 아님
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

        // 원본 메시지 출력
        const messageElement = document.createElement("div");
        messageElement.classList.add("message"); // 클릭 시 자동 포커싱 방지
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

                toggleButton.style.marginTop = "-5px";
                toggleButton.style.marginRight = "10px"; // 버튼 간격 추가
                toggleButton.style.marginBottom = "10px"; // 버튼 간격 추가
                toggleButton.style.padding = "8px 12px";
                toggleButton.style.backgroundColor = "#83e079";
                toggleButton.style.color = "white";
                toggleButton.style.cursor = "pointer";
                toggleButton.style.border = "none";
                toggleButton.style.borderRadius = "4px";
                toggleButton.style.textDecoration = "none";
                toggleButton.style.fontSize = "14px";
                toggleButton.style.transition = "background-color 0.2s ease";

                // 디코딩된 메시지 (초기에는 숨김)
                const decodedElement = document.createElement("div");
                decodedElement.classList.add("message"); // 클릭 시 자동 포커싱 방지
                decodedElement.textContent = decodedMessage;
                decodedElement.style.padding = "10px";
                decodedElement.style.backgroundColor = "#e1eddf";
                decodedElement.style.borderRadius = "4px";
                decodedElement.style.marginTop = "-10px";
                decodedElement.style.marginBottom = "10px";
                decodedElement.style.display = "none"; // 처음엔 숨김 처리

                // 버튼 클릭 시 토글
                toggleButton.addEventListener("click", () => {
                    if (decodedElement.style.display === "none") {
                        decodedElement.style.display = "block";
                        toggleButton.style.backgroundColor = "#919191";
                        toggleButton.textContent = "🔒";
                    } else {
                        decodedElement.style.display = "none";
                        toggleButton.style.backgroundColor = "#60cc54";
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
            displayRJThumbnail(rjNumber, messageWrapper);
            // RJ 썸네일 이미지를 생성하여 메시지에 추가
        }

        outputField.appendChild(messageWrapper);
        outputField.scrollTop = outputField.scrollHeight;
        inputField.value = "";
    }
}

// RJ 썸네일 이미지를 출력하는 함수
function displayRJThumbnail(rjNumber, messageWrapper) {
    const rjBaseNumber = rjNumber; // RJ 번호에서 숫자만 추출

    const numberWithoutLastThree = rjBaseNumber.slice(0, -3); // 마지막 3자리 제거
    const incrementedNumber = (parseInt(numberWithoutLastThree, 10) + 1).toString().padStart(numberWithoutLastThree.length, '0');

    // 결과적으로 새로운 rjPrefix 생성
    const rjPrefix = incrementedNumber + '000';

    // 썸네일 이미지 URL 생성
    const thumbnailUrl = `https://img.dlsite.jp/modpub/images2/work/doujin/RJ${rjPrefix}/RJ${rjBaseNumber}_img_main.webp`;

    // console.log(thumbnailUrl);
    // 이미지를 표시할 HTML 요소 생성
    const imgElement = document.createElement("img");
    imgElement.src = thumbnailUrl;
    imgElement.alt = `RJ${rjBaseNumber} Thumbnail을 불러 올 수 없습니다.`;
    imgElement.style.maxWidth = "200px"; // 썸네일 크기 조정
    imgElement.style.marginTop = "0px";
    imgElement.style.marginBottom = "10px";

    // 이미지가 정상적으로 로드되지 않으면 오류 메시지를 출력
    // imgElement.onerror = function() {
    //     const errorMsg = document.createElement("div");
    //     errorMsg.textContent = "썸네일을 불러올 수 없습니다.";
    //     errorMsg.style.color = "red";
    //     messageWrapper.appendChild(errorMsg);
    // };

    // 썸네일 이미지를 출력할 메시지에 추가
    messageWrapper.appendChild(imgElement);

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "block"; // 버튼들을 세로로 배치하도록 설정

    // 링크 버튼들을 세로로 배치할 div 안에 추가
    buttonContainer.appendChild(createLinkButton("🧺", `https://www.dlsite.com/maniax/work/=/product_id/RJ${rjBaseNumber}.html`));
    buttonContainer.appendChild(createLinkButton("👂", `https://asmr.one/works?keyword=rj${rjBaseNumber}`));
    buttonContainer.appendChild(createLinkButton("🌑", `https://arca.live/b/simya?target=all&keyword=rj${rjBaseNumber}`));

    messageWrapper.appendChild(buttonContainer); // 메시지에 버튼들 추가
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