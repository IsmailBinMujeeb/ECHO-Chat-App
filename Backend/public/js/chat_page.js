const emojiBtn = document.getElementById("emojiBtn");
const emojis = document.getElementById("emojis");

const chatCards = document.getElementById("chats");

chatCards.innerHTML = chatCards.innerHTML.replaceAll(":devil:", "<img src='https://cdn3.emoji.gg/emojis/2530-angeldevil.gif' width=25px height=25px/>");
chatCards.scrollTop = chatCards.scrollHeight;

chatCards.addEventListener("scroll", () => {
    const panel = document.getElementById("panel");

    panel.style.opacity = 0;
    panel.style.scale = 0;
})

emojis.addEventListener("mouseenter", () => {
    const choice = ["smile", "tired", "meh", "smile-wink", "surprise", "sad-cry", "laugh", "kiss", "angry", "dizzy", "flushed", "frown", "frown-open"];

    emojis.classList = `fa-solid fa-face-${choice[Math.floor(Math.random() * choice.length)]}`
})

emojis.addEventListener("mouseleave", () => {
    const choice = ["smile", "tired", "meh", "smile-wink", "surprise", "sad-cry", "laugh", "kiss", "angry", "dizzy", "flushed", "frown", "frown-open"];

    emojis.classList = `fa-solid fa-face-${choice[Math.floor(Math.random() * choice.length)]}`
})

function goToProfile(userhandle) {
    location.href = `/chat/${userhandle}`
}

function scrollToMessage(messageId) {

    let message = document.getElementById(messageId);

    if (message) {
        message.scrollIntoView({ behavior: "smooth", block: "center" });
        message.style.transform = "translateX(-10px)";

        setTimeout(() => {
            message.style.transform = "translateX(0px)";
        }, 700)
    }
}

const sendMessageInput = document.getElementById('sendMessageInput');

function togglePanel(messageId = false) {
    const panel = document.getElementById("panel");

    if (panel.style.opacity == 0) {
        panel.style.opacity = 1;
        panel.style.scale = 1;
        panel.dataset.id = messageId
    } else {
        panel.style.opacity = 0;
        panel.style.scale = 0;
        panel.dataset.id = ''
    }
}

sendMessageInput.addEventListener('keypress', (e) => {

    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById('sendBtn').click();
    }
})

function selectReply(messageId) {

    const replyWrapper = document.getElementById("reply-wrapper");

    replyWrapper.style.opacity = 1;
    replyWrapper.style.pointerEvents = "all"

    replyWrapper.dataset.id = messageId;

}

function unselectReply() {
    const replyWrapper = document.getElementById("reply-wrapper");

    replyWrapper.style.opacity = 0;
    replyWrapper.style.pointerEvents = "none";

    replyWrapper.dataset.id = "";
}

function showVoiceCallModal(isPhoneDisply = false) {
    document.getElementById("voiceCallWrapper").style.transform = "translateY(0px)";
    document.getElementById("voiceCallWrapper").style.scale = 1;
    if (isPhoneDisply) document.getElementById("acceptCall").style.display = "block";
}

function hideVoiceCallModal() {
    document.getElementById("voiceCallWrapper").style.transform = "translateY(-100px)";
    document.getElementById("voiceCallWrapper").style.scale = 0;
    document.getElementById("acceptCall").style.display = "none";
}

// Messages Loader

function hexToBuffer(hex) {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return bytes.buffer;
}

function pemToCryptoPrivateKey(pem) {

    const pemBuffer = hexToBuffer(pem);

    const base64 = window.btoa(String.fromCharCode(...new Uint8Array(pemBuffer)));

    const decoder = new TextDecoder();

    console.log(decoder.decode(base64))
    const pemBody = pem
        .replace(/-----BEGIN Private Key-----/, '')
        .replace(/-----END Private Key-----/, '')
        .replace(/\s/g, '');
    const binaryDer = atob(pemBody);

    const binaryDerArray = new Uint8Array(binaryDer.length);

    for (let i = 0; i < binaryDer.length; i++) {
        binaryDerArray[i] = binaryDer.charCodeAt(i);
    }

    return crypto.subtle.importKey(
        'pkcs8',
        binaryDerArray.buffer,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        true,
        ['decrypt']
    );
}

