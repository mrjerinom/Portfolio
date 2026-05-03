const music = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute');

muteBtn.addEventListener('click', function () {
    if (music.paused) {
        music.play().then(() => {
            muteBtn.classList.remove('fa-volume-xmark');
            muteBtn.classList.add('fa-volume-high');
        }).catch((err) => {
            console.error('Playback failed:', err);
        });
    } else {
        music.pause();
        muteBtn.classList.remove('fa-volume-high');
        muteBtn.classList.add('fa-volume-xmark');
    }
});

const overlayBtn = document.getElementById('overlay');
const crossBtn = document.getElementById('close-btn');
const popup = document.getElementById('popup');

function showPopup(sectionId) {
    document.querySelectorAll('.popup-content').forEach(el => el.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    overlayBtn.classList.add('active');
}

document.getElementById('about').addEventListener('click', () => showPopup('popup-about'));
document.getElementById('project').addEventListener('click', () => showPopup('popup-projects'));
document.getElementById('contact').addEventListener('click', () => showPopup('popup-contact'));
document.getElementById('tool').addEventListener('click', () => showPopup('popup-tools'));

crossBtn.addEventListener('click', function () {
    overlayBtn.classList.remove('active');
});

popup.addEventListener('mousedown', function (e) {
    if (e.target.closest('#close-btn')) return;

    let shiftX = e.clientX - popup.getBoundingClientRect().left;
    let shiftY = e.clientY - popup.getBoundingClientRect().top;

    popup.style.position = 'fixed';
    popup.style.zIndex = 1000;

    function moveAt(pageX, pageY) {
        popup.style.left = pageX - shiftX + 'px';
        popup.style.top = pageY - shiftY + 'px';
    }

    moveAt(e.clientX, e.clientY);

    function onMouseMove(e) {
        moveAt(e.clientX, e.clientY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.addEventListener('mouseup', function () {
        document.removeEventListener('mousemove', onMouseMove);
    }, { once: true });
});

popup.ondragstart = function () { return false; };

// ---- CANVAS ----
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
});

const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2,
    alpha: Math.random(),
    delta: (Math.random() * 0.02) + 0.005
}));

const rockets = [];
let lastLaunchTime = 0;
const launchInterval = 4000;

function spawnRocket() {
    rockets.push({
        x: Math.random() * (canvas.width - 100) + 50,
        y: canvas.height + 30,
        speed: (Math.random() * 1.5) + 1.5,
        size: 14
    });
}

function drawStar(star) {
    ctx.save();
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawPixelRocket(x, y, size) {
    const p = Math.ceil(size * 0.7); // pixel block size
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));

    // pixel grid helper — snaps to pixel blocks
    function px(col, row, color, alpha = 1) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(col * p), Math.floor(row * p), p, p);
    }

    // flame flicker — randomly show extra flame pixels
    const flicker = Math.random() > 0.5;

    // flame pixels (below body, col offset -1 to 1, rows 3-5)
    px(-1, 4, 'cyan', 0.5);
    px(0,  4, 'white', 0.9);
    px(1,  4, 'cyan', 0.5);
    if (flicker) {
        px(0, 5, 'cyan', 0.6);
        px(-1, 5, '#004444', 0.3);
        px(1, 5, '#004444', 0.3);
    }
    px(0, 3, '#aee6f8', 0.8);

    // body — 3 wide x 4 tall, starts at row -1
    px(-1, -1, '#4a9aba');
    px(0,  -1, '#aee6f8');
    px(1,  -1, '#4a9aba');

    px(-1, 0, '#4a9aba');
    px(0,  0, '#aee6f8');
    px(1,  0, '#4a9aba');

    px(-1, 1, '#4a9aba');
    px(0,  1, '#aee6f8');
    px(1,  1, '#4a9aba');

    px(-1, 2, '#4a9aba');
    px(0,  2, '#aee6f8');
    px(1,  2, '#4a9aba');

    // window — glowing cyan pixel on body
    px(0, 0, '#001a33');
    px(0, 0, 'cyan', 0.5);

    // nose cone — narrows to a point
    px(-1, -2, 'magenta');
    px(0,  -2, 'magenta');
    px(1,  -2, 'magenta');

    px(0,  -3, '#ff6eb4');  // tip

    // fins — stick out from sides at bottom of body
    px(-2, 2, 'yellow');
    px(2,  2, 'yellow');
    px(-2, 3, '#886600');
    px(2,  3, '#886600');

    // cyan glow outline effect on body edges
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = 'cyan';
    ctx.fillRect(
        Math.floor(-1 * p) - 1,
        Math.floor(-1 * p) - 1,
        p * 3 + 2,
        p * 4 + 2
    );

    ctx.restore();
}

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.alpha += star.delta;
        if (star.alpha >= 1 || star.alpha <= 0) star.delta = -star.delta;
        drawStar(star);
    });

    if (timestamp - lastLaunchTime > launchInterval) {
        spawnRocket();
        lastLaunchTime = timestamp;
    }

    for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].y -= rockets[i].speed;
        drawPixelRocket(rockets[i].x, rockets[i].y, rockets[i].size);
        if (rockets[i].y < -100) rockets.splice(i, 1);
    }

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);