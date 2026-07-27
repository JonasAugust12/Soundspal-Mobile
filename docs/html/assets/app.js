/* Tài liệu TL-Mobile — script dùng chung: theme toggle + TOC tự động + scroll spy */
(function () {
    'use strict';

    // ── Theme ────────────────────────────────────────────────────────────────
    var KEY = 'tl-docs-theme';
    var saved = null;
    try {
        saved = localStorage.getItem(KEY);
    } catch (e) {
        /* private mode */
    }
    var prefersDark =
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

    function initTheme() {
        var btn = document.getElementById('theme-toggle');
        if (!btn) return;
        function label() {
            btn.textContent =
                document.documentElement.getAttribute('data-theme') === 'dark' ? '☀ Sáng' : '☾ Tối';
        }
        label();
        btn.addEventListener('click', function () {
            var next =
                document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try {
                localStorage.setItem(KEY, next);
            } catch (e) {
                /* ignore */
            }
            label();
        });
    }

    // ── TOC tự sinh từ h2/h3 trong <main> ────────────────────────────────────
    function slug(text, used) {
        var s = text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        if (!s) s = 'muc';
        var base = s,
            i = 2;
        while (used[s]) s = base + '-' + i++;
        used[s] = true;
        return s;
    }

    function initToc() {
        var nav = document.getElementById('toc-list');
        var main = document.querySelector('main');
        if (!nav || !main) return;

        var heads = main.querySelectorAll('h2, h3');
        var used = {};
        var links = [];

        Array.prototype.forEach.call(heads, function (h) {
            if (h.dataset.notoc !== undefined) return;
            if (!h.id) h.id = slug(h.textContent || '', used);
            else used[h.id] = true;

            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            if (h.tagName === 'H3') a.className = 'lvl3';
            nav.appendChild(a);
            links.push({ a: a, el: h });
        });

        if (!links.length) return;

        // ── Scroll spy ───────────────────────────────────────────────────────
        var current = null;
        function spy() {
            var best = links[0];
            for (var i = 0; i < links.length; i++) {
                if (links[i].el.getBoundingClientRect().top <= 100) best = links[i];
                else break;
            }
            if (best === current) return;
            if (current) current.a.classList.remove('active');
            best.a.classList.add('active');
            current = best;
        }

        var ticking = false;
        window.addEventListener(
            'scroll',
            function () {
                if (ticking) return;
                ticking = true;
                window.requestAnimationFrame(function () {
                    spy();
                    ticking = false;
                });
            },
            { passive: true },
        );
        spy();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initTheme();
            initToc();
        });
    } else {
        initTheme();
        initToc();
    }
})();