async function decryptDataWithPrivateKey(encryptedBase64, privateKey) {
    const encryptedArrayBuffer = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0)).buffer;

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'RSA-OAEP',
        },
        privateKey,
        encryptedArrayBuffer
    );

    return new TextDecoder().decode(decrypted);
}

async function fetchMessages(chatId, nextPage, userhandle) {


    const chatContainer = document.getElementById("chats")

    // Record current scrollHeight
    const previousScrollHeight = chatContainer.scrollHeight;

    // Simulate fetching old messages (replace this with your API call)
    const response = await fetch(`/api/v1/messages/${chatId}?page=${nextPage}&limit=25`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })

    const data = await response.json();

    if (data.statusCode != '200') return;
    
    const oldMessages = data?.data?.docs;

    // Prepend old messages
    for (let msg of oldMessages) {

        const chatCard = document.createElement("div");

        chatCard.className = userhandle == msg.sender?.userhandle ? "chat-card right" : "chat-card left";
        const encryptedMessage = userhandle == msg.sender?.userhandle ? msg.senderEncryptedMessage : msg.receiverEncryptedMessage;
        chatCard.id = msg._id;

        const privateKeyPEM = localStorage.getItem("PRIVATE_KEY");
        const privateKey = await pemToCryptoPrivateKey(privateKeyPEM);
        const decryptedMessage = await decryptDataWithPrivateKey(encryptedMessage, privateKey);

        const options = document.createElement("div");
        options.className = "options";

        const emojiButton = document.createElement("button");
        emojiButton.onclick = () => togglePanel(msg._id);
        emojiButton.innerHTML = '<i class="fa-solid fa-face-smile" id="emoji-btn"></i>';
        options.appendChild(emojiButton);

        const replyButton = document.createElement("button");
        replyButton.onclick = () => selectReply(msg._id);
        replyButton.innerHTML = '<i class="fa-solid fa-reply"></i>';
        options.appendChild(replyButton);

        const ellipsisButton = document.createElement("button");
        ellipsisButton.innerHTML = '<i class="fa-solid fa-ellipsis"></i>';
        options.appendChild(ellipsisButton);

        chatCard.appendChild(options);

        if (msg.replyTo) {
            const replyPera = document.createElement("p");
            replyPera.className = "reply-pera";
            replyPera.onclick = () => scrollToMessage(msg.replyTo?._id);
            replyPera.textContent = msg.replyTo?.content;
            chatCard.appendChild(replyPera);
        }

        const contentWrapper = document.createElement("div");
        contentWrapper.className = "content-wrapper";

        const textTime = document.createElement("div");
        textTime.className = "text-time";

        const messageContent = document.createElement("p");
        messageContent.textContent = encryptedMessage;
        textTime.appendChild(messageContent);

        const timeSpan = document.createElement("span");
        const createdAt = new Date(msg.createdAt);
        timeSpan.textContent = `${createdAt.getHours()}:${createdAt.getMinutes()}`;
        textTime.appendChild(timeSpan);

        contentWrapper.appendChild(textTime);

        const reactions = document.createElement("div");
        reactions.className = "reactions";

        for (let key in msg.reactionsCount) {
            const reaction = document.createElement("div");
            reaction.className = `reaction ${key}`;

            const reactionImg = document.createElement("img");
            reactionImg.src = `/assets/emojis/face/${key}.png`;
            reactionImg.alt = key;
            reactionImg.width = 24;
            reactionImg.height = 24;
            reaction.appendChild(reactionImg);

            const reactionCount = document.createElement("span");
            reactionCount.textContent = msg.reactionsCount[key];
            reaction.appendChild(reactionCount);

            reactions.appendChild(reaction);
        }

        contentWrapper.appendChild(reactions);
        chatCard.appendChild(contentWrapper);

        chatContainer.prepend(chatCard);
    }

    const newScrollHeight = chatContainer.scrollHeight;
    chatContainer.scrollTop = newScrollHeight - previousScrollHeight;
}

const loadMessages = async () => {

    const chatContainer = document.getElementById("chats");

    if (chatContainer.scrollTop === 0) {

        const chat = document.getElementById("receiverWrapper");

        const chatId = chat.dataset.chatid;
        const userhandle = chat.dataset.userhandle;
        const page = parseInt(chat?.dataset?.page) || 1;

        await fetchMessages(chatId, page, userhandle);

        chat.dataset.page = parseInt(page) + 1;
    }
}

loadMessages();

document.getElementById("chats")?.addEventListener("scroll", loadMessages)
