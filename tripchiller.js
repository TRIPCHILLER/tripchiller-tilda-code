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
