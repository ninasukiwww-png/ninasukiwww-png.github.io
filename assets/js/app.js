(function() {
    'use strict';

    var loader = document.getElementById('loader');
    var card = document.getElementById('mainCard');
    var bgImage = 'https://raw.githubusercontent.com/ninasukiwww-png/my-images/main/landing/138936740_p0.webp';
    var loaded = false;
    var minTimePassed = false;

    var img = new Image();
    img.src = bgImage;
    img.onload = function() { loaded = true; checkShowCard(); };
    img.onerror = function() { loaded = true; checkShowCard(); };

    setTimeout(function() {
        minTimePassed = true;
        checkShowCard();
    }, 1500);

    var timeout = setTimeout(function() {
        if (!card.classList.contains('visible')) {
            loaded = true;
            minTimePassed = true;
            checkShowCard();
        }
    }, 5000);

    function checkShowCard() {
        if (loaded && minTimePassed && !card.classList.contains('visible')) {
            clearTimeout(timeout);
            loader.classList.add('hidden');
            card.classList.remove('loading');
            setTimeout(function() { card.classList.add('visible'); }, 20);
            loader.addEventListener('transitionend', function() {
                if (loader.classList.contains('hidden')) {
                    loader.style.display = 'none';
                }
            }, { once: true });
        }
    }

    var canvas = document.getElementById('snowCanvas');
    var ctx = canvas.getContext('2d');
    var particles = [];
    var w, h;

    function resizeCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    var MAX_PARTICLES = window.innerWidth < 768 ? 30 : 60;

    function createParticle() {
        return {
            x: Math.random() * w,
            y: -10,
            r: Math.random() * 2.5 + 1.2,
            speed: Math.random() * 0.6 + 0.15,
            wind: Math.random() * 0.3 - 0.15,
            alpha: Math.random() * 0.35 + 0.15
        };
    }

    function initSnow() {
        for (var i = 0; i < MAX_PARTICLES; i++) {
            var p = createParticle();
            p.y = Math.random() * h;
            particles.push(p);
        }
    }
    initSnow();

    function drawSnow() {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + p.alpha + ')';
            ctx.fill();
            p.y += p.speed;
            p.x += p.wind;
            if (p.y > h + 10) particles[i] = createParticle();
            if (p.x > w + 10) p.x = -10;
            if (p.x < -10) p.x = w + 10;
        }
        while (particles.length < MAX_PARTICLES) {
            particles.push(createParticle());
        }
        requestAnimationFrame(drawSnow);
    }
    drawSnow();

    var toast = document.getElementById('toast');
    var toastTimer = null;

    function showToast(msg, dur) {
        if (dur === undefined) dur = 2000;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function() {
            toast.classList.remove('show');
        }, dur);
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                showToast('已复制：' + text);
            }).catch(function() {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try {
            if (document.execCommand('copy')) showToast('已复制：' + text);
            else showToast('复制失败');
        } catch(e) {
            showToast('复制失败');
        }
        document.body.removeChild(ta);
    }

    document.querySelectorAll('[data-copy]').forEach(function(el) {
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            var t = el.getAttribute('data-copy');
            if (t) {
                copyText(t);
                el.classList.add('copied');
                setTimeout(function() { el.classList.remove('copied'); }, 300);
            }
        });
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                el.click();
            }
        });
    });

    var greetingEl = document.getElementById('greeting');
    if (greetingEl) {
        var hour = new Date().getHours();
        var greet;
        if (hour < 6) greet = '夜深了';
        else if (hour < 9) greet = '早上好';
        else if (hour < 12) greet = '上午好';
        else if (hour < 14) greet = '中午好';
        else if (hour < 18) greet = '下午好';
        else if (hour < 21) greet = '傍晚好';
        else greet = '晚上好';
        greetingEl.textContent = greet + '，要做些什么？';
    }

    var clockTime = document.getElementById('clockTime');
    var clockSeconds = document.getElementById('clockSeconds');

    function updateClock() {
        var now = new Date();
        clockTime.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        clockSeconds.textContent = String(now.getSeconds()).padStart(2, '0');
    }
    updateClock();
    setInterval(updateClock, 1000);

    var mottoEl = document.getElementById('statusMotto');
    var mottoText = '';
    var mottoFrom = '';
    var charIndex = 0;
    var isDeleting = false;
    var typeSpeed = 60;
    var deleteSpeed = 25;
    var pauseTime = 6000;
    var isBusy = false;

    var fallbacks = [
        '❄️ 今天也在雪地里码代码',
        '服务器开着，来玩吗',
        '咖啡因浓度：高',
        '夜猫子出没中',
        '🏔️ 雪山服务器运行中',
        '保持好奇，保持愚蠢',
        '系统状态：摸鱼',
        '先喝口水再干活',
        '雪下了一整天',
        '正在重启智商...',
        '目标是：不咕'
    ];

    function fetchHitokoto() {
        if (isBusy) return;
        isBusy = true;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://v1.hitokoto.cn', true);
        xhr.timeout = 4000;

        xhr.onload = function() {
            isBusy = false;
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data && data.hitokoto) {
                        mottoText = data.hitokoto;
                        mottoFrom = data.from ? ' ——' + data.from : '';
                        startTyping();
                        return;
                    }
                } catch(e) {}
            }
            useFallback();
        };

        xhr.onerror = function() { isBusy = false; useFallback(); };
        xhr.ontimeout = function() { isBusy = false; useFallback(); };
        xhr.send();
    }

    function useFallback() {
        mottoText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        mottoFrom = '';
        startTyping();
    }

    function startTyping() {
        charIndex = 0;
        isDeleting = false;
        mottoEl.textContent = '';
        typeStep();
    }

    function typeStep() {
        var display = mottoText + mottoFrom;
        var len = display.length;

        if (!isDeleting) {
            charIndex++;
            mottoEl.textContent = display.substring(0, charIndex);
            if (charIndex >= len) {
                isDeleting = true;
                setTimeout(typeStep, pauseTime);
                return;
            }
            setTimeout(typeStep, typeSpeed);
        } else {
            charIndex--;
            mottoEl.textContent = display.substring(0, charIndex);
            if (charIndex <= 0) {
                mottoText = '';
                mottoFrom = '';
                setTimeout(fetchHitokoto, 400);
                return;
            }
            setTimeout(typeStep, deleteSpeed);
        }
    }

    setTimeout(fetchHitokoto, 2000);

    var uptimeEl = document.getElementById('uptime');
    var launchTime = new Date('2026-06-01T16:33:00Z');

    function updateUptime() {
        var diff = Date.now() - launchTime.getTime();
        if (diff < 0) {
            uptimeEl.textContent = '⏳ 即将开站...';
            return;
        }
        var s = Math.floor(diff / 1000);
        var d = Math.floor(s / 86400);
        var h = Math.floor((s % 86400) / 3600);
        var m = Math.floor((s % 3600) / 60);
        var sec = s % 60;
        uptimeEl.textContent = '❄️ 已运行 ' + d + ' 天 ' + h + ' 小时 ' + m + ' 分 ' + sec + ' 秒';
    }
    updateUptime();
    setInterval(updateUptime, 1000);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
    }
})();
