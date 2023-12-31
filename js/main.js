const SETTINGS = {
    nickname: 'hacker_' + window.getRandomInt(1, 99),
    soundMuted: false,
    sfxInitialized: false,
    firstMessageSent: false,

    currentMood: localStorage.getItem('WgHack.CurrentMood') || Object.keys(window.ai.moodOptions)[0],
};
const ELEMENTS = {
    app: document.getElementById('app'),
    wrapper: document.getElementById('wrapper'),
    chatbar: document.getElementById('chatbar'),
    messageInput: document.getElementById('message-input'),
    messageClear: document.getElementById('message-clear'),
    sendMessageButton: document.getElementById('send-message'),
    messagesContainer: document.getElementById('messages'),
    typingIndicator: document.getElementById('typing-indicator'),
    introMessage: document.getElementById('intro'),
    avatar: document.getElementById('avatar'),
    avatarOuter: document.getElementById('avatar-outer'),
    loadingBackground: document.getElementById('loading'),
    loadingText: document.getElementById('loading-text'),
    nickname: document.getElementById('nickname'),
    premium: document.getElementById('premium'),
    gold: document.getElementById('gold'),
    goldNotifications: document.getElementById('gold-notifications'),
};
const SFX = {
    bg: new Audio("./audio/bg.mp3"),
    hover: new Audio("./audio/hover.mp3"),
    item: new Audio("./audio/item.mp3"),
    nav: new Audio("./audio/nav.mp3"),
    back: new Audio("./audio/back.mp3"),
    switch: new Audio("./audio/switch.mp3"),
    error: new Audio("./audio/error.mp3"),
    click: new Audio("./audio/click.mp3"),
    select: new Audio("./audio/select.mp3"),
};

window.SETTINGS = SETTINGS;

//#region Message Input

ELEMENTS.messageInput.addEventListener("input", function (e) {
    ELEMENTS.messageInput.classList.toggle("has-text", ELEMENTS.messageInput.value.length > 0);
    ELEMENTS.messageClear.classList.toggle("show", ELEMENTS.messageInput.value.length > 0);
});
ELEMENTS.messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        ELEMENTS.sendMessageButton.click();
    }
});
ELEMENTS.messageClear.addEventListener("click", () => {
    ELEMENTS.messageInput.value = "";
    ELEMENTS.messageInput.dispatchEvent(new Event("input"));
    ELEMENTS.messageInput.focus();
    SFX.click.playNow();
});
ELEMENTS.sendMessageButton.addEventListener('click', () => {
    if (window.ChatBar.loading) {
      return;
    }
    if(ELEMENTS.messageInput.value) {
        if(!SETTINGS.firstMessageSent) {
            SETTINGS.firstMessageSent = true;
            ELEMENTS.introMessage.remove();
            ELEMENTS.avatarOuter.classList.remove('hide');
        }
        
        window.ai.setMood(SETTINGS.currentMood);
        window.ChatBar.sendMessage(ELEMENTS.messageInput.value);
        
        ELEMENTS.messageInput.value = "";
        ELEMENTS.messageInput.dispatchEvent(new Event("input"));
    }
});

//#endregion

//#region Init

ELEMENTS.nickname.textContent = SETTINGS.nickname;

ELEMENTS.avatar.setAttribute('data-type', SETTINGS.currentMood);
ELEMENTS.avatarOuter.setAttribute('data-type', SETTINGS.currentMood);

for (const key in SFX) {
    const x = SFX[key];
    x.playNow = () => {
        if (SETTINGS.soundMuted) return;
        if (!SETTINGS.sfxInitialized) return;
        x.pause();
        x.currentTime = 0;
        x.play();
    };
    x.volume = 0.3;
}
SFX.bg.loop = true;
SFX.bg.volume = 0.05;
SFX.click.volume = 0.6;
SFX.select.volume = 0.6;
SFX.bg.play();

