/* =========================
   TRIPCHILLER / LOAD MORE BUTTON
   ========================= */

(function () {
  if (window.__TC_LOAD_MORE_BUTTON_STYLE_V1__) return;
  window.__TC_LOAD_MORE_BUTTON_STYLE_V1__ = true;

  function bindLoadMoreButtons() {
    var buttons = document.querySelectorAll(
      '.t778__showmore, .t-store__load-more-btn, .js-store-load-more-btn'
    );

    buttons.forEach(function (btn) {
      if (!btn || btn.__tcLoadMoreReady) return;

      btn.__tcLoadMoreReady = true;

      function press() {
        btn.classList.add('tc-loadmore-pressed');
      }

      function releaseSoon() {
        setTimeout(function () {
          btn.classList.remove('tc-loadmore-pressed');
        }, 140);
      }

      btn.addEventListener('pointerdown', press, true);
      btn.addEventListener('pointerup', releaseSoon, true);
      btn.addEventListener('pointerleave', releaseSoon, true);
      btn.addEventListener('pointercancel', releaseSoon, true);

      btn.addEventListener('touchstart', press, {
        passive: true,
        capture: true
      });

      btn.addEventListener('touchend', releaseSoon, {
        passive: true,
        capture: true
      });

      btn.addEventListener('click', function () {
        press();
        releaseSoon();
      }, true);
    });
  }

  function scheduleBind() {
    bindLoadMoreButtons();
    setTimeout(bindLoadMoreButtons, 200);
    setTimeout(bindLoadMoreButtons, 800);
    setTimeout(bindLoadMoreButtons, 1600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleBind);
  } else {
    scheduleBind();
  }

  window.addEventListener('load', scheduleBind);

  if (window.MutationObserver) {
    var observer = new MutationObserver(function () {
      scheduleBind();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }
})();
/* =========================
   TRIPCHILLER / LEGAL BUTTONS
   ========================= */

(function () {
  if (window.__TC_LEGAL_BUTTONS_SINGLE_FILL_V5__) return;
  window.__TC_LEGAL_BUTTONS_SINGLE_FILL_V5__ = true;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function normalizeText(str) {
    return String(str || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
  }

  function getButtonRoot(el) {
    return el.closest('a') ||
           el.closest('button') ||
           el.closest('.tn-atom') ||
           el;
  }

  function markLegalButtons() {
    var targets = [
      'ДОГОВОР ОФЕРТЫ',
      'ПОЛИТИКА ОБРАБОТКИ ДАННЫХ',
      'ПОЛИТИКА ОБРАБОТКИ ДАННЫХ 2026'
    ];

    var candidates = document.querySelectorAll('a, button, .tn-atom, .t-btn');

    candidates.forEach(function (el) {
      var text = normalizeText(el.textContent);

      var matched = targets.some(function (target) {
        return text.indexOf(target) !== -1;
      });

      if (!matched) return;

      var btn = getButtonRoot(el);
      if (!btn || btn.__tcLegalButtonSingleFillReadyV5) return;

      btn.__tcLegalButtonSingleFillReadyV5 = true;
      btn.classList.add('tc-legal-btn');

      var pressTimer = null;
      var clickLock = false;

      function press() {
        clearTimeout(pressTimer);
        btn.classList.add('tc-pressed');
      }

      function releaseSoon() {
        clearTimeout(pressTimer);
        pressTimer = setTimeout(function () {
          btn.classList.remove('tc-pressed');
        }, 140);
      }

      btn.addEventListener('pointerdown', function () {
        press();
      }, true);

      btn.addEventListener('pointerup', function () {
        releaseSoon();
      }, true);

      btn.addEventListener('pointerleave', function () {
        releaseSoon();
      }, true);

      btn.addEventListener('pointercancel', function () {
        releaseSoon();
      }, true);

      btn.addEventListener('touchstart', function () {
        press();
      }, { passive: true, capture: true });

      btn.addEventListener('touchend', function () {
        releaseSoon();
      }, { passive: true, capture: true });

      /*
        Gives 130ms for visible press animation,
        then opens the link.
      */
      btn.addEventListener('click', function (e) {
        var link = btn.closest('a') || btn.querySelector('a');
        if (!link) return;

        var href = link.getAttribute('href');
        if (!href || href === '#') return;

        if (
          e.defaultPrevented ||
          e.button === 1 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }

        if (clickLock) return;

        e.preventDefault();
        e.stopPropagation();

        clickLock = true;
        press();

        setTimeout(function () {
          window.location.href = href;
        }, 130);
      }, true);
    });
  }

  function scheduleMark() {
    markLegalButtons();
    setTimeout(markLegalButtons, 80);
    setTimeout(markLegalButtons, 300);
    setTimeout(markLegalButtons, 1200);
  }

  ready(scheduleMark);
  window.addEventListener('load', scheduleMark);

  if (window.MutationObserver) {
    var observer = new MutationObserver(function () {
      scheduleMark();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'href']
    });
  }
})();