document.addEventListener('click', () => {
    SETTINGS.sfxInitialized = true;
    if (SFX.bg.paused || !SFX.bg.currentTime) {
        SFX.bg.play();
    }
});
[...document.getElementsByClassName('hand')].forEach(element => {
    element.addEventListener('mouseenter', () => {
        SFX.hover.playNow();
    });
});
window.addEventListener("contextmenu", (e) => {
    if (!e.shiftKey) e.preventDefault();
});
window.addEventListener('keydown', e => {
    if(e.key == '`' || e.key == 'ё') {
        ELEMENTS.app.classList.toggle('zoom');
    }
});

window.addEventListener('resize', handleResize);
handleResize();

function handleResize() {
    const width = window.innerWidth;
    const ratio = width / 1920.0;
    ELEMENTS.wrapper.style.transform = `translateY(50vh) scale(${Math.min(ratio, 1)}) translateY(-50%)`;
}

//#endregion

//#region Functions

function openClose(sound) {
    if (sound) {
        if (ELEMENTS.chatbar.classList.contains('hide')) {
            SFX.nav.playNow();
            setTimeout(() => {
                ELEMENTS.messageInput.focus();
            }, 10);
        } else {
            SFX.back.playNow();
        }
    }
    ELEMENTS.chatbar.classList.toggle('hide');
}
function changeMood(sound) {
    if (sound) {
        SFX.switch.playNow();
    }
    const moodOptions = Object.keys(window.ai.moodOptions);
    const index = moodOptions.indexOf(SETTINGS.currentMood);
    if(index === moodOptions.length - 1) {
        SETTINGS.currentMood = moodOptions[0];
    } else {
        SETTINGS.currentMood = moodOptions[index + 1];
    }
    const avatar = SETTINGS.firstMessageSent ? ELEMENTS.avatarOuter : ELEMENTS.avatar;
    avatar.classList.add('hide');
    setTimeout(() => {
        ELEMENTS.avatar.setAttribute('data-type', SETTINGS.currentMood);
        ELEMENTS.avatarOuter.setAttribute('data-type', SETTINGS.currentMood);
        avatar.classList.remove('hide');
    }, 150);
    window.ChatBar.sendMessage(`You changed Metal's mood to "${SETTINGS.currentMood.charAt(0).toUpperCase() + SETTINGS.currentMood.slice(1)}".<br>He will now ${window.ai.moodOptions[SETTINGS.currentMood].toLowerCase()}`, 'system')
}

function fakePurchase(amount, text, callback) {
    SFX.select.playNow();
    loadingScreen(true);
    setTimeout(() => {
        ELEMENTS.gold.textContent = Math.max(Number(ELEMENTS.gold.textContent.replace(',', '')) - Math.round(amount), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        const notification = document.createElement('div');
        notification.innerHTML = text;
        notification.classList.add('gold-notification');
        ELEMENTS.goldNotifications.appendChild(notification);
        
        loadingScreen(false);
        
        setTimeout(() => {
            SFX.error.playNow();
            notification.classList.add('show');
            notification.addEventListener('click', () => {
                notification.remove();
            });
            setTimeout(() => {
                notification.classList.add('hide');
                setTimeout(() => {
                    notification.remove();
                }, 600);
            }, 8000);
        }, 100);
        
        if (callback) callback();
    }, getRandomInt(500, 1500));
}
function loadingScreen(show, text = 'Loading...') {
    if (show) {
        ELEMENTS.loadingText.textContent = text;
    }
    ELEMENTS.loadingBackground.classList.toggle('active', show);
}

function onMessageAdded() {
    SFX.switch.playNow();
    ELEMENTS.messagesContainer.scroll({ top: ELEMENTS.messagesContainer.scrollHeight, behavior: 'smooth' });
}

function addPremiumDays(amount) {
    ELEMENTS.premium.textContent = Number(ELEMENTS.premium.textContent) + amount;
}

//#endregion