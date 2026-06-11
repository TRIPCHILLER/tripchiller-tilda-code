(function(){
  "use strict";

  window.__TC_EXTERNAL_CODE_VERSION__ = 'shop-hardfix-2026-06-11-v2';
  if (window.__TC_DEBUG_CORE__) {
    console.log('[TRIPCHILLER_CORE]', window.__TC_EXTERNAL_CODE_VERSION__);
  }

  function tcIsProductRouteEarly() {
    var href = String(location.href || '');
    var path = String(location.pathname || '');
    var hash = String(location.hash || '');
    return /\/tproduct(\/|$)/.test(path) ||
      /\/product(\/|$)/.test(path) ||
      /\/tproduct\//.test(href) ||
      /\/product\//.test(href) ||
      /#!\/?tproduct(\/|$)/.test(hash) ||
      /#!\/?product(\/|$)/.test(hash);
  }

  function tcApplyProductRouteClassesEarly() {
    if (!tcIsProductRouteEarly()) return;
    document.documentElement.classList.add(
      'tc-product-page',
      'tc-product-page-active',
      'tc-site-header-product-suppressed'
    );
    if (document.body) {
      document.body.classList.add(
        'tc-product-page',
        'tc-product-page-active',
        'tc-site-header-product-suppressed'
      );
    }
  }

  tcApplyProductRouteClassesEarly();
  if (!document.body) {
    setTimeout(tcApplyProductRouteClassesEarly, 0);
    setTimeout(tcApplyProductRouteClassesEarly, 50);
  }
  document.addEventListener('DOMContentLoaded', tcApplyProductRouteClassesEarly);
  window.addEventListener('load', tcApplyProductRouteClassesEarly);
  window.addEventListener('hashchange', tcApplyProductRouteClassesEarly);
  window.addEventListener('popstate', tcApplyProductRouteClassesEarly);

  window.__TC_DEBUG_STATE__ = function () {
    return {
      version: window.__TC_EXTERNAL_CODE_VERSION__,
      href: location.href,
      htmlClass: document.documentElement.className,
      bodyClass: document.body ? document.body.className : '',
      loadMore: Array.prototype.map.call(document.querySelectorAll('.tc-safe-load-more-btn'), function(el){
        return { text: el.textContent.trim(), cls: el.className };
      }),
      filters: Array.prototype.map.call(document.querySelectorAll('.tc-safe-filter-item'), function(el){
        return { text: el.textContent.trim(), cls: el.className, color: getComputedStyle(el).color };
      }),
      catalogParts: Array.prototype.map.call(
        document.querySelectorAll('#allrecords .t-catalog__parts-switch-wrapper .t-catalog__parts-text-title, #allrecords .t-store__parts-switch-wrapper .t-catalog__parts-text-title'),
        function(el) {
          var item = el.closest('.tc-safe-filter-item, .t-catalog__parts-switch-btn, .t-store__parts-switch-btn, .t-catalog__parts-button-base, .js-catalog-parts-switcher');
          return {
            text: el.textContent.trim(),
            textClass: el.className,
            itemClass: item ? item.className : '',
            color: getComputedStyle(el).color,
            inlineColor: el.style.color,
            opacity: getComputedStyle(el).opacity
          };
        }
      ),
      hasProductBgRecord: !!document.querySelector('#rec2312983111')
    };
  };

  function ready(fn){
    if(document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function qInner(root){
    return root ? (root.querySelector(".tn-atom, img, svg") || root) : null;
  }

  var TC_HEADER_LINKS = [
    { label: 'ГАЛЕРЕЯ', href: '/', key: 'gallery', side: 'left' },
    { label: 'ДОСТАВКА', href: '/shipping', key: 'shipping', side: 'left' },
    { label: 'КОНТАКТЫ', href: '/contacts', key: 'contacts', side: 'right' },
    { label: 'ОТЗЫВЫ', href: 'https://vk.com/topic-187277176_49250444', key: 'reviews', side: 'right', external: true }
  ];

  window.TC_HEADER_LINKS = TC_HEADER_LINKS;

  function normalizeHeaderPath(pathname){
    var path = String(pathname || '/').split('?')[0].split('#')[0] || '/';
    if (path.length > 1) path = path.replace(/\/+$/, '');
    return path || '/';
  }

  function getHeaderLinkPath(href){
    var url;
    try {
      url = new URL(href, window.location.origin);
      return normalizeHeaderPath(url.pathname);
    } catch (_) {
      return normalizeHeaderPath(href);
    }
  }

  function isLegalHeaderPage(pathname){
    var path = normalizeHeaderPath(pathname);
    return path === '/offer_agreement' || path === '/data_processing_policy';
  }

  function isAlwaysVisibleHeaderPage(pathname){
    var path = normalizeHeaderPath(pathname);
    return path === '/shipping'
      || path === '/contacts'
      || path === '/contact'
      || path === '/offer_agreement'
      || path === '/data_processing_policy';
  }

  var siteHeaderSyncRaf = 0;
  var siteHeaderHistoryWrapped = false;
  var siteHeaderProductObserver = null;

  function isProductPathLike(value) {
    var text = String(value || '');
    return /(^|\/)(tproduct|product)(\/|$)/.test(text) ||
      /#!\/?(tproduct|product)(\/|$)/.test(text);
  }

  function hasVisibleTildaProductPopup(){
    if (!document.querySelectorAll) return false;

    var candidates = document.querySelectorAll([
      '.t-store__prod-popup',
      '.js-store-prod-popup',
      '.js-store-prod-popup.t-popup_show',
      '.t-popup_show',
      '.t-popup_show .t-store__prod-popup',
      '.t-store__prod-popup.t-popup_show',
      '.t-store__prod-popup[style*=\"display: block\"]',
      '.t-store__prod-popup:not([style*=\"display: none\"])'
    ].join(','));

    var productMarkers = [
      '.t-store__prod-popup',
      '.t-store__prod-popup__info',
      '.t-store__prod-popup__gallery',
      '.t-store__prod-popup__close',
      '.js-store-prod-popup',
      '.t-slds'
    ].join(',');

    return Array.prototype.some.call(candidates, function(el){
      if (!el || !el.getBoundingClientRect) return false;

      var productRoot = el.matches && el.matches(productMarkers) ? el : null;
      if (!productRoot && el.querySelector) productRoot = el.querySelector(productMarkers);
      if (!productRoot && el.closest) productRoot = el.closest(productMarkers);
      if (!productRoot) return false;

      var style = window.getComputedStyle ? window.getComputedStyle(el) : null;
      if (style && (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0)) return false;

      var rect = el.getBoundingClientRect();
      return rect.width > 20 && rect.height > 20;
    });
  }

  function isSiteHeaderProductMode(){
    var html = document.documentElement;
    var body = document.body;

    if ((html && (html.classList.contains('tc-product-page') || html.classList.contains('tc-product-page-active'))) ||
      (body && (body.classList.contains('tc-product-page') || body.classList.contains('tc-product-page-active')))) {
      return true;
    }

    if (isProductPathLike(window.location.pathname) ||
      isProductPathLike(window.location.hash) ||
      isProductPathLike(window.location.href)) {
      return true;
    }

    return hasVisibleTildaProductPopup();
  }

  function getActiveHeaderKey(pathname){
    var path = normalizeHeaderPath(pathname);

    if (isLegalHeaderPage(pathname)) return '';
    if (path === '/' || path === '/gallery' || /^\/tproduct(\/|$)/.test(path) || /^\/product(\/|$)/.test(path)) return 'gallery';
    if (path === '/shipping') return 'shipping';
    if (path === '/contacts' || path === '/contact') return 'contacts';

    for (var i = 0; i < TC_HEADER_LINKS.length; i++) {
      if (!TC_HEADER_LINKS[i].external && getHeaderLinkPath(TC_HEADER_LINKS[i].href) === path) return TC_HEADER_LINKS[i].key;
    }

    return '';
  }

  function shouldCreateSiteHeader(){
    var activeKey = getActiveHeaderKey(window.location.pathname);
    if (activeKey || isLegalHeaderPage(window.location.pathname)) return true;

    var path = normalizeHeaderPath(window.location.pathname);
    return TC_HEADER_LINKS.some(function(link){
      return !link.external && getHeaderLinkPath(link.href) === path;
    });
  }

  function setHeaderGlobalClass(name, enabled){
    var html = document.documentElement;
    var body = document.body;
    if (html) html.classList.toggle(name, enabled);
    if (body) body.classList.toggle(name, enabled);
  }

  function getPageScrollY() {
    return Math.max(
      window.scrollY || 0,
      window.pageYOffset || 0,
      document.documentElement ? document.documentElement.scrollTop || 0 : 0,
      document.body ? document.body.scrollTop || 0 : 0
    );
  }

  function closeSiteHeaderMobileMenu(){
    setHeaderGlobalClass('tc-site-header-menu-open', false);

    var burger = document.querySelector('.tc-site-header__burger');
    var mobilePanel = document.querySelector('.tc-site-header__mobile-panel');

    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
    }
    if (mobilePanel) mobilePanel.setAttribute('aria-hidden', 'true');
  }

  function syncSiteHeaderReveal() {
    if (isSiteHeaderProductMode()) {
      setHeaderGlobalClass('tc-site-header-product-suppressed', true);
      setHeaderGlobalClass('tc-site-header-visible', false);
      closeSiteHeaderMobileMenu();
      return;
    }

    setHeaderGlobalClass('tc-site-header-product-suppressed', false);
    var shouldShow = isAlwaysVisibleHeaderPage(window.location.pathname) || getPageScrollY() > 60;
    setHeaderGlobalClass('tc-site-header-visible', shouldShow);
  }

  window.__TC_SYNC_SITE_HEADER_REVEAL__ = syncSiteHeaderReveal;

  function safeSyncSiteHeaderReveal() {
    if (typeof window.__TC_SYNC_SITE_HEADER_REVEAL__ === 'function') {
      window.__TC_SYNC_SITE_HEADER_REVEAL__();
      return;
    }

    if (typeof syncSiteHeaderReveal === 'function') {
      syncSiteHeaderReveal();
    }
  }

  function scheduleSiteHeaderSync() {
    if (siteHeaderSyncRaf) return;

    var raf = window.requestAnimationFrame || function(callback){ return window.setTimeout(callback, 50); };
    siteHeaderSyncRaf = raf(function(){
      siteHeaderSyncRaf = 0;
      safeSyncSiteHeaderReveal();
    });
  }

  function initSiteHeaderRouteWatchers(){
    if (!window.__TC_SITE_HEADER_ROUTE_WATCHERS__) {
      window.__TC_SITE_HEADER_ROUTE_WATCHERS__ = true;
      window.addEventListener('hashchange', scheduleSiteHeaderSync);
      window.addEventListener('popstate', scheduleSiteHeaderSync);
    }

    if (!siteHeaderHistoryWrapped && window.history) {
      siteHeaderHistoryWrapped = true;
      ['pushState', 'replaceState'].forEach(function(name){
        var original = window.history[name];
        if (typeof original !== 'function') return;

        window.history[name] = function(){
          var result = original.apply(this, arguments);
          scheduleSiteHeaderSync();
          return result;
        };
      });
    }

    if (!siteHeaderProductObserver && window.MutationObserver && document.documentElement) {
      siteHeaderProductObserver = new MutationObserver(scheduleSiteHeaderSync);
      siteHeaderProductObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        childList: true,
        subtree: true
      });
    }
  }

  function normalizeLegacyHeaderText(value){
    return String(value || '').replace(/\s+/g, ' ').trim().toUpperCase();
  }

  function isLegacyHeaderExcluded(node){
    if (!node || !node.matches) return true;
    if (node.closest('.tc-site-header')) return true;
    if (node.matches('#rec2312983111, .t-catalog, .js-catalog, .t-store, .tc-site-header')) return true;
    if (node.closest('#rec2312983111, .t-catalog, .js-catalog, .t-store, .tc-site-header')) return true;
    if (node.matches('.t-store__card, .t-catalog__card, .js-store-product, .js-catalog-product, .t-catalog__product-snippet, .t-catalog__product, .t-store__prod-popup, .t-popup, [data-product-lid], [class*="gallery"]')) return true;
    if (node.closest('.t-store__card, .t-catalog__card, .js-store-product, .js-catalog-product, .t-catalog__product-snippet, .t-catalog__product, .t-store__prod-popup, .t-popup, [data-product-lid], [class*="gallery"]')) return true;
    return false;
  }

  function hideLegacyTildaHeader(){
    if (!document.body || !document.body.classList.contains('tc-custom-header-enabled')) return;

    var labels = ['ГАЛЕРЕЯ', 'ДОСТАВКА', 'КОНТАКТЫ', 'ОТЗЫВЫ'];
    var linkSelector = [
      'a',
      'button',
      '[role="link"]',
      '[role="button"]',
      '.t-menu__link-item',
      '.t228__list_item',
      '.t450__menu a',
      '.t451__menu a',
      '.t456 a'
    ].join(', ');
    var containerSelector = '.r.t-rec, .t-rec, [id^="rec"], [data-record-type], .t228, .t228__positionfixed, .tmenu-mobile, .t-menuburger, .t450, .t451, .t456';
    var seen = [];

    document.querySelectorAll(linkSelector).forEach(function(el){
      if (!el || !el.closest || el.closest('.tc-site-header')) return;

      var text = normalizeLegacyHeaderText(el.textContent);
      var hasMenuLabel = labels.some(function(label){ return text.indexOf(label) !== -1; });
      if (!hasMenuLabel) return;

      var container = el.closest(containerSelector);
      if (!container || seen.indexOf(container) !== -1) return;
      seen.push(container);
      if (isLegacyHeaderExcluded(container)) return;
      if (container.querySelector('.tc-site-header')) return;

      var containerText = normalizeLegacyHeaderText(container.textContent);
      var matchesCount = labels.reduce(function(count, label){
        return count + (containerText.indexOf(label) !== -1 ? 1 : 0);
      }, 0);

      if (matchesCount >= 2) {
        container.classList.add('tc-legacy-header-hidden');
      }
    });
  }

  window.__TC_HIDE_LEGACY_TILDA_HEADER__ = hideLegacyTildaHeader;

  function safeHideLegacyTildaHeader() {
    if (typeof window.__TC_HIDE_LEGACY_TILDA_HEADER__ === 'function') {
      window.__TC_HIDE_LEGACY_TILDA_HEADER__();
      return;
    }
    if (typeof hideLegacyTildaHeader === 'function') {
      hideLegacyTildaHeader();
    }
  }

  function removeLegacyMenuEyeLogo(){
    document.querySelectorAll('.tc-menu-eye-logo').forEach(function(node){
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function getTripchillerAssetBaseUrl(){
    var script = document.querySelector('script[src*="tripchiller.js"]');
    if (!script || !script.src) return '';
    return script.src.replace(/tripchiller\.js.*$/, '');
  }

  function getSiteHeaderEyeAssetUrl(fileName){
    var base = getTripchillerAssetBaseUrl();
    return base ? base + 'assets/' + fileName : '';
  }

  function ensureSiteHeaderEye(header){
    if (!header || !header.querySelector) return null;

    var logoSlot = header.querySelector('.tc-site-header__logo-slot');
    if (!logoSlot) return null;
    logoSlot.removeAttribute('aria-hidden');

    var existingLink = logoSlot.querySelector('.tc-site-header-eye-link');
    var existingEye = logoSlot.querySelector('.tc-site-header-eye');
    if (existingLink) {
      existingLink.href = '/';
      existingLink.setAttribute('aria-label', 'На главную TRIPCHILLER');
      return existingLink.querySelector('.tc-site-header-eye') || existingEye;
    }

    var link = document.createElement('a');
    link.className = 'tc-site-header-eye-link';
    link.href = '/';
    link.setAttribute('aria-label', 'На главную TRIPCHILLER');

    if (existingEye) {
      logoSlot.insertBefore(link, existingEye);
      link.appendChild(existingEye);
      existingEye.setAttribute('aria-hidden', 'true');
      return existingEye;
    }

    var baseUrl = getSiteHeaderEyeAssetUrl('2_pt.svg');
    var pupilUrl = getSiteHeaderEyeAssetUrl('3_pt.svg');
    if (!baseUrl || !pupilUrl) {
      if (window.console && typeof window.console.warn === 'function') {
        window.console.warn('TRIPCHILLER: cannot create site header eye because tripchiller.js asset base URL was not found.');
      }
      return null;
    }

    var eye = document.createElement('div');
    eye.className = 'tc-site-header-eye';
    eye.setAttribute('aria-hidden', 'true');

    var base = document.createElement('img');
    base.className = 'tc-site-header-eye__base';
    base.src = baseUrl;
    base.alt = '';
    base.decoding = 'async';

    var pupil = document.createElement('img');
    pupil.className = 'tc-site-header-eye__pupil';
    pupil.src = pupilUrl;
    pupil.alt = '';
    pupil.decoding = 'async';

    eye.appendChild(base);
    eye.appendChild(pupil);
    link.appendChild(eye);
    logoSlot.appendChild(link);
    return eye;
  }

  function initSiteHeaderEyeMotion(){
    if (window.__TC_SITE_HEADER_EYE_MOTION_V1__) return;
    window.__TC_SITE_HEADER_EYE_MOTION_V1__ = true;

    var media = window.matchMedia ? window.matchMedia('(min-width: 980px)') : null;
    var HEADER_EYE_MOTION = {
      maxX: 0.6,
      maxY: 0.5,
      ease: 0.15,
      idleDelay: 1000
    };
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var blinkScale = 1;
    var nextBlinkAt = 0;
    var lastPointerAt = 0;
    var rafId = 0;

    function isDesktop(){
      return !media || media.matches;
    }

    function getPupil(){
      return document.querySelector('.tc-site-header-eye__pupil');
    }

    function scheduleNextBlink(now){
      nextBlinkAt = now + 5000 + Math.random() * 2000;
    }

    function updateBlink(now){
      if (!nextBlinkAt) scheduleNextBlink(now);
      var blinkElapsed = now - nextBlinkAt;

      if (blinkElapsed >= 0 && blinkElapsed <= 150) {
        var progress = blinkElapsed / 150;
        blinkScale = progress < 0.5
          ? 1 - (progress / 0.5) * 0.84
          : 0.16 + ((progress - 0.5) / 0.5) * 0.84;
      } else {
        blinkScale = 1;
        if (blinkElapsed > 150) scheduleNextBlink(now);
      }
    }

    function tick(now){
      var pupil = getPupil();

      if (!isDesktop()) {
        targetX = 0;
        targetY = 0;
        currentX += (0 - currentX) * HEADER_EYE_MOTION.ease;
        currentY += (0 - currentY) * HEADER_EYE_MOTION.ease;
        blinkScale = 1;
        if (pupil) pupil.style.transform = 'translate(-50%, -50%) translate(0px, 0px) scaleY(1)';
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (!lastPointerAt || now - lastPointerAt > HEADER_EYE_MOTION.idleDelay) {
        targetX = 0;
        targetY = 0;
      }

      currentX += (targetX - currentX) * HEADER_EYE_MOTION.ease;
      currentY += (targetY - currentY) * HEADER_EYE_MOTION.ease;

      updateBlink(now);

      if (pupil) {
        var x = Math.max(-HEADER_EYE_MOTION.maxX, Math.min(HEADER_EYE_MOTION.maxX, currentX));
        var y = Math.max(-HEADER_EYE_MOTION.maxY, Math.min(HEADER_EYE_MOTION.maxY, currentY));
        pupil.style.transform = 'translate(-50%, -50%) translate(' + x.toFixed(2) + 'px, ' + y.toFixed(2) + 'px) scaleY(' + blinkScale.toFixed(3) + ')';
      }

      rafId = window.requestAnimationFrame(tick);
    }

    document.addEventListener('mousemove', function(event){
      if (!isDesktop()) return;

      var pupil = getPupil();
      var eye = pupil && pupil.closest ? pupil.closest('.tc-site-header-eye') : null;
      if (!eye) return;

      var rect = eye.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      var dx = (event.clientX - centerX) / Math.max(window.innerWidth / 2, 1);
      var dy = (event.clientY - centerY) / Math.max(window.innerHeight / 2, 1);

      targetX = Math.max(-HEADER_EYE_MOTION.maxX, Math.min(HEADER_EYE_MOTION.maxX, dx * HEADER_EYE_MOTION.maxX));
      targetY = Math.max(-HEADER_EYE_MOTION.maxY, Math.min(HEADER_EYE_MOTION.maxY, dy * HEADER_EYE_MOTION.maxY));
      lastPointerAt = window.performance && window.performance.now ? window.performance.now() : Date.now();
    }, { passive: true });

    rafId = window.requestAnimationFrame(tick);

    window.addEventListener('beforeunload', function(){
      if (rafId) window.cancelAnimationFrame(rafId);
    });
  }

  function initSiteHeader(){
    if (window.__TC_SITE_HEADER_V1__) return;
    if (!document.body || !shouldCreateSiteHeader()) return;
    window.__TC_SITE_HEADER_V1__ = true;

    var existing = document.querySelector('.tc-site-header');
    var header = existing || document.createElement('header');
    var activeKey = getActiveHeaderKey(window.location.pathname);

    function createLink(link){
      var item = document.createElement('a');
      var linkPath = getHeaderLinkPath(link.href);
      var currentPath = normalizeHeaderPath(window.location.pathname);
      var isActive = !link.external && (link.key === activeKey || linkPath === currentPath);

      item.className = 'tc-site-header__link';
      item.href = link.href;
      item.textContent = link.label;
      item.dataset.tcHeaderKey = link.key;
      if (link.external === true) {
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
      }
      if (isActive) {
        item.classList.add('tc-site-header__link--active');
        item.setAttribute('aria-current', 'page');
      }
      return item;
    }

    function setMenuOpen(open){
      setHeaderGlobalClass('tc-site-header-menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      mobilePanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    if (!existing) {
      header.className = 'tc-site-header';
      header.setAttribute('aria-label', 'TRIPCHILLER navigation');

      var inner = document.createElement('nav');
      inner.className = 'tc-site-header__inner';

      var leftNav = document.createElement('div');
      leftNav.className = 'tc-site-header__nav tc-site-header__nav--left';

      var logoSlot = document.createElement('div');
      logoSlot.className = 'tc-site-header__logo-slot';

      var rightNav = document.createElement('div');
      rightNav.className = 'tc-site-header__nav tc-site-header__nav--right';

      var burger = document.createElement('button');
      burger.className = 'tc-site-header__burger';
      burger.type = 'button';
      burger.setAttribute('aria-label', 'Открыть меню');
      burger.setAttribute('aria-expanded', 'false');

      inner.appendChild(leftNav);
      inner.appendChild(logoSlot);
      inner.appendChild(rightNav);
      inner.appendChild(burger);

      var mobilePanel = document.createElement('div');
      mobilePanel.className = 'tc-site-header__mobile-panel';
      mobilePanel.setAttribute('aria-hidden', 'true');

      TC_HEADER_LINKS.forEach(function(link){
        var item = createLink(link);
        if (link.side === 'right') rightNav.appendChild(item);
        else leftNav.appendChild(item);
        mobilePanel.appendChild(createLink(link));
      });

      header.appendChild(inner);
      header.appendChild(mobilePanel);
      document.body.insertBefore(header, document.body.firstChild);
    }

    var burger = header.querySelector('.tc-site-header__burger');
    var mobilePanel = header.querySelector('.tc-site-header__mobile-panel');

    ensureSiteHeaderEye(header);
    initSiteHeaderEyeMotion();

    document.body.classList.add('tc-custom-header-enabled');
    removeLegacyMenuEyeLogo();
    safeHideLegacyTildaHeader();
    safeSyncSiteHeaderReveal();
    requestAnimationFrame(safeSyncSiteHeaderReveal);
    setTimeout(safeSyncSiteHeaderReveal, 100);
    setTimeout(safeSyncSiteHeaderReveal, 500);

    window.addEventListener('scroll', safeSyncSiteHeaderReveal, { passive: true });
    window.addEventListener('resize', safeSyncSiteHeaderReveal, { passive: true });
    initSiteHeaderRouteWatchers();

    if (burger && mobilePanel) {
      burger.addEventListener('click', function(){
        setMenuOpen(!document.body.classList.contains('tc-site-header-menu-open'));
      });

      mobilePanel.addEventListener('click', function(event){
        if (event.target && event.target.closest && event.target.closest('.tc-site-header__link')) {
          setMenuOpen(false);
        }
      });

      document.addEventListener('keydown', function(event){
        if (event.key === 'Escape') setMenuOpen(false);
      });
    }
  }

  ready(initSiteHeader);

  function restoreHeroBaseVisibility(reason){
    if (!document.body) return;

    if (
      document.body.classList.contains('egg-on') ||
      document.body.classList.contains('egg-returning') ||
      document.body.classList.contains('tc-eye-hard-hidden')
    ) {
      return;
    }

    var isMobile = window.innerWidth <= 768;

    function setImportant(el, prop, value){
      if (!el) return;
      el.style.setProperty(prop, value, 'important');
    }

    var flower = document.querySelector('.flower');
    var eyeDesktop = document.querySelector('.eye-desktop');
    var eyeMobile = document.querySelector('.eye-mobile');

    if (flower && !flower.classList.contains('tc-egg-original-hidden')) {
      setImportant(flower, 'visibility', 'visible');
      setImportant(flower, 'opacity', '1');
    }

    if (eyeDesktop && !eyeDesktop.classList.contains('tc-egg-original-hidden')) {
      setImportant(eyeDesktop, 'visibility', isMobile ? 'hidden' : 'visible');
      setImportant(eyeDesktop, 'opacity', isMobile ? '0' : '1');
    }

    if (eyeMobile && !eyeMobile.classList.contains('tc-egg-original-hidden')) {
      setImportant(eyeMobile, 'visibility', isMobile ? 'visible' : 'hidden');
      setImportant(eyeMobile, 'opacity', isMobile ? '1' : '0');
    }

    [
      '.flower .tn-atom',
      '.flower img',
      '.flower svg',
      '.eye-desktop .tn-atom',
      '.eye-desktop img',
      '.eye-desktop svg',
      '.eye-mobile .tn-atom',
      '.eye-mobile img',
      '.eye-mobile svg'
    ].forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        setImportant(el, 'visibility', 'visible');
      });
    });
  }
function isEyeParallaxLocked(){
  return (
    window.__TC_EYE_PARALLAX_LOCKED__ === true ||
    document.body.classList.contains('tc-eye-parallax-locked') ||
    document.body.classList.contains('egg-on') ||
    document.body.classList.contains('egg-returning')
  );
}
function forceEyeCenterInstant(){
  ['.eye-desktop', '.eye-mobile'].forEach(function(sel){
    var wrap = document.querySelector(sel);
    var eye = qInner(wrap);

    if (!eye) return;

    eye.style.transition = 'none';
    eye.style.transform = 'translate(0,0) scale(1,1)';
    eye.style.opacity = '1';
  });
}

window.__TC_FORCE_EYE_CENTER__ = forceEyeCenterInstant;
  ready(function(){

    restoreHeroBaseVisibility('ready');

    requestAnimationFrame(function(){
      restoreHeroBaseVisibility('raf-1');

      requestAnimationFrame(function(){
        restoreHeroBaseVisibility('raf-2');
      });
    });

    [50, 150, 400, 900, 1600, 2600].forEach(function(delay){
      setTimeout(function(){
        restoreHeroBaseVisibility('timeout-' + delay);
      }, delay);
    });

    window.addEventListener('load', function(){
      restoreHeroBaseVisibility('load');
    });

    window.addEventListener('resize', function(){
      restoreHeroBaseVisibility('resize');
    });

    (function(){
      if (window.innerWidth <= 768) return;

      var wrap  = document.querySelector(".eye-desktop");
      if (!wrap) return;
      var eye   = qInner(wrap);
      if (!eye) return;


      var flowerWrap = document.querySelector(".flower");
      var flowerEl   = qInner(flowerWrap);
      var baseFlowerTf = flowerEl ? getComputedStyle(flowerEl).transform : '';
      if (baseFlowerTf === 'none') baseFlowerTf = '';


      var anchor = flowerEl || wrap;


      var curX = 0;
      var curY = 0;
      var targetX = 0;
      var targetY = 0;
      var idleTimer = null;

      var COEF = 0.015;
      var MAX = 5;
      var EASE = 0.16;


var SCALE_DURATION = 500;
var FLOWER_SCALE_DURATION = 1000;
var EYE_START_DELAY = 500;

var startTs = performance.now();
var scaleUni = 0;
var opacity = 0;


      var INTRO_DX = 5;
      var INTRO_DY = 4;

var INTRO_START_DELAY = EYE_START_DELAY + SCALE_DURATION + 1000;
      var INTRO_T_LEFT  = 500;
      var INTRO_T_RIGHT = 500;
      var INTRO_T_HOME  = 1000;

      var introX = 0;
      var introY = 0;
      var introTargetX = 0;
      var introTargetY = 0;
      var INTRO_EASE = 0.16;

      var introDone = false;
      var lastMouseEvent = null;

      function setIntroTarget(x, y) {
        introTargetX = x;
        introTargetY = y;
      }

      function runIntroRoll() {

        setTimeout(function(){
          setIntroTarget(-INTRO_DX, INTRO_DY);
        }, INTRO_START_DELAY);


        setTimeout(function(){
          setIntroTarget(INTRO_DX, INTRO_DY);
        }, INTRO_START_DELAY + INTRO_T_LEFT);


        setTimeout(function(){
          setIntroTarget(0, 0);
        }, INTRO_START_DELAY + INTRO_T_LEFT + INTRO_T_RIGHT);


        setTimeout(function(){
          introDone = true;

          introX = 0;
          introY = 0;
          introTargetX = 0;
          introTargetY = 0;

          if (lastMouseEvent) {
            applyMouse(lastMouseEvent);
          }
        }, INTRO_START_DELAY + INTRO_T_LEFT + INTRO_T_RIGHT + INTRO_T_HOME);
      }


      var blinkCur = 1;
      var blinkTgt = 1;

      var BLINK_MIN = 0.15;
      var BLINK_IN = 120;
      var BLINK_OUT = 180;
      var BLINK_EASE = 0.25;
      var IDLE_FLOAT_Y = 1.0;
      var IDLE_FLOAT_SPEED = 0.00100;

      var blinkTimeout = null;

      function scheduleIdleBlink(){
        clearTimeout(blinkTimeout);

        blinkTimeout = setTimeout(function(){
          blinkTgt = BLINK_MIN;

          setTimeout(function(){
            blinkTgt = 1;
            scheduleIdleBlink();
          }, BLINK_IN);
        }, 5000);
      }

      scheduleIdleBlink();

      function resetIdle(){
        clearTimeout(idleTimer);
        scheduleIdleBlink();
      }


      var wakeCur = 1;
      var wakeTgt = 1;
      var WAKE_EASE = 0.14;

      function triggerWake(){
        wakeTgt = 1.05;
        setTimeout(function(){
          wakeTgt = 1;
        }, 220);
      }


      var pressCur = 1;
      var pressTgt = 1;
      var PRESS_EASE = 0.28;

function triggerPress(){
  pressTgt = 0.94;
  setTimeout(function(){
    pressTgt = 1;
  }, 160);
}

function eyeGrowBounce(x){
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  var c1 = 1.08;
  var c3 = c1 + 1;

  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function animate(now){

var t = Math.min(1, Math.max(0, (now - startTs - EYE_START_DELAY) / SCALE_DURATION));
var eased = 1 - Math.pow(1 - t, 3);

scaleUni = eyeGrowBounce(t);
opacity = eased;
var flowerT = Math.min(1, (now - startTs) / FLOWER_SCALE_DURATION);
var flowerOpacity = 1 - Math.pow(1 - flowerT, 3);
var flowerScale = eyeGrowBounce(flowerT);

if (isEyeParallaxLocked()) {
  curX = 0;
  curY = 0;
  targetX = 0;
  targetY = 0;

  introX = 0;
  introY = 0;
  introTargetX = 0;
  introTargetY = 0;
}


curX += (targetX - curX) * EASE;
curY += (targetY - curY) * EASE;


        introX += (introTargetX - introX) * INTRO_EASE;
        introY += (introTargetY - introY) * INTRO_EASE;


        blinkCur += (blinkTgt - blinkCur) * BLINK_EASE;
        wakeCur  += (wakeTgt  - wakeCur ) * WAKE_EASE;
        pressCur += (pressTgt - pressCur) * PRESS_EASE;

        var common = wakeCur * pressCur;

        var sx = scaleUni * common;
        var sy = scaleUni * common * blinkCur;

        var idleFloatY = 0;

        if (!isEyeParallaxLocked() && introDone && opacity > 0.98) {
          idleFloatY = Math.sin(now * IDLE_FLOAT_SPEED) * IDLE_FLOAT_Y;
        }

        var finalX = curX + introX;
        var finalY = curY + introY + idleFloatY;

        eye.style.transform = "translate("+finalX+"px,"+finalY+"px) scale("+sx+","+sy+")";
        eye.style.opacity = String(opacity);

if (flowerEl){
  flowerEl.style.opacity = String(flowerOpacity);
  flowerEl.style.transform = (baseFlowerTf ? baseFlowerTf + ' ' : '') + "scale("+(flowerScale * common)+")";
}

        requestAnimationFrame(animate);
      }

requestAnimationFrame(animate);
runIntroRoll();

function runReturnIntroRoll(){
  introDone = false;
  lastMouseEvent = null;

  curX = 0;
  curY = 0;
  targetX = 0;
  targetY = 0;

  introX = 0;
  introY = 0;
  introTargetX = 0;
  introTargetY = 0;

  setIntroTarget(0, 0);

  setTimeout(function(){
    setIntroTarget(-INTRO_DX, INTRO_DY);
  }, 40);

  setTimeout(function(){
    setIntroTarget(INTRO_DX, INTRO_DY);
  }, 40 + INTRO_T_LEFT);

  setTimeout(function(){
    setIntroTarget(0, 0);
  }, 40 + INTRO_T_LEFT + INTRO_T_RIGHT);

  setTimeout(function(){
    introDone = true;

    introX = 0;
    introY = 0;
    introTargetX = 0;
    introTargetY = 0;

    if (lastMouseEvent) {
      applyMouse(lastMouseEvent);
    }
  }, 40 + INTRO_T_LEFT + INTRO_T_RIGHT + INTRO_T_HOME);
}

window.addEventListener('tc:eye-after-grow-roll', runReturnIntroRoll);

function applyMouse(e){
        var r = anchor.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top  + r.height / 2;

        var dx = (e.clientX - cx) * COEF;
        var dy = (e.clientY - cy) * COEF;

        if (dx >  MAX) dx =  MAX;
        if (dx < -MAX) dx = -MAX;
        if (dy >  MAX) dy =  MAX;
        if (dy < -MAX) dy = -MAX;

        targetX = dx;
        targetY = dy;

        idleTimer = setTimeout(function(){
          targetX = 0;
          targetY = 0;
        }, 500);
      }

function onMove(e){
  resetIdle();

  if (isEyeParallaxLocked()) {
    lastMouseEvent = null;
    toCenter();
    return;
  }

  lastMouseEvent = e;


  if (!introDone) return;

  applyMouse(e);
}

      function toCenter(){
        targetX = 0;
        targetY = 0;
      }


      eye.style.transform = "translate(0,0) scale(0)";
      eye.style.opacity = "0";

      document.addEventListener("mousemove", onMove);

      document.addEventListener("mouseleave", function(){
        toCenter();
        resetIdle();
      });

      window.addEventListener("blur", function(){
        toCenter();
        resetIdle();
      });


      if (window.matchMedia && window.matchMedia('(pointer:fine)').matches){
        wrap.addEventListener('click', function(){
          blinkTgt = 0.10;

          setTimeout(function(){
            blinkTgt = 1;
          }, BLINK_IN);

          triggerPress();
        });
      }


      document.addEventListener("visibilitychange", function(){
        if (document.visibilityState === 'visible') triggerWake();
      });

      window.addEventListener("focus", triggerWake);
      window.addEventListener("pageshow", triggerWake);
    })();


    (function(){
      if (window.innerWidth > 768) return;

      var wrap = document.querySelector(".eye-mobile");
      if (!wrap) return;

      var eye = qInner(wrap);
      if (!eye) return;


      var flowerWrap = document.querySelector(".flower");
      var flowerEl   = qInner(flowerWrap);
      var baseFlowerTf = flowerEl ? getComputedStyle(flowerEl).transform : '';

      if (baseFlowerTf === 'none') baseFlowerTf = '';


      var DX = 5;
      var DY = 4;


      var T1 = 500;
      var T2 = 500;
      var T3 = 500;
      var T4 = 1000;
var EYE_START_DELAY_MOBILE = 500;

      var BLINK_DELAY = 1000;
      var BLINK_IN = 120;
      var BLINK_OUT = 180;


      var blinkCur = 1;
      var blinkTgt = 1;
      var BLINK_EASE = 0.25;

      var wakeCur = 1;
      var wakeTgt = 1;
      var WAKE_EASE = 0.14;

      var idleBlinkTimeout = null;

      function scheduleIdleBlinkMobile(){
        clearTimeout(idleBlinkTimeout);

        idleBlinkTimeout = setTimeout(function(){
          blinkTgt = 0.15;

          setTimeout(function(){
            blinkTgt = 1;
            scheduleIdleBlinkMobile();
          }, BLINK_IN);
        }, 5000);
      }

      function resetIdleMobile(){
        clearTimeout(idleBlinkTimeout);
        scheduleIdleBlinkMobile();
      }


      eye.style.transition = "none";
      eye.style.transform  = "translate(0,0) scale(0)";
      eye.style.opacity    = "0";
if (flowerEl){
  flowerEl.style.transition = "none";
  flowerEl.style.opacity = "0";
  flowerEl.style.transform = (baseFlowerTf ? baseFlowerTf + ' ' : '') + "scale(0)";
}

      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          setTimeout(function(){


if (flowerEl){
  flowerEl.style.transition = "transform 0.34s cubic-bezier(.2,.9,.2,1), opacity 0.34s ease";
  flowerEl.style.opacity = "1";
  flowerEl.style.transform = (baseFlowerTf ? baseFlowerTf + ' ' : '') + "scale(1.08)";

  setTimeout(function(){
    flowerEl.style.transition = "transform 0.18s cubic-bezier(.25,.85,.25,1)";
    flowerEl.style.transform = (baseFlowerTf ? baseFlowerTf + ' ' : '') + "scale(1)";
  }, 340);
}

setTimeout(function(){
  eye.style.transition = "transform 0.34s cubic-bezier(.2,.9,.2,1), opacity 0.34s ease";
  eye.style.opacity = "1";
  eye.style.transform = "translate(0,0) scale(1.1)";

  setTimeout(function(){
    eye.style.transition = "transform 0.18s cubic-bezier(.25,.85,.25,1)";
    eye.style.transform = "translate(0,0) scale(1)";
  }, 340);
}, EYE_START_DELAY_MOBILE);

            setTimeout(function(){
              eye.style.transition = "transform "+(T2/1000)+"s ease";
              eye.style.transform = "translate("+(-DX)+"px,"+DY+"px) scale(1)";
}, EYE_START_DELAY_MOBILE + T1);


            setTimeout(function(){
              eye.style.transition = "transform "+(T3/1000)+"s ease";
              eye.style.transform = "translate("+DX+"px,"+DY+"px) scale(1)";
}, EYE_START_DELAY_MOBILE + T1 + T2);


            setTimeout(function(){
              eye.style.transition = "transform "+(T4/1000)+"s ease";
              eye.style.transform = "translate(0,0) scale(1)";
}, EYE_START_DELAY_MOBILE + T1 + T2 + T3);


            setTimeout(function(){
              eye.style.transition = "transform "+(BLINK_IN/1000)+"s ease";
              eye.style.transform = "translate(0,0) scale(1, 0.15)";

              setTimeout(function(){
                eye.style.transition = "transform "+(BLINK_OUT/1000)+"s ease";
                eye.style.transform = "translate(0,0) scale(1, 1)";
              }, BLINK_IN);
}, EYE_START_DELAY_MOBILE + T1 + T2 + T3 + T4 + BLINK_DELAY);


var START_SCROLL_AFTER = EYE_START_DELAY_MOBILE + T1 + T2 + T3 + T4 + BLINK_DELAY + BLINK_IN + BLINK_OUT + 80;

            setTimeout(function(){
              eye.style.transition = "none";

var curY = 0;
var targetY = 0;
var lastY = window.scrollY;
var resetTimer = null;

var rollX = 0;
var rollY = 0;
var rollTargetX = 0;
var rollTargetY = 0;
var rollActive = false;

var SCROLL_COEF = 0.15;
var SCROLL_MAX = 6;
var EASE = 0.18;
var ROLL_EASE = 0.16;

function setReturnRollTarget(x, y){
  rollTargetX = x;
  rollTargetY = y;
}

function runReturnIntroRollMobile(){
  rollActive = true;

  curY = 0;
  targetY = 0;
  lastY = window.scrollY;

  rollX = 0;
  rollY = 0;
  rollTargetX = 0;
  rollTargetY = 0;

  clearTimeout(resetTimer);

  setReturnRollTarget(0, 0);

  setTimeout(function(){
    setReturnRollTarget(-DX, DY);
  }, 40);

  setTimeout(function(){
    setReturnRollTarget(DX, DY);
  }, 40 + T2);

  setTimeout(function(){
    setReturnRollTarget(0, 0);
  }, 40 + T2 + T3);

  setTimeout(function(){
    rollActive = false;

    rollX = 0;
    rollY = 0;
    rollTargetX = 0;
    rollTargetY = 0;
  }, 40 + T2 + T3 + T4);
}

window.addEventListener('tc:eye-after-grow-roll', runReturnIntroRollMobile);

              function triggerWakeMob(){
                wakeTgt = 1.05;

                setTimeout(function(){
                  wakeTgt = 1;
                }, 220);
              }

              function userActivity(){
                resetIdleMobile();
              }

              window.addEventListener("scroll", userActivity, {passive:true});
              window.addEventListener("touchstart", userActivity, {passive:true});
              window.addEventListener("touchmove", userActivity, {passive:true});

              scheduleIdleBlinkMobile();

function raf(){
  if (isEyeParallaxLocked()) {
    curY = 0;
    targetY = 0;
    lastY = window.scrollY;

    blinkCur = 1;
    blinkTgt = 1;

    wakeCur = 1;
    wakeTgt = 1;

    clearTimeout(resetTimer);
    eye.style.transition = 'none';
  }

curY += (targetY - curY) * EASE;

rollX += (rollTargetX - rollX) * ROLL_EASE;
rollY += (rollTargetY - rollY) * ROLL_EASE;

blinkCur += (blinkTgt - blinkCur) * BLINK_EASE;
wakeCur  += (wakeTgt  - wakeCur ) * WAKE_EASE;

var finalX = rollX;
var finalY = curY + rollY;

eye.style.transform = "translate("+finalX+"px,"+finalY+"px) scale("+wakeCur+","+(wakeCur*blinkCur)+")";

                if (flowerEl){
                  flowerEl.style.transform = (baseFlowerTf ? baseFlowerTf + ' ' : '') + "scale("+wakeCur+")";
                }

                requestAnimationFrame(raf);
              }

              requestAnimationFrame(raf);


              var lastTapTs = 0;

function tapPulse(){
  if (isEyeParallaxLocked()) return;

  blinkTgt = 0.15;

                setTimeout(function(){
                  blinkTgt = 1;
                }, BLINK_IN);

                wakeTgt = 0.94;

                setTimeout(function(){
                  wakeTgt = 1;
                }, 180);
              }

              function handleTapOnce(){
                var now = Date.now();

                if (now - lastTapTs < 300) return;

                lastTapTs = now;
                tapPulse();
              }

              [wrap, flowerEl].forEach(function(el){
                if (!el) return;

                el.addEventListener('touchstart', handleTapOnce, {passive:true});
                el.addEventListener('click', handleTapOnce);
              });

function onScroll(){
  if (rollActive) {
    targetY = 0;
    lastY = window.scrollY;
    clearTimeout(resetTimer);
    return;
  }

  if (isEyeParallaxLocked()) {
    targetY = 0;
    lastY = window.scrollY;
    clearTimeout(resetTimer);
    return;
  }

  var y = window.scrollY;
  var dy = y - lastY;

                lastY = y;

                var add = dy * SCROLL_COEF;
                targetY += add;

                if (targetY >  SCROLL_MAX) targetY =  SCROLL_MAX;
                if (targetY < -SCROLL_MAX) targetY = -SCROLL_MAX;

                clearTimeout(resetTimer);

                resetTimer = setTimeout(function(){
                  targetY = 0;
                }, 140);
              }

              window.addEventListener("scroll", onScroll, {passive:true});

              function onResize(){
                if (window.innerWidth > 768){
                  window.removeEventListener("scroll", onScroll);
                  window.removeEventListener("resize", onResize);
                  window.removeEventListener("scroll", userActivity);
                  window.removeEventListener("touchstart", userActivity);
                  window.removeEventListener("touchmove", userActivity);
                }
              }

              window.addEventListener("resize", onResize);

              document.addEventListener("visibilitychange", function(){
                if (document.visibilityState === 'visible') triggerWakeMob();
              });

              window.addEventListener("focus", triggerWakeMob);
              window.addEventListener("pageshow", triggerWakeMob);
            }, START_SCROLL_AFTER);
          }, 20);
        });
      });
    })();
  });
})();

(function(){
  "use strict";

  if (window.__TC_USER_PHOTOS_TITLE_WIDTH_BOUND_V2__) return;
  window.__TC_USER_PHOTOS_TITLE_WIDTH_BOUND_V2__ = true;

  function logDebug(){
    if (!window.__TC_DEBUG_COMMUNITY_ALIGN__) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[TC community align]');
    console.log.apply(console, args);
  }

  function normText(s){
    return (s || "").replace(/\s+/g, " ").trim().toUpperCase();
  }

  function findByText(selector, expected){
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      if (normText(nodes[i].textContent).indexOf(expected) !== -1) return nodes[i];
    }
    return null;
  }

  function getTitleAndBottom(){
    var selector = 'h1,h2,h3,[data-field="text"],.tn-atom,.t-title,.t-descr,.t-text';
    var titleNode = findByText(selector, ':: C0MMUN1TY ::');
    var bottomNode = findByText(selector, 'ПО ЛЮБЫМ ВОПРОСАМ И ДЛЯ ЗАКАЗА');
    return { titleNode: titleNode, bottomNode: bottomNode };
  }

  function scaleBottomText(bottomNode, titleWidth){
    if (!bottomNode || !titleWidth) return null;

    var atom = bottomNode.classList && bottomNode.classList.contains('tn-atom')
      ? bottomNode
      : (bottomNode.querySelector ? bottomNode.querySelector('.tn-atom') : null) || bottomNode;

    if (!atom || !atom.getBoundingClientRect) return null;

    if (!atom.dataset.tcBaseFontSize) {
      var initialBase = parseFloat(window.getComputedStyle(atom).fontSize) || 16;
      atom.dataset.tcBaseFontSize = String(initialBase);
    }

    var base = parseFloat(atom.dataset.tcBaseFontSize) || 16;
    atom.style.fontSize = base + 'px';
    atom.style.width = '';
    atom.style.transform = '';
    atom.style.transformOrigin = '';
    atom.style.whiteSpace = 'nowrap';
    atom.style.textAlign = 'center';
    atom.style.marginLeft = 'auto';
    atom.style.marginRight = 'auto';

    var beforeRect = atom.getBoundingClientRect();
    var beforeWidth = beforeRect && beforeRect.width ? beforeRect.width : 0;
    if (!beforeWidth) return null;

    var scale = titleWidth / beforeWidth;
    var isMobile = window.innerWidth <= 768;
    var minSize = isMobile ? 10 : 12;
    var maxSize = isMobile ? 34 : 56;
    var nextSize = Math.max(minSize, Math.min(maxSize, base * scale));

    atom.style.fontSize = nextSize + 'px';

    var afterWidth = atom.getBoundingClientRect().width || 0;
    var appliedScaleX = 1;
    if (afterWidth && titleWidth) {
      var finalRatio = titleWidth / afterWidth;
      if (Math.abs(1 - finalRatio) > 0.05) {
        appliedScaleX = Math.max(0.85, Math.min(1.35, finalRatio));
        atom.style.transformOrigin = 'center center';
        atom.style.transform = 'scaleX(' + appliedScaleX.toFixed(3) + ')';
      }
    }

    if (atom.parentElement) {
      atom.parentElement.classList.add('tc-user-photos-title-width-target');
    }

    logDebug(
      'titleWidth=', Math.round(titleWidth),
      'bottomBefore=', Math.round(beforeWidth),
      'bottomAfterFontSize=', Math.round(afterWidth),
      'fontSize=', nextSize.toFixed(2),
      'scaleX=', appliedScaleX.toFixed(3)
    );

    return atom;
  }

  function getSocRank(node){
    var classes = (node.className || '').split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      var m = /^soc([1-4])$/.exec(classes[i]);
      if (m) return parseInt(m[1], 10);
    }
    return 99;
  }

  function alignIcons(bottomAtom, titleRect){
    if (!bottomAtom || !titleRect || !titleRect.width) return;

    var bottomRect = bottomAtom.getBoundingClientRect();
    var allIcons = Array.prototype.slice.call(document.querySelectorAll('.soc1, .soc2, .soc3, .soc4'));
    var candidates = allIcons.filter(function(node){
      var r = node.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top > (bottomRect.bottom - 20);
    });

    if (!candidates.length) return;

    candidates.sort(function(a, b){
      var ra = getSocRank(a);
      var rb = getSocRank(b);
      if (ra !== rb) return ra - rb;
      return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
    });

    var icons = candidates.slice(0, 4);
    var fractions = [0.125, 0.375, 0.625, 0.875];
    var debugIcons = [];

    for (var i = 0; i < icons.length; i++) {
      var icon = icons[i];
      var rect = icon.getBoundingClientRect();
      var desiredCenter = titleRect.left + (titleRect.width * (fractions[i] || 0.5));
      var currentCenter = rect.left + rect.width / 2;
      var dx = desiredCenter - currentCenter;

      if (!icon.dataset.tcBaseTransform) {
        icon.dataset.tcBaseTransform = icon.style.transform || '';
      }
      var baseTf = icon.dataset.tcBaseTransform;
      icon.style.transform = (baseTf ? (baseTf + ' ') : '') + 'translateX(' + dx.toFixed(2) + 'px)';
      icon.style.setProperty('--tc-community-icon-dx', dx.toFixed(2) + 'px');
      icon.classList.add('tc-community-icon-align');

      debugIcons.push((icon.className || '').trim() + ':dx=' + dx.toFixed(2));
    }

    logDebug('icons=', debugIcons.join(', '));
  }

  function bindCommunityWidth(){
    var refs = getTitleAndBottom();
    if (!refs.titleNode || !refs.bottomNode) return;

    var titleRect = refs.titleNode.getBoundingClientRect();
    if (!titleRect || !titleRect.width) return;

    var width = Math.round(titleRect.width);
    document.documentElement.style.setProperty('--tc-user-photos-title-width', width + 'px');

    var bottomAtom = scaleBottomText(refs.bottomNode, titleRect.width);
    alignIcons(bottomAtom, titleRect);
  }

  function scheduleBind(delay){
    setTimeout(bindCommunityWidth, delay || 0);
  }

  var resizeTimer = null;

  document.addEventListener('DOMContentLoaded', function(){
    scheduleBind(0);
    scheduleBind(120);
    scheduleBind(360);
    scheduleBind(800);
  });

  window.addEventListener('load', function(){
    scheduleBind(0);
    scheduleBind(180);
    scheduleBind(520);
  });

  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(bindCommunityWidth, 120);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function(){
      scheduleBind(0);
      scheduleBind(180);
    });
  }
})();

(function(){
  if (window.__TC_FLOWER_DESKTOP_DRAG_V1__) return;
  window.__TC_FLOWER_DESKTOP_DRAG_V1__ = true;

  if (!window.matchMedia || !window.matchMedia('(min-width:769px) and (pointer:fine)').matches) {
    return;
  }

  function ready(fn){
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function getBaseTransform(el){
    var tf = window.getComputedStyle(el).transform;
    return tf && tf !== 'none' ? tf : '';
  }

  function isLocked(){
    return (
      window.__TC_EYE_PARALLAX_LOCKED__ === true ||
      document.body.classList.contains('tc-eye-parallax-locked') ||
      document.body.classList.contains('egg-on') ||
      document.body.classList.contains('egg-returning')
    );
  }

  ready(function(){
    var flower = document.querySelector('.flower');
    var eye = document.querySelector('.eye-desktop');

    if (!flower || !eye) return;

    var parts = [flower, eye];

    var baseTransforms = new Map();

    parts.forEach(function(el){
      baseTransforms.set(el, getBaseTransform(el));
      el.style.transformOrigin = 'center center';
      el.style.willChange = 'transform';
    });

    var dragging = false;
    var returning = false;
    var holdScale = 1;
    var holdScaleTarget = 1;
    var HOLD_SCALE_PRESSED = 0.965;
    var HOLD_SCALE_EASE = 0.22;

    var startX = 0;
    var startY = 0;
    var downX = 0;
    var downY = 0;

    var posX = 0;
    var posY = 0;
    var dragStartX = 0;
    var dragStartY = 0;

var lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

function getScrollY(){
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function syncDragWithPageScroll(){
  var y = getScrollY();
  var delta = y - lastScrollY;

  lastScrollY = y;

  if (!dragging || delta === 0) return;

  /*
    Manual wheel/trackpad scroll does not fire pointermove.
    So we compensate element transform manually.
  */
  dragStartY += delta;
  posY += delta;

  startLoop();
}

    var returnFromX = 0;
    var returnFromY = 0;
    var returnStartTime = 0;

    var raf = 0;
    var suppressClickUntil = 0;
    var movedEnough = false;

    var previousEyeLock = false;
var eyeLagX = 0;
var eyeLagY = 0;
var eyeLagVX = 0;
var eyeLagVY = 0;
var eyeDragJitterX = 0;
var eyeDragJitterY = 0;
var eyeDragJitterRot = 0;
var EYE_DRAG_JITTER_EASE = 0.22;
var EYE_DRAG_JITTER_X = 0.45;
var EYE_DRAG_JITTER_Y = 0.34;
var EYE_DRAG_JITTER_ROT = 0.26;

var lastEyeLagTime = 0;
var lastEyeLagPosX = 0;
var lastEyeLagPosY = 0;

/*
  Pupil drag inertia:
  EYE_LAG_MAX = max extra pupil offset in px.
  EYE_LAG_PULL = how strongly pupil reacts to fast dragging.
  STIFFNESS/DAMPING = spring feel.
*/
var EYE_LAG_MAX = 6;
var EYE_LAG_PULL = 0.012;
var EYE_LAG_STIFFNESS = 72;
var EYE_LAG_DAMPING = 9.5;

function clampEyeLag(value, min, max){
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function resetEyeLag(){
  eyeLagX = 0;
  eyeLagY = 0;
  eyeLagVX = 0;
  eyeLagVY = 0;
  lastEyeLagTime = 0;
  lastEyeLagPosX = posX;
  lastEyeLagPosY = posY;
}

function startEyeLagSession(){
  resetEyeLag();
}

function updateEyeLag(time, active){
  var dt = lastEyeLagTime
    ? Math.min(0.032, (time - lastEyeLagTime) / 1000)
    : 0.016;

  lastEyeLagTime = time;

  var dx = posX - lastEyeLagPosX;
  var dy = posY - lastEyeLagPosY;

  lastEyeLagPosX = posX;
  lastEyeLagPosY = posY;

  var targetX = 0;
  var targetY = 0;

  if (active && dt > 0) {
    var vx = dx / dt;
    var vy = dy / dt;

    /*
      When flower moves right, pupil lags left.
      When movement stops, spring carries it forward and pulls it back.
    */
    targetX = clampEyeLag(-vx * EYE_LAG_PULL, -EYE_LAG_MAX, EYE_LAG_MAX);
    targetY = clampEyeLag(-vy * EYE_LAG_PULL, -EYE_LAG_MAX, EYE_LAG_MAX);
  }

  var ax = (targetX - eyeLagX) * EYE_LAG_STIFFNESS - eyeLagVX * EYE_LAG_DAMPING;
  var ay = (targetY - eyeLagY) * EYE_LAG_STIFFNESS - eyeLagVY * EYE_LAG_DAMPING;

  eyeLagVX += ax * dt;
  eyeLagVY += ay * dt;

  eyeLagX += eyeLagVX * dt;
  eyeLagY += eyeLagVY * dt;

  if (
    !active &&
    Math.abs(eyeLagX) < 0.02 &&
    Math.abs(eyeLagY) < 0.02 &&
    Math.abs(eyeLagVX) < 0.02 &&
    Math.abs(eyeLagVY) < 0.02
  ) {
    eyeLagX = 0;
    eyeLagY = 0;
    eyeLagVX = 0;
    eyeLagVY = 0;
  }
}

function updateEyeDragJitter(time, active){
  var targetX = 0;
  var targetY = 0;
  var targetRot = 0;

  if (active) {
    targetX =
      Math.sin(time * 0.091) * EYE_DRAG_JITTER_X +
      Math.sin(time * 0.047) * 0.18;

    targetY =
      Math.cos(time * 0.083) * EYE_DRAG_JITTER_Y +
      Math.sin(time * 0.061) * 0.14;

    targetRot = Math.sin(time * 0.073) * EYE_DRAG_JITTER_ROT;
  }

  eyeDragJitterX += (targetX - eyeDragJitterX) * EYE_DRAG_JITTER_EASE;
  eyeDragJitterY += (targetY - eyeDragJitterY) * EYE_DRAG_JITTER_EASE;
  eyeDragJitterRot += (targetRot - eyeDragJitterRot) * EYE_DRAG_JITTER_EASE;

  if (!active) {
    if (Math.abs(eyeDragJitterX) < 0.01) eyeDragJitterX = 0;
    if (Math.abs(eyeDragJitterY) < 0.01) eyeDragJitterY = 0;
    if (Math.abs(eyeDragJitterRot) < 0.01) eyeDragJitterRot = 0;
  }
}
/* Auto-scroll while dragging flower near viewport edges */
var dragClientY = 0;

var AUTO_SCROLL_EDGE = 110;
var AUTO_SCROLL_MAX_SPEED = 9;

function updateDragAutoScroll(){
  if (!dragging) return;

  var viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
  if (!viewportH) return;

  var power = 0;

  if (dragClientY > viewportH - AUTO_SCROLL_EDGE) {
    power = (dragClientY - (viewportH - AUTO_SCROLL_EDGE)) / AUTO_SCROLL_EDGE;
  } else if (dragClientY < AUTO_SCROLL_EDGE) {
    power = -((AUTO_SCROLL_EDGE - dragClientY) / AUTO_SCROLL_EDGE);
  }

  if (power > 1) power = 1;
  if (power < -1) power = -1;

  if (Math.abs(power) < 0.03) return;

  var prevScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var scrollAmount = power * AUTO_SCROLL_MAX_SPEED;

  window.scrollBy(0, scrollAmount);

  var nextScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var actualScroll = nextScrollY - prevScrollY;

  /*
    Important:
    when page scrolls, the element's document position shifts visually.
    We compensate dragStartY/posY so the flower stays under the cursor.
  */
  if (actualScroll !== 0) {
    dragStartY += actualScroll;
    posY += actualScroll;
  }
}
    var liftedRoots = [];

    function addLiftRoot(el, className){
      if (!el || liftedRoots.indexOf(el) !== -1) return;

      liftedRoots.push(el);
      el.classList.add(className);
    }

    function releaseFlowerFront(){
      liftedRoots.forEach(function(el){
        el.classList.remove('tc-flower-rec-front');
        el.classList.remove('tc-flower-artboard-front');
      });

      liftedRoots = [];
    }

    function liftFlowerToFront(){
      releaseFlowerFront();

      parts.forEach(function(el){
        if (!el || !el.closest) return;

        addLiftRoot(el.closest('.t-rec'), 'tc-flower-rec-front');
        addLiftRoot(el.closest('.t396__artboard'), 'tc-flower-artboard-front');
      });
    }

    var RETURN_TIME = 1200;
    var MOVE_THRESHOLD = 4;

    function magneticReturnFactor(t){
      if (t >= 1) return 0;


      var envelope = Math.pow(1 - t, 2.15);
      var wave = Math.cos(t * Math.PI * 4.5);
      var f = envelope * wave;

      if (f < 0) {
        f *= 0.5;
      }

      return f;
    }

function applyTransform(x, y, shakeX, shakeY, rot){
  parts.forEach(function(el){
    var base = baseTransforms.get(el);

    /*
      Extra inertia only for pupil layer.
      Flower keeps original drag position.
    */
    var extraX = el === eye ? eyeLagX + eyeDragJitterX : 0;
    var extraY = el === eye ? eyeLagY + eyeDragJitterY : 0;
    var extraRot = el === eye ? eyeDragJitterRot : 0;

    var transform =
      'translate3d(' + (x + shakeX + extraX).toFixed(2) + 'px,' + (y + shakeY + extraY).toFixed(2) + 'px,0) ' +
      'rotate(' + (rot + extraRot).toFixed(3) + 'deg) ' +
      'scale(' + holdScale.toFixed(4) + ')';

    el.style.transform = (base ? base + ' ' : '') + transform;
  });
}

function updateHoldScale(){
  holdScale += (holdScaleTarget - holdScale) * HOLD_SCALE_EASE;

  if (Math.abs(holdScale - holdScaleTarget) < 0.001) {
    holdScale = holdScaleTarget;
  }
}

    function startLoop(){
      if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    }

    function loop(time){
      raf = 0;

if (dragging) {
  updateDragAutoScroll();
  updateEyeLag(time, true);
  updateEyeDragJitter(time, true);
  updateHoldScale();

  var shakeX =
          Math.sin(time * 0.052) * 1.35 +
          Math.sin(time * 0.109) * 0.45;

        var shakeY =
          Math.cos(time * 0.061) * 1.15 +
          Math.sin(time * 0.083) * 0.35;

        var rot = Math.sin(time * 0.045) * 0.75;

        applyTransform(posX, posY, shakeX, shakeY, rot);
        startLoop();
        return;
      }

      if (returning) {
        var t = Math.min(1, (time - returnStartTime) / RETURN_TIME);
        var f = magneticReturnFactor(t);

        posX = returnFromX * f;
        posY = returnFromY * f;
        /*
          Keep pupil inertia velocity-driven during magnetic return too,
          so the eye lags behind the returning flower instead of snapping flat.
        */
        updateEyeLag(time, true);
        updateEyeDragJitter(time, false);
        updateHoldScale();
        applyTransform(posX, posY, 0, 0, 0);

        if (t < 1) {
          startLoop();
        } else {
          returning = false;
posX = 0;
posY = 0;
holdScale = 1;
holdScaleTarget = 1;
resetEyeLag();
eyeDragJitterX = 0;
eyeDragJitterY = 0;
eyeDragJitterRot = 0;
applyTransform(0, 0, 0, 0, 0);

          document.body.classList.remove('tc-flower-returning');
          releaseFlowerFront();

          if (!previousEyeLock) {
            window.__TC_EYE_PARALLAX_LOCKED__ = false;
            document.body.classList.remove('tc-eye-parallax-locked');
          }
        }
      }
    }

    function startDrag(e){
      if (e.button !== 0) return;
      if (isLocked()) return;

      var target = e.target && e.target.closest && e.target.closest('.flower, .eye-desktop');
      if (!target) return;

      previousEyeLock = window.__TC_EYE_PARALLAX_LOCKED__ === true;

      window.__TC_EYE_PARALLAX_LOCKED__ = true;
      document.body.classList.add('tc-eye-parallax-locked');

      dragging = true;
      holdScaleTarget = HOLD_SCALE_PRESSED;
      returning = false;
      movedEnough = false;

      startX = e.clientX;
      startY = e.clientY;
      downX = e.clientX;
      downY = e.clientY;
dragClientY = e.clientY;

dragStartX = posX;
dragStartY = posY;
lastScrollY = getScrollY();

startEyeLagSession();


      document.body.classList.remove('tc-flower-returning');
      document.body.classList.add('tc-flower-dragging');

      liftFlowerToFront();

      e.preventDefault();
      startLoop();
    }

function moveDrag(e){
  if (!dragging) return;

  dragClientY = e.clientY;

  var dx = e.clientX - startX;
      var dy = e.clientY - startY;

      posX = dragStartX + dx;
      posY = dragStartY + dy;

      if (
        Math.abs(e.clientX - downX) > MOVE_THRESHOLD ||
        Math.abs(e.clientY - downY) > MOVE_THRESHOLD
      ) {
        movedEnough = true;
      }

      e.preventDefault();
      startLoop();
    }

    function endDrag(){
      if (!dragging) return;

      dragging = false;
      holdScaleTarget = 1;
      returning = true;
dragClientY = 0;

      document.body.classList.remove('tc-flower-dragging');
      document.body.classList.add('tc-flower-returning');

      returnFromX = posX;
      returnFromY = posY;
      returnStartTime = performance.now();

      if (movedEnough) {
        suppressClickUntil = Date.now() + 450;
      }

      startLoop();
    }

    document.addEventListener('pointerdown', startDrag, true);
    window.addEventListener('pointermove', moveDrag, { passive:false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    window.addEventListener('blur', endDrag);
    window.addEventListener('scroll', syncDragWithPageScroll, { passive: true });

    document.addEventListener('click', function(e){
      if (Date.now() > suppressClickUntil) return;

      var target = e.target && e.target.closest && e.target.closest('.flower, .eye-desktop');
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }, true);
  });
})();

(function(){
  ['.eye-desktop', '.eye-mobile', '.flower'].forEach(function(sel){
    var el = document.querySelector(sel);

    if(!el) return;

    el.addEventListener('selectstart', function(e){
      e.preventDefault();
    });

    el.addEventListener('dragstart', function(e){
      e.preventDefault();
    });

    el.addEventListener('mousedown', function(e){
      e.preventDefault();
    });

    el.addEventListener('contextmenu', function(e){
      e.preventDefault();
    }, {passive:false});

    el.querySelectorAll('img, svg').forEach(function(node){
      node.setAttribute('draggable','false');

      node.addEventListener('contextmenu', function(e){
        e.preventDefault();
      }, {passive:false});
    });
  });
})();

(function () {
  if (window.__TC_PREVENT_FLOWER_MOBILE_MENU_V1__) return;
  window.__TC_PREVENT_FLOWER_MOBILE_MENU_V1__ = true;

  function matchFlowerTarget(target) {
    return (
      target &&
      target.closest &&
      target.closest('.flower, .eye-desktop, .eye-mobile')
    );
  }

  function preventNativeMenu(e) {
    if (!matchFlowerTarget(e.target)) return;

    e.preventDefault();
    e.stopPropagation();
  }

  /*
    Самое важное:
    contextmenu — именно то событие, которое Chrome/Android вызывает
    после долгого зажатия картинки.
  */
  document.addEventListener('contextmenu', preventNativeMenu, {
    capture: true
  });

  document.addEventListener('dragstart', preventNativeMenu, {
    capture: true
  });

  document.addEventListener('selectstart', preventNativeMenu, {
    capture: true
  });

  /*
    Мобильный страховочный слой.
    Не ставим stopImmediatePropagation, чтобы твоя пасхалка по touchstart
    продолжала получать касания.
  */
  document.addEventListener('touchstart', function (e) {
    if (!matchFlowerTarget(e.target)) return;

    e.preventDefault();
  }, {
    passive: false,
    capture: true
  });

  /*
    Запрещаем браузеру считать внутренние img/svg перетаскиваемыми.
  */
  function hardenFlowerAssets() {
    document
      .querySelectorAll('.flower img, .flower svg, .eye-desktop img, .eye-desktop svg, .eye-mobile img, .eye-mobile svg')
      .forEach(function (node) {
        node.setAttribute('draggable', 'false');
        node.setAttribute('aria-hidden', 'true');

        node.style.webkitUserDrag = 'none';
        node.style.userDrag = 'none';
        node.style.webkitTouchCallout = 'none';
        node.style.webkitUserSelect = 'none';
        node.style.userSelect = 'none';
      });
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hardenFlowerAssets);
  } else {
    hardenFlowerAssets();
  }

  window.addEventListener('load', hardenFlowerAssets);

  if (window.MutationObserver) {
    var observer = new MutationObserver(hardenFlowerAssets);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
})();

(function () {
  if (window.__TC_WELCOME_TYPE_V2__) return;
  window.__TC_WELCOME_TYPE_V2__ = true;

  window.__TC_WELCOME_FINISHED__ = false;

  var SEL_WELCOME = '.uc-tw-welcome, .tw-welcome';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function sleep(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  function announceDone() {
    window.__TC_WELCOME_FINISHED__ = true;

    try {
      window.dispatchEvent(new CustomEvent('tc:welcome-done'));
    } catch (e) {
      var ev = document.createEvent('Event');
      ev.initEvent('tc:welcome-done', true, true);
      window.dispatchEvent(ev);
    }
  }

  function waitFor(selector, timeout) {
    return new Promise(function(resolve) {
      var first = document.querySelector(selector);
      if (first) return resolve(first);

      var done = false;

      var mo = new MutationObserver(function() {
        var el = document.querySelector(selector);
        if (el) {
          done = true;
          mo.disconnect();
          resolve(el);
        }
      });

      mo.observe(document.documentElement, {
        childList: true,
        subtree: true
      });

      if (timeout) {
        setTimeout(function() {
          if (done) return;
          mo.disconnect();
          resolve(null);
        }, timeout);
      }
    });
  }

  function getTextNode(root) {
    if (!root) return null;

    return root.querySelector(
      '[field="text"], .t-descr, .t-text, .t-title, .t-name, .tn-atom, h1, h2, h3, p, div'
    );
  }

  async function typeInto(node, text, speed) {
    node.style.visibility = 'visible';
    node.classList.add('tw-printing');
    node.textContent = '';

    for (var i = 0; i <= text.length; i++) {
      node.textContent = text.slice(0, i);

      if (i < text.length) {
        await sleep(speed + Math.random() * speed * 0.25);
      }
    }
  }

  async function run() {
    var welcomeBlock = await waitFor(SEL_WELCOME, 8000);

    if (!welcomeBlock) {
      announceDone();
      return;
    }

    var textNode = getTextNode(welcomeBlock);

    if (!textNode) {
      announceDone();
      return;
    }

    var text = (
      textNode.getAttribute('data-tc-welcome-text') ||
      textNode.textContent ||
      ''
    ).trim();

    textNode.setAttribute('data-tc-welcome-text', text);


    await sleep(650);

    await typeInto(textNode, text, 50);

    await sleep(140);

    announceDone();
  }

  ready(run);
})();

(function(){
  var NEED = 10;
  var count = 0;
  var lastTouch = 0;
  var armed = false;

  var eggActive = false;
  var eggTimer = null;
  var eggReturnTimer = null;
  var eyeUnlockTimer = null;
  var eyeGrowTimer = null;
  var eyeGrowEndTimer = null;

  var EGG_HOLD_TIME = 5000;
  var EGG_RETURN_TIME = 1000;
  var EGG_FALL_TIME = 900;
  var EGG_EYE_FALL_DELAY = 150;
  var EGG_EYE_FALL_TIME = 960;
  var EGG_PRE_FALL_TIME = 136;

  var EYE_APPEAR_DELAY_AFTER_RETURN = 500;
  var EYE_GROW_TIME = 560;

  function q(s) {
    return document.querySelector(s);
  }

  function lockEyeParallax() {
    clearTimeout(eyeUnlockTimer);
    window.__TC_EYE_PARALLAX_LOCKED__ = true;
    document.body.classList.add('tc-eye-parallax-locked');
  }

  function unlockEyeParallax() {
    window.__TC_EYE_PARALLAX_LOCKED__ = false;
    document.body.classList.remove('tc-eye-parallax-locked');
  }

  function forceEyeCenter() {
    if (window.__TC_FORCE_EYE_CENTER__) {
      window.__TC_FORCE_EYE_CENTER__();
    }
  }

  function hardHideEyeForReturn() {
    clearTimeout(eyeGrowTimer);
    clearTimeout(eyeGrowEndTimer);

    document.body.classList.remove('tc-eye-grow-after-egg');
    document.body.classList.add('tc-eye-hard-hidden');

    forceEyeCenter();
  }

  function startEyeGrowAfterReturn() {
    forceEyeCenter();

    document.body.classList.remove('tc-eye-hard-hidden');

    requestAnimationFrame(function(){
      document.body.classList.add('tc-eye-grow-after-egg');
    });

    clearTimeout(eyeGrowEndTimer);
    eyeGrowEndTimer = setTimeout(function(){
      document.body.classList.remove('tc-eye-grow-after-egg');
      forceEyeCenter();
    }, EYE_GROW_TIME + 80);
  }

  function isVisibleElement(el) {
    if (!el) return false;

    var r = el.getBoundingClientRect();
    var st = window.getComputedStyle(el);

    return (
      r.width > 1 &&
      r.height > 1 &&
      st.display !== 'none' &&
      st.visibility !== 'hidden' &&
      Number(st.opacity) !== 0
    );
  }

  function removeFallOverlay() {
    var old = q('#tc-egg-fall-overlay');

    if (old && old.parentNode) {
      old.parentNode.removeChild(old);
    }
  }

  function restoreOriginalLogo() {
    document.querySelectorAll('.tc-egg-original-hidden').forEach(function(el){
      el.classList.remove('tc-egg-original-hidden');
    });
  }

  function clearFallOverlay() {
    removeFallOverlay();
    restoreOriginalLogo();
  }

function createFallOverlay() {
  clearFallOverlay();

  var overlay = document.createElement('div');
  overlay.id = 'tc-egg-fall-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  document.body.appendChild(overlay);

  ['.flower', '.eye-desktop', '.eye-mobile'].forEach(function(sel){
    var el = q(sel);

    if (!isVisibleElement(el)) return;

    var r = el.getBoundingClientRect();
    var clone = el.cloneNode(true);

    clone.classList.add('tc-egg-fall-piece');

    if (sel === '.flower') {
      clone.classList.add('tc-egg-fall-flower');
    } else {
      clone.classList.add('tc-egg-fall-eye');
    }

    /*
      КРИТИЧНО:
      убираем оригинальные классы, иначе body.tc-eye-hard-hidden
      прячет падающий клон зрачка вместе с настоящим зрачком.
    */
    clone.classList.remove('flower');
    clone.classList.remove('eye-desktop');
    clone.classList.remove('eye-mobile');

    clone.removeAttribute('id');

    clone.querySelectorAll('[id]').forEach(function(node){
      node.removeAttribute('id');
    });

    clone.querySelectorAll('.tn-atom, img, svg').forEach(function(node){
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.pointerEvents = 'none';
      node.style.animation = 'none';
      node.style.transition = 'none';
    });

    clone.style.cssText =
      'position:fixed !important;' +
      'left:' + r.left + 'px !important;' +
      'top:' + r.top + 'px !important;' +
      'width:' + r.width + 'px !important;' +
      'height:' + r.height + 'px !important;' +
      'margin:0 !important;' +
      'z-index:' + (sel === '.flower' ? '2147483000' : '2147483004') + ' !important;' +
      'pointer-events:none !important;' +
      'opacity:1 !important;' +
      'visibility:visible !important;';

    overlay.appendChild(clone);

    el.classList.add('tc-egg-original-hidden');
  });

  setTimeout(
    removeFallOverlay,
    Math.max(EGG_FALL_TIME, EGG_EYE_FALL_DELAY + EGG_EYE_FALL_TIME) + 240
  );
}

  function setImportant(el, prop, value) {
    if (!el) return;
    el.style.setProperty(prop, value, 'important');
  }

  function showRedEasterLayer() {
    var easter = document.querySelector('.easter');
    if (!easter) return;

    setImportant(easter, 'visibility', 'visible');
    setImportant(easter, 'opacity', '1');
    setImportant(easter, 'pointer-events', 'none');

    easter.querySelectorAll('.tn-atom, img, svg').forEach(function(el){
      setImportant(el, 'visibility', 'visible');
      setImportant(el, 'pointer-events', 'none');
    });
  }

  function releaseRedEasterLayer() {
    var easter = document.querySelector('.easter');
    if (!easter) return;

    easter.style.removeProperty('visibility');
    easter.style.removeProperty('opacity');
    easter.style.removeProperty('pointer-events');

    easter.querySelectorAll('.tn-atom, img, svg').forEach(function(el){
      el.style.removeProperty('visibility');
      el.style.removeProperty('opacity');
      el.style.removeProperty('pointer-events');
    });
  }

  function match(node) {
    return node && node.closest && node.closest('.flower, .eye-desktop, .eye-mobile');
  }

  function hideEgg() {
    if (!eggActive) return;

    lockEyeParallax();
    hardHideEyeForReturn();

    document.body.classList.add('egg-returning');

    removeFallOverlay();

    forceEyeCenter();


    restoreOriginalLogo();

    clearTimeout(eggReturnTimer);
    clearTimeout(eyeUnlockTimer);
    clearTimeout(eyeGrowTimer);
    clearTimeout(eyeGrowEndTimer);

    eggReturnTimer = setTimeout(function(){
      forceEyeCenter();

      document.body.classList.remove('egg-on');
      document.body.classList.remove('egg-returning');
      releaseRedEasterLayer();

      eggActive = false;


      eyeGrowTimer = setTimeout(function(){
        startEyeGrowAfterReturn();
      }, EYE_APPEAR_DELAY_AFTER_RETURN);
    }, EGG_RETURN_TIME);


eyeUnlockTimer = setTimeout(function(){
  forceEyeCenter();
  unlockEyeParallax();

  try {
    window.dispatchEvent(new CustomEvent('tc:eye-after-grow-roll'));
  } catch (e) {
    var ev = document.createEvent('Event');
    ev.initEvent('tc:eye-after-grow-roll', true, true);
    window.dispatchEvent(ev);
  }
}, EGG_RETURN_TIME + EYE_APPEAR_DELAY_AFTER_RETURN + EYE_GROW_TIME + 180);
  }

  function showEgg() {
    if (eggActive) return;

    eggActive = true;
    count = 0;

    clearTimeout(eggTimer);
    clearTimeout(eggReturnTimer);
    clearTimeout(eyeUnlockTimer);
    clearTimeout(eyeGrowTimer);
    clearTimeout(eyeGrowEndTimer);

    document.body.classList.remove('egg-returning');
    document.body.classList.remove('tc-eye-grow-after-egg');
    document.body.classList.remove('tc-eye-hard-hidden');
    document.body.classList.remove('tc-egg-pre-fall');

    lockEyeParallax();
    document.body.classList.add('tc-egg-pre-fall');

    setTimeout(function(){
      if (!eggActive) return;

      document.body.classList.remove('tc-egg-pre-fall');
      createFallOverlay();

      hardHideEyeForReturn();

      document.body.classList.add('egg-on');
      showRedEasterLayer();

      eggTimer = setTimeout(hideEgg, EGG_HOLD_TIME);
    }, EGG_PRE_FALL_TIME);
  }

  function onTouch(e) {
    if (!match(e.target)) return;

    lastTouch = Date.now();

    if (eggActive) return;

    count += 1;

    if (count >= NEED) {
      showEgg();
    }
  }

  function onClick(e) {
    if (Date.now() - lastTouch < 400) return;
    if (!match(e.target)) return;

    if (eggActive) return;

    count += 1;

    if (count >= NEED) {
      showEgg();
    }
  }

  function arm() {
    if (armed) return;

    armed = true;

    if (!q('.easter')) return;

    if (location.search.indexOf('egg=1') > -1) {
      showEgg();
      return;
    }

    document.addEventListener('touchstart', onTouch, {
      passive: true,
      capture: true
    });

    document.addEventListener('click', onClick, {
      capture: true
    });
  }

  if (document.readyState === 'complete') {
    arm();
  } else {
    window.addEventListener('load', arm);
  }
})();

(function () {

  if (window.__TRIP_RADIO__ && window.__TRIP_RADIO__.destroy) {
    try { window.__TRIP_RADIO__.destroy(); } catch(e){}
  }
  if (window.__TC_RADIO_NOTES_CLONE_V1__) {
    try { window.__TC_RADIO_NOTES_CLONE_V1__.destroy(); } catch (e) {}
  }

  var RADIO = window.__TRIP_RADIO__ = {};
  window.__TC_RADIO_NOTES_CLONE_V1__ = RADIO;

  var NOTE_INTERVAL_MS = 1200;
  var NOTE_CLASSES = ['note1', 'note2', 'note3', 'note4'];
  var NOTE_DX = { note1: '-28px', note2: '22px', note3: '-18px', note4: '30px' };
  var NOTE_PARTICLE_SIZE = 24;
  var NOTE_PARTICLE_SIZE_MOBILE = 20;
  var NOTE_PARTICLE_TIMEOUT_MS = 5600;
  var NOTE_ORIGIN_X_RATIO = 0.32;
  var NOTE_ORIGIN_Y_RATIO = 0.47;

  var noteState = 'off';
  var noteInterval = 0;
  var noteTimeouts = [];
  var noteIndex = 0;
  var activeClones = 0;
  var noteParticleSeq = 0;

  function isDebugNotes() {
    return window.__TC_DEBUG_RADIO_NOTES__ === true;
  }

  function notesLog() {
    if (!isDebugNotes()) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[TC_RADIO_NOTES]');
    try { console.log.apply(console, args); } catch (e) {}
  }

  function clearNoteTimers() {
    if (noteInterval) {
      clearInterval(noteInterval);
      noteInterval = 0;
    }
    if (noteTimeouts.length) {
      noteTimeouts.forEach(function (id) { clearTimeout(id); });
      noteTimeouts = [];
    }
    notesLog('clear timers');
  }

  function setNotesState(next) {
    noteState = next;
    document.body.classList.remove('radio-notes-starting', 'radio-notes-playing', 'radio-notes-draining');
    if (next === 'starting') document.body.classList.add('radio-notes-starting');
    if (next === 'playing') document.body.classList.add('radio-notes-playing');
    if (next === 'draining') document.body.classList.add('radio-notes-draining');
    notesLog('state:', next);
  }

  function getNoteNode(noteClass) {
    return document.querySelector('.' + noteClass);
  }

  function removeIdsDeep(root) {
    if (!root || root.nodeType !== 1) return;
    root.removeAttribute('id');
    root.querySelectorAll('[id]').forEach(function (el) {
      el.removeAttribute('id');
    });
  }

  function getTemplateAtom(noteClass) {
    return document.querySelector('.' + noteClass + ' .tn-atom');
  }

  function getNoteParticleSize() {
    return window.innerWidth <= 768 ? NOTE_PARTICLE_SIZE_MOBILE : NOTE_PARTICLE_SIZE;
  }

  function getParticleOrigin(noteClass, templateRect) {
    if (templateRect && templateRect.width > 0 && templateRect.height > 0) {
      return { x: templateRect.left, y: templateRect.top };
    }

    var radioAnchor = document.querySelector('.radio-power, .radio-next, .radio-on, .radio-off');
    if (radioAnchor) {
      var radioRect = radioAnchor.getBoundingClientRect();
      return {
        x: radioRect.left + radioRect.width * NOTE_ORIGIN_X_RATIO,
        y: radioRect.top + radioRect.height * NOTE_ORIGIN_Y_RATIO
      };
    }

    return { x: 0, y: 0 };
  }

  function removeParticle(particle, noteClass) {
    if (!particle || particle.__tcRemoved) return;

    particle.__tcRemoved = true;
    if (particle.__tcTimeoutId) {
      clearTimeout(particle.__tcTimeoutId);
      particle.__tcTimeoutId = 0;
    }

    if (particle.parentNode) particle.parentNode.removeChild(particle);
    if (activeClones > 0) activeClones -= 1;

    notesLog('remove particle:', noteClass, particle.getAttribute('data-note-id'));
    notesLog('active clone count:', activeClones);

    if (noteState === 'draining' && activeClones === 0) {
      setNotesState('off');
    }
  }

  function cleanupStaleNoteArtifacts(force) {
    document.querySelectorAll('.tc-radio-note-clone').forEach(function (legacyClone) {
      if (legacyClone.parentNode) legacyClone.parentNode.removeChild(legacyClone);
    });

    document.querySelectorAll('.tc-radio-note-particle').forEach(function (particle) {
      if (force) {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
        return;
      }

      var atom = particle.querySelector('.tc-radio-note-particle-atom, .tn-atom');
      var isRunning = false;
      if (atom) {
        var cs = getComputedStyle(atom);
        isRunning = cs.animationName === 'note-fly' && cs.animationPlayState === 'running';
      }

      if (!isRunning || particle.getAttribute('data-stale') === '1') {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }
    });

    activeClones = document.querySelectorAll('.tc-radio-note-particle').length;
  }

  function spawnNote(noteClass) {
    var template = getTemplateAtom(noteClass);
    if (!template) return;

    var templateRect = template.getBoundingClientRect();
    var origin = getParticleOrigin(noteClass, templateRect);
    var particleSize = getNoteParticleSize();

    var particle = document.createElement('div');
    particle.className = 'tc-radio-note-particle tc-radio-note-particle--' + noteClass;
    particle.setAttribute('data-note-id', String(++noteParticleSeq));
    particle.style.left = origin.x + 'px';
    particle.style.top = origin.y + 'px';
    particle.style.width = particleSize + 'px';
    particle.style.height = particleSize + 'px';
    particle.style.fontSize = particleSize + 'px';
    particle.style.lineHeight = '1';
    particle.style.setProperty('--dx', NOTE_DX[noteClass] || '0px');

    var atomClone = template.cloneNode(true);
    removeIdsDeep(atomClone);
    atomClone.classList.add('tc-radio-note-particle-atom');
    atomClone.style.transform = '';
    atomClone.style.animation = '';
    atomClone.style.opacity = '';
    atomClone.style.visibility = '';
    atomClone.style.width = particleSize + 'px';
    atomClone.style.height = particleSize + 'px';
    atomClone.style.fontSize = particleSize + 'px';
    atomClone.style.lineHeight = '1';
    atomClone.style.display = 'block';

    particle.appendChild(atomClone);
    document.body.appendChild(particle);

    activeClones += 1;
    notesLog('spawn particle:', noteClass, particle.getAttribute('data-note-id'));
    notesLog('active clone count:', activeClones);

    var done = function () {
      removeParticle(particle, noteClass);
    };

    atomClone.addEventListener('animationend', done, { once: true });
    particle.__tcTimeoutId = setTimeout(done, NOTE_PARTICLE_TIMEOUT_MS);
  }

  function startNoteCycle() {
    if (noteInterval) clearInterval(noteInterval);
    noteInterval = setInterval(function () {
      if (noteState !== 'playing') return;
      spawnNote(NOTE_CLASSES[noteIndex % NOTE_CLASSES.length]);
      noteIndex += 1;
    }, NOTE_INTERVAL_MS);
  }

  function startNotes() {
    clearNoteTimers();
    cleanupStaleNoteArtifacts(false);
    setNotesState('playing');
    spawnNote(NOTE_CLASSES[noteIndex % NOTE_CLASSES.length]);
    noteIndex += 1;
    startNoteCycle();
  }

  function stopNotes() {
    if (noteState === 'off') return;
    clearNoteTimers();
    setNotesState('draining');
    if (activeClones === 0) {
      setNotesState('off');
    }
  }


  var PLAYLIST = [
    'https://tripchiller.github.io/radio/RADIO/track1.mp3',
    'https://tripchiller.github.io/radio/RADIO/track2.mp3',
    'https://tripchiller.github.io/radio/RADIO/track3.mp3',
    'https://tripchiller.github.io/radio/RADIO/track4.mp3',
    'https://tripchiller.github.io/radio/RADIO/track5.mp3'
  ];
  var START_RANDOM = true;
  var VOLUME = 1.0;

  function q(s){ return document.querySelector(s); }
  function unbind(el){ if(!el) return el; var c=el.cloneNode(true); el.parentNode.replaceChild(c,el); return c; }


  var audio = RADIO.audio || new Audio();
  RADIO.audio = audio;
  audio.preload = 'auto';
  audio.loop = false;
  audio.volume = VOLUME;

  var idx = START_RANDOM ? Math.floor(Math.random()*PLAYLIST.length) : 0;
  var srcInitialized = false;

  function ensureSrc(){
    if (!srcInitialized) {
      audio.src = PLAYLIST[idx];
      srcInitialized = true;
    }
  }

  var bumpTimer = 0;
  function bump(){
    clearTimeout(bumpTimer);
    document.body.classList.add('radio-bump');
    bumpTimer = setTimeout(function(){
      document.body.classList.remove('radio-bump');
    }, 350);
  }

  function play(){

    ensureSrc();
    var p = audio.play();
    if (p && p.catch) p.catch(function(){});
    document.body.classList.add('radio-playing');
    if (RADIO.syncRadioVisualState) RADIO.syncRadioVisualState();
    startNotes();
    bump();
  }

  function pause(){
    audio.pause();
    document.body.classList.remove('radio-playing');
    if (RADIO.syncRadioVisualState) RADIO.syncRadioVisualState();
    stopNotes();
    bump();
  }

  function toggle(){
    audio.paused ? play() : pause();
  }

  function next(){

    idx = (idx + 1) % PLAYLIST.length;
    audio.src = PLAYLIST[idx];
    audio.currentTime = 0;
    srcInitialized = true;
    var p = audio.play();
    if (p && p.catch) p.catch(function(){});
    document.body.classList.add('radio-playing');
    if (RADIO.syncRadioVisualState) RADIO.syncRadioVisualState();
    bump();
  }

  function bind(){
    var power = q('.radio-power');
    var nextBtn = q('.radio-next');
    var onUI   = q('.radio-on');
    var offUI  = q('.radio-off');
    if (!power || !nextBtn || !onUI || !offUI) return false;


    power   = unbind(power);
    nextBtn = unbind(nextBtn);

    var lastTouch = 0;
    function dedupe(ev){
      if (ev.type==='touchstart'){ lastTouch = Date.now(); return true; }
      return (Date.now() - lastTouch) > 350;
    }

    power.addEventListener('touchstart', function(){ toggle(); }, {passive:true});
    power.addEventListener('click', function(ev){ if(dedupe(ev)) toggle(); });

    nextBtn.addEventListener('touchstart', function(){ if (!audio.paused) next(); }, {passive:true});
    nextBtn.addEventListener('click', function(ev){ if(dedupe(ev) && !audio.paused) next(); });

    var radioVisualTargets = [onUI, offUI, power, nextBtn].filter(Boolean);
    var radioOpacityTargets = [onUI, offUI]
      .concat(Array.prototype.slice.call(document.querySelectorAll('.tc-radio-body')))
      .filter(Boolean);
    var RADIO_OPACITY_DIM = 0.5;
    var RADIO_OPACITY_FULL = 1;
    var RADIO_OPACITY_MS = 800;
    var radioOpacityValue = RADIO_OPACITY_DIM;
    var radioOpacityTarget = RADIO_OPACITY_DIM;
    var radioOpacityFrom = RADIO_OPACITY_DIM;
    var radioOpacityStart = 0;
    var radioOpacityRaf = 0;
    var radioPointerInside = false;
    var radioFocusInside = false;
    var radioHoverRaf = 0;
    var lastPointerEvent = null;
    var docHoverOpts = { passive: true };
    var radioViewportSyncOpts = { passive: true };

    function setRadioVisualOpacity(value) {
      radioOpacityValue = value;
      radioOpacityTargets.forEach(function(el) {
        if (!el || !el.style) return;
        el.style.opacity = value.toFixed(3);
        el.style.willChange = 'opacity';
      });
    }

    function easeRadioOpacity(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateRadioOpacityTo(target) {
      if (radioOpacityTarget === target) return;
      radioOpacityTarget = target;
      radioOpacityFrom = radioOpacityValue;
      radioOpacityStart = performance.now();
      if (radioOpacityRaf) cancelAnimationFrame(radioOpacityRaf);
      function tick(now) {
        var t = Math.min(1, (now - radioOpacityStart) / RADIO_OPACITY_MS);
        var eased = easeRadioOpacity(t);
        var next = radioOpacityFrom + (radioOpacityTarget - radioOpacityFrom) * eased;
        setRadioVisualOpacity(next);
        if (t < 1) {
          radioOpacityRaf = requestAnimationFrame(tick);
        } else {
          radioOpacityRaf = 0;
          setRadioVisualOpacity(radioOpacityTarget);
        }
      }
      radioOpacityRaf = requestAnimationFrame(tick);
    }

    function isDesktopHoverMode() {
      return window.matchMedia &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }

    function shouldRadioBeFull() {
      var isPlaying = document.body.classList.contains('radio-playing');
      if (isPlaying) return true;
      if (isDesktopHoverMode()) return radioPointerInside || radioFocusInside;
      return false;
    }

    function syncRadioVisualState() {
      animateRadioOpacityTo(shouldRadioBeFull() ? RADIO_OPACITY_FULL : RADIO_OPACITY_DIM);
    }
    RADIO.syncRadioVisualState = syncRadioVisualState;

    function isPointInsideRadio(x, y) {
      return radioVisualTargets.some(function(el) {
        if (!el || !el.getBoundingClientRect) return false;
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return false;
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      });
    }

    function clearRadioHovered(){
      radioPointerInside = false;
      radioFocusInside = false;
      document.body.classList.remove('tc-radio-hovered');
      syncRadioVisualState();
    }

    function updateRadioHoverByPoint(ev){
      lastPointerEvent = ev;
      if (radioHoverRaf) return;
      radioHoverRaf = requestAnimationFrame(function(){
        radioHoverRaf = 0;
        if (!lastPointerEvent) return;
        var inside = isPointInsideRadio(lastPointerEvent.clientX, lastPointerEvent.clientY);
        radioPointerInside = inside;
        document.body.classList.toggle('tc-radio-hovered', inside);
        syncRadioVisualState();
      });
    }

    function onRadioFocusIn(){
      radioFocusInside = true;
      document.body.classList.add('tc-radio-hovered');
      syncRadioVisualState();
    }

    function onRadioFocusOut(){
      radioFocusInside = false;
      clearRadioHovered();
    }

    function resyncRadioHoverPosition() {
      if (!lastPointerEvent || !isDesktopHoverMode()) {
        syncRadioVisualState();
        return;
      }
      radioPointerInside = isPointInsideRadio(lastPointerEvent.clientX, lastPointerEvent.clientY);
      document.body.classList.toggle('tc-radio-hovered', radioPointerInside);
      syncRadioVisualState();
    }

    document.addEventListener('mousemove', updateRadioHoverByPoint, docHoverOpts);
    document.addEventListener('pointermove', updateRadioHoverByPoint, docHoverOpts);
    document.addEventListener('mouseleave', clearRadioHovered, docHoverOpts);
    window.addEventListener('blur', clearRadioHovered);
    window.addEventListener('scroll', resyncRadioHoverPosition, radioViewportSyncOpts);
    window.addEventListener('resize', resyncRadioHoverPosition, radioViewportSyncOpts);

    [power, nextBtn].filter(Boolean).forEach(function(el){
      el.addEventListener('focusin', onRadioFocusIn);
      el.addEventListener('focusout', onRadioFocusOut);
    });

    audio.addEventListener('ended', next);
    setRadioVisualOpacity(RADIO_OPACITY_DIM);
    syncRadioVisualState();

    RADIO.destroy = function(){
      try{ audio.pause(); }catch(e){}
      document.body.classList.remove('radio-playing','radio-bump');
      clearNoteTimers();
      cleanupStaleNoteArtifacts(true);
      activeClones = 0;
      noteIndex = 0;
      setNotesState('off');
      try{ power && unbind(power); }catch(e){}
      try{ nextBtn && unbind(nextBtn); }catch(e){}
      document.removeEventListener('mousemove', updateRadioHoverByPoint, docHoverOpts);
      document.removeEventListener('pointermove', updateRadioHoverByPoint, docHoverOpts);
      document.removeEventListener('mouseleave', clearRadioHovered, docHoverOpts);
      window.removeEventListener('blur', clearRadioHovered);
      window.removeEventListener('scroll', resyncRadioHoverPosition, radioViewportSyncOpts);
      window.removeEventListener('resize', resyncRadioHoverPosition, radioViewportSyncOpts);
      if (radioHoverRaf) cancelAnimationFrame(radioHoverRaf);
      if (radioOpacityRaf) cancelAnimationFrame(radioOpacityRaf);
      radioHoverRaf = 0;
      radioOpacityRaf = 0;
      lastPointerEvent = null;
      radioPointerInside = false;
      radioFocusInside = false;
      document.body.classList.remove('tc-radio-hovered');
      radioOpacityTargets.forEach(function(el) {
        if (!el || !el.style) return;
        el.style.opacity = '';
        el.style.willChange = '';
      });
      RADIO.syncRadioVisualState = null;
    };
    return true;
  }

  function arm(){
    if (bind()) return;
    var mo = new MutationObserver(function(){
      if (bind()) mo.disconnect();
    });
    mo.observe(document.documentElement, {childList:true, subtree:true});
    window.addEventListener('load', function(){ if (bind()) mo.disconnect(); });
  }
  arm();
})();

(function () {
  if (window.__TC_RADIO_NOTES_ANTI_CLIP_V1__) return;
  window.__TC_RADIO_NOTES_ANTI_CLIP_V1__ = true;

  var NOTES_SELECTOR = '.note1, .note2, .note3, .note4';

  function applyAntiClip() {
    var notes = document.querySelectorAll(NOTES_SELECTOR);
    if (!notes.length) return false;

    notes.forEach(function (note) {
      var rec = note.closest('.t-rec');
      if (rec) {
        rec.classList.add('tc-radio-notes-overflow');
      }

      var artboard = note.closest('.t396__artboard');
      if (artboard) {
        artboard.classList.add('tc-radio-notes-overflow');
      }
    });

    return true;
  }

  function arm() {
    if (applyAntiClip()) return;
    var mo = new MutationObserver(function () {
      if (applyAntiClip()) mo.disconnect();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('load', function () {
      if (applyAntiClip()) mo.disconnect();
    });
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arm);
  } else {
    arm();
  }
})();

(function () {
  if (window.__RADIO_POWER_TAP_NORMALIZED__) return;
  window.__RADIO_POWER_TAP_NORMALIZED__ = true;

  function bind() {
    var power = document.querySelector('.radio-power');
    if (!power) { requestAnimationFrame(bind); return; }

    var lastTouch = 0;
    var allowSynthetic = false;


    power.addEventListener('click', function (e) {

      if (allowSynthetic) { allowSynthetic = false; return; }

      if (Date.now() - lastTouch < 500) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);


    power.addEventListener('touchstart', function (e) {
      lastTouch = Date.now();
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false, capture: true });


    power.addEventListener('touchend', function (e) {
      e.preventDefault();
      e.stopPropagation();
      allowSynthetic = true;

      power.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }, { passive: false, capture: true });
  }

  if (document.readyState === 'complete') bind();
  else window.addEventListener('load', bind);
})();

(function () {
  if (window.__TC_CARD_INFO_BUTTON_FORCE_V3__) return;
  window.__TC_CARD_INFO_BUTTON_FORCE_V3__ = true;

  var SELECTOR =
    '#allrecords .t778__btn-wrapper a.t778__btn:not(.t778__btn_second),' +
    '#allrecords .t778__btn-wrapper button.t778__btn:not(.t778__btn_second)';

  function getInfoButton(target) {
    if (!target || !target.closest) return null;
    return target.closest(SELECTOR);
  }

  function press(btn) {
    if (!btn) return;
    btn.classList.add('tc-info-card-pressed');
  }

  function release(btn) {
    if (!btn) return;

    setTimeout(function () {
      btn.classList.remove('tc-info-card-pressed');
    }, 140);
  }

  document.addEventListener('pointerdown', function (e) {
    var btn = getInfoButton(e.target);
    if (!btn) return;

    press(btn);
  }, true);

  document.addEventListener('pointerup', function (e) {
    var btn = getInfoButton(e.target);
    if (!btn) return;

    release(btn);
  }, true);

  document.addEventListener('pointercancel', function (e) {
    var btn = getInfoButton(e.target);
    if (!btn) return;

    release(btn);
  }, true);

  document.addEventListener('pointerleave', function (e) {
    var btn = getInfoButton(e.target);
    if (!btn) return;

    release(btn);
  }, true);

  document.addEventListener('click', function (e) {
    var btn = getInfoButton(e.target);
    if (!btn) return;

    press(btn);
    release(btn);
  }, true);
})();

(function () {
  if (window.__TC_SAFE_SHOP_UI_PATCH_V1__) return;
  window.__TC_SAFE_SHOP_UI_PATCH_V1__ = true;

  var ACTIVE_CLASS = 'tc-safe-filter-active';
  var ITEM_CLASS = 'tc-safe-filter-item';
  var TEXT_CLASS = 'tc-safe-filter-text';
  var LOAD_BTN_CLASS = 'tc-safe-load-more-btn';
  var LOAD_TEXT_CLASS = 'tc-safe-load-more-text';
  var FILTER_WRAPPER_SELECTOR = '#allrecords .t-catalog__parts-switch-wrapper, #allrecords .t-store__parts-switch-wrapper';
  var FILTER_TEXT_SELECTOR = '.t-catalog__parts-text-title';
  var LOAD_MORE_SELECTOR = '#allrecords button.js-catalog-load-more-btn, #allrecords .t-btn.js-catalog-load-more-btn';

  function norm(text) {
    return String(text || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function labelOf(text) {
    var value = norm(text).replace(/[«»"'`]/g, '');
    if (value === 'каталог') return 'все';
    if (value === 'все') return 'все';
    if (value === 'кепка') return 'кепки';
    if (value === 'кепки') return 'кепки';
    if (value === 'футболка') return 'футболки';
    if (value === 'футболки') return 'футболки';
    if (value === 'верх') return 'верх';
    if (value === 'архив') return 'архив';
    return '';
  }

  function closestFilterItem(textEl) {
    return textEl.closest(
      '.t-catalog__parts-switch-btn,' +
      '.t-store__parts-switch-btn,' +
      '.t-catalog__parts-button-base,' +
      '.js-catalog-parts-switcher,' +
      'button,a,[role="button"]'
    ) || textEl.parentElement;
  }

  function hasActiveMarker(item) {
    if (!item) return false;
    return !!item.closest(
      '.t-active,.active,.tc-catalog-part-active,' +
      '[aria-current="true"],[aria-selected="true"],[class*="_active"]'
    );
  }

  function looksDimmed(el) {
    if (!el) return false;
    var node = el;
    var depth = 0;

    while (node && node !== document.body && depth < 5) {
      var opacity = parseFloat(getComputedStyle(node).opacity || '1');
      if (opacity < 0.99) return true;
      node = node.parentElement;
      depth += 1;
    }

    return false;
  }

  function patchFilters(forcedLabel) {
    var wrappers = document.querySelectorAll(FILTER_WRAPPER_SELECTOR);

    wrappers.forEach(function (wrapper) {
      var parts = [];
      var activeLabel = forcedLabel || '';

      wrapper.querySelectorAll(FILTER_TEXT_SELECTOR).forEach(function (textEl) {
        var label = labelOf(textEl.textContent);
        if (!label) return;

        var item = closestFilterItem(textEl);
        if (!item) return;

        parts.push({ item: item, textEl: textEl, label: label });

        if (!activeLabel && hasActiveMarker(item)) activeLabel = label;
        if (!activeLabel && looksDimmed(item)) activeLabel = label;
        if (!activeLabel && looksDimmed(textEl)) activeLabel = label;
      });

      if (!activeLabel) activeLabel = 'все';

      parts.forEach(function (part) {
        var active = part.label === activeLabel;

        part.item.classList.add(ITEM_CLASS);
        part.item.classList.toggle(ACTIVE_CLASS, active);
        part.item.style.setProperty('color', active ? '#fff' : '#8f8f8f', 'important');
        part.item.style.setProperty('opacity', '1', 'important');

        part.textEl.classList.add(TEXT_CLASS);
        part.textEl.style.setProperty('color', active ? '#fff' : '#8f8f8f', 'important');
        part.textEl.style.setProperty('opacity', '1', 'important');

        if (part.label === 'все') part.textEl.textContent = 'ВСЕ';
      });
    });
  }

  function patchLoadMore() {
    document.querySelectorAll(LOAD_MORE_SELECTOR).forEach(function (btn) {
      btn.classList.add(LOAD_BTN_CLASS);

      var text = btn.querySelector(
        '.js-catalog-load-more-btn-text, .t-btnflex__text, .t-btntext, span'
      );

      if (text) {
        text.classList.add(LOAD_TEXT_CLASS);
        text.classList.remove('tc-load-more-btn');
        text.textContent = 'ЗАГРУЗИТЬ ЕЩЁ';
      } else {
        var current = norm(btn.textContent);
        if (current === 'загрузить ещё' || current === 'загрузить еще' || current === 'load more') {
          btn.textContent = 'ЗАГРУЗИТЬ ЕЩЁ';
        }
      }
    });
  }

  function getLoadMoreButtonFromEvent(e) {
    return e.target.closest && e.target.closest(LOAD_MORE_SELECTOR);
  }

  function runSafeShopPatch() {
    patchFilters();
    patchLoadMore();
  }

  document.addEventListener('pointerdown', function (e) {
    var btn = getLoadMoreButtonFromEvent(e);
    if (btn) btn.classList.add('tc-safe-pressed');
  }, true);

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (eventName) {
    document.addEventListener(eventName, function (e) {
      var btn = getLoadMoreButtonFromEvent(e);
      if (btn) {
        setTimeout(function () {
          btn.classList.remove('tc-safe-pressed');
        }, 120);
      }
    }, true);
  });

  document.addEventListener('click', function (e) {
    var btn = getLoadMoreButtonFromEvent(e);
    if (btn) {
      btn.classList.add('tc-safe-pressed');
      setTimeout(function () {
        btn.classList.remove('tc-safe-pressed');
        patchLoadMore();
      }, 160);
      return;
    }

    var textEl = e.target.closest && e.target.closest(FILTER_TEXT_SELECTOR);
    if (textEl && textEl.closest(FILTER_WRAPPER_SELECTOR)) {
      var label = labelOf(textEl.textContent);
      if (label) {
        patchFilters(label);
        setTimeout(function () { patchFilters(label); }, 80);
        setTimeout(function () { patchFilters(label); }, 240);
      }
    }
  }, true);

  window.__TC_SAFE_SHOP_STATE__ = function () {
    return {
      filters: Array.prototype.map.call(document.querySelectorAll('.tc-safe-filter-item'), function (el) {
        return {
          text: el.textContent.trim(),
          cls: el.className,
          color: getComputedStyle(el).color,
          opacity: getComputedStyle(el).opacity
        };
      }),
      loadMore: Array.prototype.map.call(document.querySelectorAll('.tc-safe-load-more-btn'), function (el) {
        return {
          text: el.textContent.trim(),
          cls: el.className,
          bg: getComputedStyle(el).backgroundColor
        };
      })
    };
  };

  runSafeShopPatch();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runSafeShopPatch);
  } else {
    runSafeShopPatch();
  }

  window.addEventListener('load', runSafeShopPatch);

  [80, 240, 600].forEach(function (delay) {
    setTimeout(runSafeShopPatch, delay);
  });
})();

(function () {
  if (window.__TC_PRODUCT_POPUP_SAFE_BG_V1__) return;
  window.__TC_PRODUCT_POPUP_SAFE_BG_V1__ = true;

  function removeOldBrokenBg() {
    var old = document.getElementById("tc-store-popup-bg");
    if (old && old.parentNode) {
      old.parentNode.removeChild(old);
    }
  }

  function isProductUrl() {
    var href = String(location.href || "");
    var hash = String(location.hash || "");

    return (
      href.indexOf("/tproduct/") !== -1 ||
      hash.indexOf("tproduct") !== -1 ||
      href.indexOf("#!/tproduct/") !== -1 ||
      href.indexOf("#/tproduct/") !== -1
    );
  }

  function hasVisibleProductPopup() {
    var selectors = [
      ".t-store__prod-popup",
      ".js-store-prod-popup",
      ".t-popup.t-popup_show"
    ];

    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (!el) continue;

      var st = window.getComputedStyle(el);
      var r = el.getBoundingClientRect();

      if (
        st.display !== "none" &&
        st.visibility !== "hidden" &&
        Number(st.opacity) !== 0 &&
        r.width > 10 &&
        r.height > 10
      ) {
        return true;
      }
    }

    return false;
  }

  function update() {
    removeOldBrokenBg();

    var open = isProductUrl() || hasVisibleProductPopup();

    document.body.classList.toggle("tc-product-popup-open", open);
  }

  function scheduleUpdate() {
    requestAnimationFrame(function () {
      update();
      setTimeout(update, 80);
      setTimeout(update, 250);
      setTimeout(update, 700);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleUpdate);
  } else {
    scheduleUpdate();
  }

  window.addEventListener("load", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("popstate", scheduleUpdate);

  document.addEventListener("click", scheduleUpdate, true);
  document.addEventListener("keydown", scheduleUpdate, true);

  if (window.MutationObserver) {
    var observer = new MutationObserver(scheduleUpdate);

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }
})();

(function () {
  const BG_BW = "https://static.tildacdn.com/tild3534-6439-4037-a361-323538303363/BGbw.webp";
  const BG_COLOR_EYES = "https://static.tildacdn.com/tild3132-3630-4434-b237-653763376365/BGColor2.webp";
  const BG_COLOR_CLEAN = "https://static.tildacdn.com/tild6165-6634-4434-b464-316436366535/BGColor.webp";
  const BG_COLOR_RED = "https://static.tildacdn.com/tild3961-6534-4636-a137-383465666237/BGred.webp";

  const DESKTOP_QUERY = "(min-width: 981px) and (pointer: fine)";
  const MOBILE_QUERY = "(max-width: 980px), (pointer: coarse)";

  const desktopMedia = window.matchMedia(DESKTOP_QUERY);
  const mobileMedia = window.matchMedia(MOBILE_QUERY);

  const isDesktop = desktopMedia.matches;
  const isMobile = mobileMedia.matches;

  if (document.getElementById("tc-fixed-bg")) return;

  const supportsMask =
    CSS.supports("-webkit-mask-image", "linear-gradient(to bottom, black, transparent)") ||
    CSS.supports("mask-image", "linear-gradient(to bottom, black, transparent)");

  const bg = document.createElement("div");
  bg.id = "tc-fixed-bg";
  bg.setAttribute("aria-hidden", "true");

  bg.innerHTML = `
    <div class="tc-bg-layer tc-bg-bw"></div>
    <div class="tc-bg-layer tc-bg-aura"></div>
    <div class="tc-bg-layer tc-bg-ripple tc-bg-ripple-1"></div>
    <div class="tc-bg-layer tc-bg-ripple tc-bg-ripple-2"></div>
    <div class="tc-bg-layer tc-bg-color"></div>
    <div class="tc-bg-layer tc-bg-aura-clean"></div>
    <div class="tc-bg-layer tc-bg-ripple tc-bg-ripple-clean-1"></div>
    <div class="tc-bg-layer tc-bg-ripple tc-bg-ripple-clean-2"></div>
    <div class="tc-bg-layer tc-bg-color-clean"></div>
    <div class="tc-bg-layer tc-bg-aura-red"></div>
    <div class="tc-bg-layer tc-bg-ripple tc-bg-ripple-red-1"></div>
    <div class="tc-bg-layer tc-bg-ripple tc-bg-ripple-red-2"></div>
    <div class="tc-bg-layer tc-bg-color-red"></div>
  `;

  document.body.prepend(bg);

  const bwLayer = bg.querySelector(".tc-bg-bw");
  const auraLayer = bg.querySelector(".tc-bg-aura");
  const colorLayer = bg.querySelector(".tc-bg-color");
  const auraCleanLayer = bg.querySelector(".tc-bg-aura-clean");
  const colorCleanLayer = bg.querySelector(".tc-bg-color-clean");
  const auraRedLayer = bg.querySelector(".tc-bg-aura-red");
  const colorRedLayer = bg.querySelector(".tc-bg-color-red");
  const rippleEyesLayers = bg.querySelectorAll(".tc-bg-ripple-1, .tc-bg-ripple-2");
  const rippleCleanLayers = bg.querySelectorAll(".tc-bg-ripple-clean-1, .tc-bg-ripple-clean-2");
  const rippleRedLayers = bg.querySelectorAll(".tc-bg-ripple-red-1, .tc-bg-ripple-red-2");

  bwLayer.style.backgroundImage = `url("${BG_BW}")`;

  let colorLoaded = false;

  function loadColorLayer() {
    if (colorLoaded) return;
    if (!supportsMask) return;

    colorLoaded = true;

    auraLayer.style.backgroundImage = `url("${BG_COLOR_EYES}")`;
    colorLayer.style.backgroundImage = `url("${BG_COLOR_EYES}")`;
    auraCleanLayer.style.backgroundImage = `url("${BG_COLOR_CLEAN}")`;
    colorCleanLayer.style.backgroundImage = `url("${BG_COLOR_CLEAN}")`;
    auraRedLayer.style.backgroundImage = `url("${BG_COLOR_RED}")`;
    colorRedLayer.style.backgroundImage = `url("${BG_COLOR_RED}")`;

    rippleEyesLayers.forEach(function (layer) {
      layer.style.backgroundImage = `url("${BG_COLOR_EYES}")`;
    });
    rippleCleanLayers.forEach(function (layer) {
      layer.style.backgroundImage = `url("${BG_COLOR_CLEAN}")`;
    });
    rippleRedLayers.forEach(function (layer) {
      layer.style.backgroundImage = `url("${BG_COLOR_RED}")`;
    });
  }

  window.addEventListener("load", function () {
    setTimeout(function () {
      bg.classList.add("is-visible");
    }, 1000);

    if (supportsMask && (isDesktop || isMobile)) {
      setTimeout(loadColorLayer, 1400);
    }
  }, { once: true });

  function clamp01(value) {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }

  function getDocumentHeight() {
    const doc = document.documentElement;
    const body = document.body;

    return Math.max(
      body.scrollHeight,
      doc.scrollHeight,
      body.offsetHeight,
      doc.offsetHeight,
      body.clientHeight,
      doc.clientHeight
    );
  }

  function setupMobileScrollReveal() {
    let scrollRaf = 0;
    const MOBILE_REVEAL_PRESTART_PX = 1500;

    function getActiveProductsGrid() {
      const body = document.body;
      const prefersCustom = !!(body && body.classList.contains("tc-section-custom"));

      if (prefersCustom) {
        return (
          document.querySelector(".uc-custom-grid") ||
          document.querySelector(".uc-shop-grid")
        );
      }

      return (
        document.querySelector(".uc-shop-grid") ||
        document.querySelector(".uc-custom-grid")
      );
    }

    function updateMobileReveal() {
      scrollRaf = 0;

      loadColorLayer();

      const scrollY =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      const viewportH = window.innerHeight || document.documentElement.clientHeight || 1;
      const grid = getActiveProductsGrid();
      let revealStart = getDocumentHeight();

      if (grid) {
        const rect = grid.getBoundingClientRect();
        const gridTopAbs = rect.top + scrollY;
        const gridBottomAbs = rect.bottom + scrollY;
        revealStart = Math.max(gridTopAbs, gridBottomAbs - MOBILE_REVEAL_PRESTART_PX);
      }

      const revealEnd = getDocumentHeight() - viewportH;
      const revealRange = Math.max(1, revealEnd - revealStart);
      const progress = clamp01((scrollY - revealStart) / revealRange);

      const feather = Math.max(90, Math.min(180, viewportH * 0.18));
      const revealY = -feather + progress * (viewportH + feather * 2);

      const hard = revealY - feather * 0.55;
      const soft = revealY + feather * 0.9;

      const bandStart = revealY - feather * 1.25;
      const bandMid = revealY;
      const bandEnd = revealY + feather * 1.35;

      let bandOpacity = 0;

      if (progress > 0.01 && progress < 0.995) {
        bandOpacity = 0.34;
      } else if (progress >= 0.995) {
        bandOpacity = 0.14;
      }

      bg.style.setProperty("--mobile-hard", hard.toFixed(2) + "px");
      bg.style.setProperty("--mobile-soft", soft.toFixed(2) + "px");

      bg.style.setProperty("--mobile-band-start", bandStart.toFixed(2) + "px");
      bg.style.setProperty("--mobile-band-mid", bandMid.toFixed(2) + "px");
      bg.style.setProperty("--mobile-band-end", bandEnd.toFixed(2) + "px");

      bg.style.setProperty("--mobile-color-opacity", progress <= 0.003 ? "0" : "1");
      bg.style.setProperty("--mobile-band-opacity", bandOpacity.toFixed(3));
    }

    function scheduleMobileReveal() {
      if (!scrollRaf) {
        scrollRaf = requestAnimationFrame(updateMobileReveal);
      }
    }

    window.addEventListener("scroll", scheduleMobileReveal, { passive: true });
    window.addEventListener("resize", scheduleMobileReveal);
    window.addEventListener("orientationchange", scheduleMobileReveal);

    window.addEventListener("load", function () {
      setTimeout(scheduleMobileReveal, 300);
      setTimeout(scheduleMobileReveal, 1200);
    }, { once: true });

    document.addEventListener("click", function (event) {
      const target = event.target;
      if (!target || !target.closest) return;

      const loadMoreBtn = target.closest(
        ".t778__showmore, .t-store__load-more-btn, .js-store-load-more-btn"
      );
      if (!loadMoreBtn) return;

      scheduleMobileReveal();
      setTimeout(scheduleMobileReveal, 300);
      setTimeout(scheduleMobileReveal, 900);
      setTimeout(scheduleMobileReveal, 1800);
      setTimeout(scheduleMobileReveal, 3000);
    });

    const observeTarget = document.getElementById("allrecords") || document.body;

    if (window.MutationObserver && observeTarget) {
      const observer = new MutationObserver(function () {
        scheduleMobileReveal();
        setTimeout(scheduleMobileReveal, 120);
        setTimeout(scheduleMobileReveal, 300);
        setTimeout(scheduleMobileReveal, 900);
        setTimeout(scheduleMobileReveal, 1800);
        setTimeout(scheduleMobileReveal, 3000);
      });

      observer.observe(observeTarget, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }

    scheduleMobileReveal();
  }

function setupDesktopAura() {
  let currentX = window.innerWidth / 2;
  let currentY = window.innerHeight / 2;
  let targetX = currentX;
  let targetY = currentY;

  let raf = 0;
  let isActive = false;

  let revealPower = 0;
  let lastFrameTime = 0;

  /*
    Локальное проявление при удержании курсора.
    650ms = цветная область не вспыхивает сразу, а постепенно заряжается.
  */
  const REVEAL_TIME = 650;
  const EYES_TO_CLEAN_DELAY = 1000;
  const EYES_TO_CLEAN_FADE = 500;
  const NORMAL_CHARGE_TIME = 3000;
  const RED_CHARGE_TIME = 3000;
  const NORMAL_START_SCALE = 0.5;
  const NORMAL_RADIUS_MULTIPLIER = 1.0;
  const NORMAL_RADIUS_SHRINK_EASE = 0.045;
  const RED_START_SCALE = 0.5;
  const RED_RADIUS_MULTIPLIER = 1.5;

  /*
    Глобальный прогрев после загрузки страницы:
    0-1 секунда: эффект вообще не проявляется;
    1-3.6 секунды: эффект плавно набирает силу;
    после этого работает как обычно.
  */
  const PAGE_EFFECT_DELAY = 1000;
  const PAGE_EFFECT_RAMP_TIME = 2600;

  let pageLoadTime = 0;
  let focusX = 0;
  let focusY = 0;
  let focusStartTime = 0;
  let cleanFadeTarget = 0;
  let cleanFadePower = 0;
  let lastCleanFadeTime = 0;
  let normalRadiusVisual = NORMAL_START_SCALE;
  let redMode = false;
  let redModeStartTime = 0;
  let suppressCleanResetUntil = 0;
  // Large sticky zone: eyes should not return on tiny cursor movement.
  const FOCUS_RESET_DISTANCE = 140;
  const CLEAN_RETURN_FADE_TIME = 900;

  if (document.readyState === "complete") {
    pageLoadTime = performance.now();
  } else {
    window.addEventListener("load", function () {
      pageLoadTime = performance.now();
    }, { once: true });
  }

  const BASE_CORE = 50;
  const BASE_SOFT = 140;

  function smoothstep(value) {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value * value * (3 - 2 * value);
  }

  function getPageWarmupPower(time) {
    if (!pageLoadTime) return 0;

    const elapsed = time - pageLoadTime;

    if (elapsed <= PAGE_EFFECT_DELAY) {
      return 0;
    }

    return smoothstep((elapsed - PAGE_EFFECT_DELAY) / PAGE_EFFECT_RAMP_TIME);
  }

  function setDesktopReveal(power, cleanPower, redPower) {
    const safeClean = clamp01(cleanPower || 0);
    const safeRed = clamp01(redPower || 0);
    const eyesPower = power * (1 - safeClean) * (1 - safeRed);
    const cleanLayerPower = power * safeClean * (1 - safeRed);
    const redLayerPower = power * safeRed;

    bg.style.setProperty("--desktop-aura-opacity", (eyesPower * 0.52).toFixed(3));
    bg.style.setProperty("--desktop-ripple-opacity", (eyesPower * 0.52).toFixed(3));
    bg.style.setProperty("--desktop-color-opacity", (eyesPower * 0.9).toFixed(3));

    bg.style.setProperty("--desktop-aura-clean-opacity", "0");
    bg.style.setProperty("--desktop-ripple-clean-opacity", "0");
    bg.style.setProperty("--desktop-color-clean-opacity", (cleanLayerPower * 0.9).toFixed(3));

    bg.style.setProperty("--desktop-aura-red-opacity", "0");
    bg.style.setProperty("--desktop-ripple-red-opacity", "0");
    bg.style.setProperty("--desktop-color-red-opacity", (redLayerPower * 0.9).toFixed(3));
  }

  function setRipple(prefix, phase, effectPower) {
    const waveAlpha = Math.sin(Math.PI * phase);

    /*
      Профиль кольца:
      - кольцо стартует чуть ближе к основному пятну
      - толщина меньше
      - хвост короче
      - заметность чуть выше
      - alpha умножается и на локальный hover, и на общий прогрев страницы
    */
    const inner = BASE_SOFT * 0.72 + phase * 96;
    const mid = inner + 24;
    const outer = inner + 84;

    bg.style.setProperty(`--${prefix}-in`, inner.toFixed(2) + "px");
    bg.style.setProperty(`--${prefix}-mid`, mid.toFixed(2) + "px");
    bg.style.setProperty(`--${prefix}-out`, outer.toFixed(2) + "px");
    bg.style.setProperty(`--${prefix}-alpha`, (waveAlpha * 0.28 * effectPower).toFixed(3));
  }

  function resetFocusTimer(x, y) {
    focusX = x;
    focusY = y;
    focusStartTime = performance.now();
    cleanFadeTarget = 0;
  }

  function maybeResetFocusTimer(x, y) {
    if (!focusStartTime) {
      resetFocusTimer(x, y);
      return;
    }

    const dx = x - focusX;
    const dy = y - focusY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > FOCUS_RESET_DISTANCE) {
      resetFocusTimer(x, y);
    }
  }

  function render(time) {
    raf = 0;

    const dt = lastFrameTime ? Math.min(64, time - lastFrameTime) : 0;
    lastFrameTime = time;

    /*
      revealPower = сила удержания курсора.
      pageWarmupPower = общий прогрев после загрузки страницы.
      totalPower = реальная сила эффекта.
    */
    revealPower = Math.min(1, revealPower + dt / REVEAL_TIME);

    const pageWarmupPower = getPageWarmupPower(time);
    const totalPower = revealPower * pageWarmupPower;

    const fallbackRedMode = document.body.classList.contains("tc-flower-dragging");
    const isRedActive = redMode || fallbackRedMode;
    if (isRedActive) {
      cleanFadeTarget = 0;
    } else {
      const focusElapsed = focusStartTime ? Math.max(0, time - focusStartTime) : 0;
      if (focusElapsed <= EYES_TO_CLEAN_DELAY) {
        cleanFadeTarget = 0;
      } else {
        cleanFadeTarget = clamp01((focusElapsed - EYES_TO_CLEAN_DELAY) / EYES_TO_CLEAN_FADE);
      }
    }

    const cleanFadeDt = lastCleanFadeTime ? Math.max(0, time - lastCleanFadeTime) : 16;
    lastCleanFadeTime = time;
    const cleanFadeStep = cleanFadeDt / CLEAN_RETURN_FADE_TIME;
    if (cleanFadePower < cleanFadeTarget) {
      cleanFadePower = Math.min(cleanFadeTarget, cleanFadePower + cleanFadeStep);
    } else if (cleanFadePower > cleanFadeTarget) {
      cleanFadePower = Math.max(cleanFadeTarget, cleanFadePower - cleanFadeStep);
    }
    if (isRedActive && redModeStartTime === 0) {
      redModeStartTime = time;
    } else if (!isRedActive && redModeStartTime !== 0) {
      redModeStartTime = 0;
    }

    const focusElapsed = focusStartTime ? Math.max(0, time - focusStartTime) : 0;
    const normalCharge = smoothstep(focusElapsed / NORMAL_CHARGE_TIME);
    const normalRadiusTarget = NORMAL_START_SCALE + normalCharge * (NORMAL_RADIUS_MULTIPLIER - NORMAL_START_SCALE);

    if (normalRadiusTarget >= normalRadiusVisual) {
      normalRadiusVisual = normalRadiusTarget;
    } else {
      normalRadiusVisual += (normalRadiusTarget - normalRadiusVisual) * NORMAL_RADIUS_SHRINK_EASE;
    }

    const normalRadiusMultiplier = normalRadiusVisual;

    const redElapsed = isRedActive && redModeStartTime ? Math.max(0, time - redModeStartTime) : 0;
    const redCharge = isRedActive ? smoothstep(redElapsed / RED_CHARGE_TIME) : 0;
    const redRadiusMultiplier = RED_START_SCALE + redCharge * (RED_RADIUS_MULTIPLIER - RED_START_SCALE);
    const redPower = isRedActive ? 1 : 0;

    setDesktopReveal(totalPower, cleanFadePower, redPower);

    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;

    const t = time * 0.001;
    const pulse = Math.sin(t * 1.85);

    const radiusMultiplier = isRedActive ? redRadiusMultiplier : normalRadiusMultiplier;
    const baseCore = BASE_CORE + pulse * 5;
    const baseSoft = BASE_SOFT + pulse * 18;
    const soft = baseSoft * radiusMultiplier;
    const core = Math.min(baseCore * radiusMultiplier, soft * 0.34);
    const mid = core + (soft - core) * 0.58;

    const rippleSpeed = 0.28;
    const phase1 = (t * rippleSpeed) % 1;
    const phase2 = (phase1 + 0.5) % 1;

    bg.style.setProperty("--mx", currentX + "px");
    bg.style.setProperty("--my", currentY + "px");

    bg.style.setProperty("--spot-core", core.toFixed(2) + "px");
    bg.style.setProperty("--spot-mid", mid.toFixed(2) + "px");
    bg.style.setProperty("--spot-soft", soft.toFixed(2) + "px");

    setRipple("r1", phase1, totalPower);
    setRipple("r2", phase2, totalPower);

    if (isActive) {
      raf = requestAnimationFrame(render);
    }
  }

  function startRender() {
    if (!raf) {
      raf = requestAnimationFrame(render);
    }
  }

  function activate(event) {
    targetX = event.clientX;
    targetY = event.clientY;

    loadColorLayer();

    const isRedActive = redMode || document.body.classList.contains("tc-flower-dragging");
    const allowCleanReset = performance.now() > suppressCleanResetUntil;
    if (!isRedActive && allowCleanReset) {
      maybeResetFocusTimer(event.clientX, event.clientY);
    }

    if (!isActive) {
      isActive = true;
      lastFrameTime = 0;
      resetFocusTimer(event.clientX, event.clientY);
      bg.classList.add("is-active");
      startRender();
    }
  }

  function deactivate() {
    isActive = false;
    revealPower = 0;
    lastFrameTime = 0;
    focusStartTime = 0;
    focusX = 0;
    focusY = 0;
    cleanFadeTarget = 0;
    cleanFadePower = 0;
    lastCleanFadeTime = 0;
    normalRadiusVisual = NORMAL_START_SCALE;
    redMode = false;
    redModeStartTime = 0;

    setDesktopReveal(0, 0, 0);
    bg.classList.remove("is-active");

    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  setDesktopReveal(0, 0, 0);

  function isFlowerTarget(node) {
    return !!(node && node.closest && node.closest(".flower, .eye-desktop"));
  }


  function isPlainBackgroundPress(event) {
    if (!event || !event.target || !event.target.closest) return false;
    if (event.button !== 0) return false;
    if (isFlowerTarget(event.target)) return false;

    return !event.target.closest(
      "a, button, input, textarea, select, label, .t-submit, .t-btn, .t778__showmore, .t-store__load-more-btn, .js-store-load-more-btn, .tc-disk-switcher, .t-store__prod-popup, .t-popup"
    );
  }

  function enableRedMode() {
    redMode = true;
    redModeStartTime = performance.now();
    focusStartTime = 0;
    cleanFadeTarget = 0;
    startRender();
  }

  function disableRedMode() {
    if (!redMode) return;

    redMode = false;
    redModeStartTime = 0;
    focusStartTime = 0;
    cleanFadeTarget = 0;
  }

  document.addEventListener("pointermove", activate, { passive: true });
  document.addEventListener("pointerdown", function (event) {
    if (isPlainBackgroundPress(event)) {
      suppressCleanResetUntil = performance.now() + 650;
    }

    if (isFlowerTarget(event.target)) {
      activate(event);
      enableRedMode();
    }
  }, { passive: true });
  document.addEventListener("pointerup", disableRedMode, { passive: true });
  document.addEventListener("pointercancel", disableRedMode, { passive: true });
  document.addEventListener("mouseout", function (event) {
    if (!event.relatedTarget) disableRedMode();
  }, { passive: true });
  document.addEventListener("mouseleave", deactivate);
  window.addEventListener("blur", deactivate);
  window.addEventListener("blur", disableRedMode);

  window.addEventListener("resize", function () {
    targetX = window.innerWidth / 2;
    targetY = window.innerHeight / 2;

    if (isActive) {
      startRender();
    }
  });
}
  if (isMobile && supportsMask) {
    setupMobileScrollReveal();
  }

  if (isDesktop && supportsMask) {
    setupDesktopAura();
  }
})();


(function () {
  if (window.__TC_BACKGROUND_DRAG_SCROLL_V1__) return;
  window.__TC_BACKGROUND_DRAG_SCROLL_V1__ = true;

  const desktopMedia = window.matchMedia("(min-width: 981px) and (pointer: fine)");
  const THRESHOLD = 7;
  const SCROLL_MULTIPLIER = 1.45;
  const INERTIA_POWER = 0.42;
  const INERTIA_FRICTION = 0.88;
  const INERTIA_MIN_VELOCITY = 0.08;
  const INERTIA_MAX_STEP = 28;

  let pending = false;
  let dragging = false;
  let startY = 0;
  let lastY = 0;
  let suppressClickUntil = 0;
  let velocityY = 0;
  let inertiaRaf = 0;
  let lastMoveTime = 0;

  function isInteractiveTarget(target) {
    if (!target || !target.closest) return true;

    if (target.closest("a,button,input,textarea,select,label,[role='button'],[role='link'],.t-btn,.t-submit")) {
      return true;
    }

    if (target.closest(".flower,.eye-desktop,.eye-mobile,.radio-power,.radio-next,.radio-on,.radio-off,.note1,.note2,.note3,.note4,.soc1,.soc2,.soc3,.soc4,.tc-disk-switcher,.tc-path-row")) {
      return true;
    }

    if (target.closest(".t778__col,.t778__wrapper,.t778__imgwrapper,.t778__content,.t778__textwrapper,.t778__btn-wrapper,.t-store__card,.t-store__card__imgwrapper,.t-store__card__textwrapper,.t-store__prod-snippet,.js-product")) {
      return true;
    }

    if (target.closest(".t-store__prod-popup,.js-store-prod-popup,.t-popup,.t-popup_show,.t-zoomer,.t-zoomer__wrapper,.t-slds,.t-slds__wrapper,.swiper,.swiper-wrapper,.swiper-slide")) {
      return true;
    }

    if (target.closest(".tc-user-photos__nav,.tc-user-photos__slide,.tc-user-photos__img,.tc-user-photos__ticker,.tc-user-photos__ticker-track")) {
      return true;
    }

    const atom = target.closest('.tn-atom');
    if (atom) {
      const style = window.getComputedStyle(atom);
      const hasMedia = !!atom.querySelector('img,svg,video,canvas');
      const hasInteractiveInside = !!atom.querySelector("a,button,input,textarea,select,[role='button'],[role='link']");
      const isPointer = style.cursor === 'pointer';

      if (hasMedia || hasInteractiveInside || isPointer) {
        return true;
      }
    }

    return false;
  }

  function stopInertia() {
    if (!inertiaRaf) return;
    cancelAnimationFrame(inertiaRaf);
    inertiaRaf = 0;
  }

  function startInertia() {
    stopInertia();

    let v = velocityY * INERTIA_POWER;

    function tick() {
      if (Math.abs(v) < INERTIA_MIN_VELOCITY) {
        inertiaRaf = 0;
        return;
      }

      const step = Math.max(-INERTIA_MAX_STEP, Math.min(INERTIA_MAX_STEP, v));
      window.scrollBy(0, step);

      v *= INERTIA_FRICTION;
      inertiaRaf = requestAnimationFrame(tick);
    }

    inertiaRaf = requestAnimationFrame(tick);
  }

  function canStartBackgroundDrag(event) {
    if (!desktopMedia.matches) return false;
    if (!event || event.button !== 0) return false;
    if (isInteractiveTarget(event.target)) return false;
    return true;
  }

  function endDragScroll(allowInertia) {
    const shouldInertia = allowInertia && dragging;

    if (dragging) {
      suppressClickUntil = Date.now() + 320;
    }

    pending = false;
    dragging = false;
    document.body.classList.remove("tc-bg-drag-scrolling");

    if (shouldInertia) {
      startInertia();
    }
  }

  document.addEventListener("pointerdown", function (event) {
    if (!canStartBackgroundDrag(event)) return;

    stopInertia();

    pending = true;
    dragging = false;
    startY = event.clientY;
    lastY = event.clientY;
    velocityY = 0;
    lastMoveTime = performance.now();
  }, { passive: true, capture: true });

  document.addEventListener("pointermove", function (event) {
    if (!pending || !desktopMedia.matches) return;

    const moved = Math.abs(event.clientY - startY);
    if (!dragging && moved < THRESHOLD) return;

    if (!dragging) {
      dragging = true;
      document.body.classList.add("tc-bg-drag-scrolling");
    }

    const dy = event.clientY - lastY;
    lastY = event.clientY;

    const now = performance.now();
    const dt = Math.max(16, now - lastMoveTime);
    lastMoveTime = now;

    const scrollStep = -dy * SCROLL_MULTIPLIER;

    event.preventDefault();
    window.scrollBy(0, scrollStep);

    velocityY = (scrollStep / dt) * 16;
  }, { passive: false, capture: true });

  document.addEventListener("pointerup", function () {
    endDragScroll(true);
  }, true);
  document.addEventListener("pointercancel", function () {
    stopInertia();
    endDragScroll(false);
  }, true);
  window.addEventListener("blur", function () {
    stopInertia();
    endDragScroll(false);
  });

  document.addEventListener("click", function (event) {
    if (Date.now() > suppressClickUntil) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);
})();

(function () {
  if (window.__TC_DISK_SWITCHER_V5__) return;
  window.__TC_DISK_SWITCHER_V5__ = true;

  function ensureDiskSwitcherMarkup() {
    if (document.querySelector('.tc-disk-switcher')) return;

    var container = document.getElementById('tc-disk-switcher-root');

    if (!container) {
      var grid = document.querySelector('.uc-shop-grid');
      if (!grid || !grid.parentNode) return;

      container = document.createElement('div');
      container.id = 'tc-disk-switcher-root';
      grid.parentNode.insertBefore(container, grid);
    }

    container.innerHTML =
      '<div class="tc-disk-switcher" role="tablist" aria-label="TRIPCHILLER sections">' +
        '<button class="tc-path-row" type="button" role="tab" data-tc-tab="shop" data-label="C:\\TRIPCHILLER\\MAIN_SHOP" aria-selected="false">' +
          '<span class="tc-text"></span><span class="tc-caret">|</span>' +
        '</button>' +
        '<button class="tc-path-row" type="button" role="tab" data-tc-tab="custom" data-label="C:\\TRIPCHILLER\\CUSTOM_ARCHIVE" aria-selected="false">' +
          '<span class="tc-text"></span><span class="tc-caret">|</span>' +
        '</button>' +
      '</div>';
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function sleep(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms);
    });
  }

  function refreshTildaLayout() {
    setTimeout(function() {
      try {
        if (window.t_lazyload_update) window.t_lazyload_update();
      } catch (e) {}

      try {
        window.dispatchEvent(new Event('resize'));
      } catch (e) {}
    }, 80);
  }

  function waitWelcomeDone(maxWait) {
    return new Promise(function(resolve) {
      if (window.__TC_WELCOME_FINISHED__ === true) {
        resolve();
        return;
      }

      var finished = false;

      function done() {
        if (finished) return;
        finished = true;
        window.removeEventListener('tc:welcome-done', done);
        resolve();
      }

      window.addEventListener('tc:welcome-done', done);
      setTimeout(done, maxWait || 4200);
    });
  }

  function getInitialSection() {
    var hash = String(location.hash || '').toLowerCase();

    if (
      hash === '#custom_archive' ||
      hash === '#custom' ||
      hash === '#archive'
    ) {
      return 'custom';
    }

    return 'shop';
  }

  function setProductSection(name) {
    var isCustom = name === 'custom';

    document.body.classList.toggle('tc-section-shop', !isCustom);
    document.body.classList.toggle('tc-section-custom', isCustom);

    refreshTildaLayout();
  }

  function setActiveRow(name, updateHash) {
    var isCustom = name === 'custom';

    document.querySelectorAll('[data-tc-tab]').forEach(function(btn) {
      var active = btn.getAttribute('data-tc-tab') === name;

      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if (updateHash && window.history && window.history.replaceState) {
      history.replaceState(null, '', isCustom ? '#custom_archive' : '#main_shop');
    }
  }

  async function typeRow(row, speed) {
    var text = row.getAttribute('data-label') || '';
    var textNode = row.querySelector('.tc-text');

    if (!textNode) return;

    textNode.textContent = '';
    row.classList.add('is-currently-typing');

    for (var i = 0; i <= text.length; i++) {
      textNode.textContent = text.slice(0, i);

      if (i === 1) {
        row.classList.add('is-visible');
      }

      if (i < text.length) {
        var ch = text.charAt(i);
        var pause = speed + Math.random() * speed * 0.45;

        if (ch === '\\' || ch === ':' || ch === '_') {
          pause += 24;
        }

        await sleep(pause);
      }
    }

    row.classList.remove('is-currently-typing');
  }

  ready(async function() {
    ensureDiskSwitcherMarkup();

    var switcher = document.querySelector('.tc-disk-switcher');
    if (!switcher) return;

    var rows = Array.prototype.slice.call(
      switcher.querySelectorAll('.tc-path-row')
    );

    if (!rows.length) return;

    var initialSection = getInitialSection();

    setProductSection(initialSection);
    switcher.classList.add('is-typing');

    await waitWelcomeDone(4200);

    var TYPE_SPEED = 35;

    for (var i = 0; i < rows.length; i++) {
      await typeRow(rows[i], TYPE_SPEED);
      await sleep(130);
    }

    switcher.classList.remove('is-typing');

    await sleep(180);
    setActiveRow(initialSection, false);

    rows.forEach(function(row) {
      row.addEventListener('click', function() {
        var section = row.getAttribute('data-tc-tab');

        setProductSection(section);
        setActiveRow(section, true);
      });
    });
  });
})();

(function () {
  if (window.__TC_LEGAL_BUTTONS_SINGLE_FILL_V5__) return;
  window.__TC_LEGAL_BUTTONS_SINGLE_FILL_V5__ = true;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function normalizeText(str) {
    return String(str || '').replace(/\s+/g, ' ').trim().toUpperCase();
  }

  function getButtonRoot(el) {
    return el.closest('a') || el.closest('button') || el.closest('.tn-atom') || el;
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

      btn.addEventListener('pointerdown', press, true);
      btn.addEventListener('pointerup', releaseSoon, true);
      btn.addEventListener('pointerleave', releaseSoon, true);
      btn.addEventListener('pointercancel', releaseSoon, true);
      btn.addEventListener('touchstart', press, { passive: true, capture: true });
      btn.addEventListener('touchend', releaseSoon, { passive: true, capture: true });

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

(function () {
  "use strict";

  if (window.__TC_PRODUCT_RETURN_SCROLL_V1__) return;
  window.__TC_PRODUCT_RETURN_SCROLL_V1__ = true;

  var RETURN_KEY = 'tc:productReturnScroll:v1';
  var BACKUP_RETURN_KEY = 'tc:productReturnScrollBackup:v1';
  var OPENED_KEY = 'tc:productOpenedFromSite:v1';
  var LEGACY_USER_PHOTOS_RETURN_KEY = 'tc:userPhotosReturn:v1';
  var RETURN_TTL_MS = 5 * 60 * 1000;
  var LOAD_MORE_TTL_MS = 6 * 60 * 60 * 1000;
  var RESTORE_CLOSE_ENOUGH_PX = 80;
  var LOAD_MORE_KEY_PREFIX = 'tc:catalogLoadMore:v1:';
  var LOAD_MORE_SELECTOR = '#allrecords button.js-catalog-load-more-btn, #allrecords .t-btn.js-catalog-load-more-btn';
  var CATALOG_CARD_SELECTOR = [
    '#allrecords .t-store__card',
    '#allrecords .t-catalog__card',
    '#allrecords .js-store-product',
    '#allrecords .js-catalog-product',
    '#allrecords .t-catalog__product-snippet',
    '#allrecords .t-catalog__product'
  ].join(',');
  var activeRestoreKey = '';
  var activeRestoreToken = 0;
  var activeExpandKey = '';

  function isProductRoute(pathname) {
    var path = pathname || location.pathname || '';
    return /^\/product\//.test(path) || /^\/tproduct\//.test(path);
  }

  function getPageKey() {
    return location.pathname + location.search + location.hash;
  }

  function getCatalogKey() {
    return (location.pathname || '/') + (location.search || '');
  }

  function getLoadMoreStorageKey(catalogKey) {
    return LOAD_MORE_KEY_PREFIX + String(catalogKey || getCatalogKey());
  }

  function isElementVisible(el) {
    if (!el || !el.ownerDocument) return false;
    if (el.hidden) return false;

    var style = window.getComputedStyle ? getComputedStyle(el) : null;
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return false;
    if (el.getAttribute && el.getAttribute('aria-hidden') === 'true') return false;

    var rects = el.getClientRects ? el.getClientRects() : [];
    return !!(rects && rects.length);
  }

  function getVisibleCatalogCardCount() {
    var seen = [];
    var count = 0;

    document.querySelectorAll(CATALOG_CARD_SELECTOR).forEach(function (card) {
      if (!card || seen.indexOf(card) !== -1) return;
      seen.push(card);
      if (isElementVisible(card)) count += 1;
    });

    return count;
  }

  function getFilterKey() {
    var active = document.querySelector(
      '#allrecords .tc-safe-filter-active .tc-safe-filter-text,' +
      '#allrecords .tc-safe-filter-active,' +
      '#allrecords .t-catalog__parts-switch-btn.t-active .t-catalog__parts-text-title,' +
      '#allrecords .t-store__parts-switch-btn.t-active .t-catalog__parts-text-title,' +
      '#allrecords .t-catalog__parts-button-base.t-active .t-catalog__parts-text-title,' +
      '#allrecords .js-catalog-parts-switcher.t-active .t-catalog__parts-text-title'
    );

    return active ? String(active.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() : '';
  }

  function readLoadMoreState(catalogKey) {
    var raw = '';
    var state = null;

    try {
      raw = sessionStorage.getItem(getLoadMoreStorageKey(catalogKey)) || '';
    } catch (_) {
      raw = '';
    }

    if (!raw) return null;

    try {
      state = JSON.parse(raw);
    } catch (_) {
      return null;
    }

    if (!state || state.from !== 'catalog-load-more') return null;
    if (state.expiresAt && Date.now() > Number(state.expiresAt || 0)) {
      try { sessionStorage.removeItem(getLoadMoreStorageKey(catalogKey)); } catch (_) {}
      return null;
    }

    return state;
  }

  function saveLoadMoreState(extra) {
    var now = Date.now();
    var catalogKey = getCatalogKey();
    var previous = readLoadMoreState(catalogKey);
    var visibleCount = getVisibleCatalogCardCount();
    var filterKey = getFilterKey();
    var state = {
      from: 'catalog-load-more',
      ts: now,
      expiresAt: now + LOAD_MORE_TTL_MS,
      catalogKey: catalogKey,
      clickCount: Math.max(0, Number(previous && previous.clickCount || 0)) + (extra && extra.incrementClick ? 1 : 0),
      maxVisibleCards: Math.max(visibleCount, Number(previous && previous.maxVisibleCards || 0)),
      filterKey: filterKey || (previous && previous.filterKey) || ''
    };

    if (extra && Number(extra.maxVisibleCards || 0) > state.maxVisibleCards) {
      state.maxVisibleCards = Number(extra.maxVisibleCards || 0);
    }

    try {
      sessionStorage.setItem(getLoadMoreStorageKey(catalogKey), JSON.stringify(state));
    } catch (_) {}

    return state;
  }

  function getLoadMoreSnapshot() {
    var catalogKey = getCatalogKey();
    var currentCount = getVisibleCatalogCardCount();
    var saved = readLoadMoreState(catalogKey);
    var filterKey = getFilterKey();

    if (!saved) {
      return {
        from: 'catalog-load-more',
        ts: Date.now(),
        expiresAt: Date.now() + LOAD_MORE_TTL_MS,
        catalogKey: catalogKey,
        clickCount: 0,
        maxVisibleCards: currentCount,
        filterKey: filterKey || ''
      };
    }

    return {
      from: 'catalog-load-more',
      ts: saved.ts || Date.now(),
      expiresAt: saved.expiresAt || (Date.now() + LOAD_MORE_TTL_MS),
      catalogKey: catalogKey,
      clickCount: Number(saved.clickCount || 0),
      maxVisibleCards: Math.max(currentCount, Number(saved.maxVisibleCards || 0)),
      filterKey: filterKey || saved.filterKey || ''
    };
  }

  function getVisibleLoadMoreButton() {
    var buttons = document.querySelectorAll(LOAD_MORE_SELECTOR);
    var found = null;

    buttons.forEach(function (btn) {
      if (found) return;
      if (!isElementVisible(btn)) return;
      if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
      found = btn;
    });

    return found;
  }

  function ensureCatalogExpandedFromSavedState(done, restoreState) {
    var state = restoreState && restoreState.loadMoreState ? restoreState.loadMoreState : null;
    var catalogKey = (state && state.catalogKey) || (restoreState && restoreState.catalogKey) || getCatalogKey();
    var saved = state || readLoadMoreState(catalogKey);
    var desiredCount = Math.max(
      Number(saved && saved.maxVisibleCards || 0),
      Number(restoreState && restoreState.visibleCatalogCardCount || 0)
    );
    var finish = typeof done === 'function' ? done : function () {};
    var attempts = 0;
    var maxAttempts = Math.max(4, Math.min(18, Number(saved && saved.clickCount || 0) + 8));
    var expandKey = [catalogKey, desiredCount, restoreState && restoreState.ts || ''].join('|');

    if (!desiredCount) {
      finish();
      return;
    }

    if (activeExpandKey === expandKey) return;
    activeExpandKey = expandKey;

    function step() {
      var visibleCount = getVisibleCatalogCardCount();
      var btn = getVisibleLoadMoreButton();

      if (visibleCount >= desiredCount || !btn || attempts >= maxAttempts) {
        activeExpandKey = '';
        finish();
        return;
      }

      attempts += 1;
      try { btn.click(); } catch (_) {}

      setTimeout(step, attempts < 4 ? 260 : 520);
    }

    step();
  }

  function getScrollY() {
    return window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
  }

  function getMaxScrollY() {
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
      document.body ? document.body.scrollHeight - window.innerHeight : 0
    );
  }

  function isCloseEnough(a, b) {
    return Math.abs(Number(a || 0) - Number(b || 0)) < RESTORE_CLOSE_ENOUGH_PX;
  }

  function normalizeHref(href) {
    if (!href) return '';
    try {
      return new URL(href, location.origin).href;
    } catch (_) {
      return String(href || '');
    }
  }

  function isTProductHref(href) {
    return /\/tproduct\//.test(String(href || '')) ||
      /#!\/tproduct\//.test(String(href || ''));
  }

  function blurProductSourceFocus() {
    var active = document.activeElement;
    if (!active || typeof active.blur !== 'function') return;

    if (
      active.closest &&
      (
        active.closest('#tc-user-photos-root') ||
        active.closest('.js-store-grid-cont') ||
        active.closest('.t-store') ||
        active.closest('.t-catalog')
      )
    ) {
      active.blur();
    }
  }

  function saveReturnScroll(productHref, source) {
    if (isProductRoute()) return;
    if (!productHref || !isTProductHref(productHref)) return;

    var now = Date.now();
    var loadMoreSnapshot = getLoadMoreSnapshot();
    var visibleCatalogCardCount = getVisibleCatalogCardCount();
    var state = {
      ts: now,
      expiresAt: now + RETURN_TTL_MS,
      from: 'product-return-scroll',
      source: source || '',
      productHref: normalizeHref(productHref),
      pageKey: getPageKey(),
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      scrollY: getScrollY(),
      catalogKey: getCatalogKey(),
      visibleCatalogCardCount: visibleCatalogCardCount,
      loadMoreState: loadMoreSnapshot
    };

    try {
      sessionStorage.setItem(RETURN_KEY, JSON.stringify(state));
      sessionStorage.setItem(BACKUP_RETURN_KEY, JSON.stringify(state));
      sessionStorage.setItem(OPENED_KEY, JSON.stringify({
        ts: now,
        expiresAt: now + RETURN_TTL_MS,
        from: source || '',
        pageKey: getPageKey(),
        catalogKey: getCatalogKey(),
        visibleCatalogCardCount: visibleCatalogCardCount,
        loadMoreState: loadMoreSnapshot,
        scrollY: getScrollY(),
        productHref: normalizeHref(productHref)
      }));
      sessionStorage.removeItem(LEGACY_USER_PHOTOS_RETURN_KEY);
    } catch (_) {}

    if (window.__TC_DEBUG_PRODUCT_RETURN_SCROLL__) {
      console.log('[TC_PRODUCT_RETURN_SAVE]', state);
    }

    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    } catch (_) {}

    blurProductSourceFocus();
  }

  function getProductHrefFromEventTarget(target) {
    if (!target || !target.closest) return '';

    var userPhoto = target.closest('.tc-user-photos__photo-link');
    if (userPhoto && userPhoto.dataset && userPhoto.dataset.productHref) {
      return userPhoto.dataset.productHref;
    }

    var link = target.closest('a[href]');
    if (link && isTProductHref(link.getAttribute('href'))) {
      return link.getAttribute('href');
    }

    var productLink = target.closest(
      'a[href*="/tproduct/"],' +
      'a[href*="#!/tproduct/"],' +
      '.js-product-url[href],' +
      '.t-store__card a[href*="/tproduct/"],' +
      '.t-store__card a[href*="#!/tproduct/"],' +
      '.t-catalog__product a[href*="/tproduct/"],' +
      '.t-catalog__product a[href*="#!/tproduct/"]'
    );

    if (productLink && productLink.getAttribute) {
      return productLink.getAttribute('href') || '';
    }

    return '';
  }

  function saveFromEvent(e) {
    if (!e || !e.target) return;
    var href = getProductHrefFromEventTarget(e.target);
    if (!href) return;

    var source = e.target.closest && e.target.closest('#tc-user-photos-root')
      ? 'user-photos'
      : 'catalog';

    saveReturnScroll(href, source);
  }

  function saveLoadMoreFromEvent(e) {
    if (!e || !e.target || !e.target.closest) return;
    if (!e.target.closest(LOAD_MORE_SELECTOR)) return;

    saveLoadMoreState({ incrementClick: true });

    [180, 520, 1100, 1800].forEach(function (delay) {
      setTimeout(function () {
        saveLoadMoreState();
      }, delay);
    });
  }

  function migrateLegacyState(raw) {
    var legacy = null;
    try {
      legacy = JSON.parse(raw || '');
    } catch (_) {
      legacy = null;
    }

    if (!legacy || legacy.from !== 'user-photos') return null;

    var pageKey = legacy.path || getPageKey();
    var pathname = location.pathname;
    var search = location.search;
    var hash = location.hash;

    try {
      var url = new URL(pageKey, location.origin);
      pathname = url.pathname;
      search = url.search;
      hash = url.hash;
    } catch (_) {}

    var ts = Number(legacy.ts || 0) || Date.now();
    var state = {
      ts: ts,
      expiresAt: ts + RETURN_TTL_MS,
      from: 'product-return-scroll',
      source: 'user-photos-legacy',
      productHref: normalizeHref(legacy.productHref || ''),
      pageKey: pageKey,
      pathname: pathname,
      search: search,
      hash: hash,
      scrollY: Number(legacy.scrollY || 0) || 0
    };

    try {
      sessionStorage.setItem(RETURN_KEY, JSON.stringify(state));
      sessionStorage.setItem(BACKUP_RETURN_KEY, JSON.stringify(state));
      sessionStorage.removeItem(LEGACY_USER_PHOTOS_RETURN_KEY);
    } catch (_) {}

    return state;
  }

  function parseStateRaw(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function readState() {
    var raw = '';
    var state = null;

    try {
      raw = sessionStorage.getItem(RETURN_KEY) || '';
    } catch (_) {
      raw = '';
    }

    state = parseStateRaw(raw);
    if (state) return state;

    try {
      raw = sessionStorage.getItem(BACKUP_RETURN_KEY) || '';
    } catch (_) {
      raw = '';
    }

    state = parseStateRaw(raw);
    if (state) {
      try {
        sessionStorage.setItem(RETURN_KEY, JSON.stringify(state));
      } catch (_) {}
      return state;
    }

    try {
      raw = sessionStorage.getItem(LEGACY_USER_PHOTOS_RETURN_KEY) || '';
    } catch (_) {
      raw = '';
    }

    if (!raw) return null;
    return migrateLegacyState(raw);
  }

  function clearState() {
    activeRestoreKey = '';
    try {
      sessionStorage.removeItem(RETURN_KEY);
      sessionStorage.removeItem(BACKUP_RETURN_KEY);
      sessionStorage.removeItem(LEGACY_USER_PHOTOS_RETURN_KEY);
    } catch (_) {}
  }

  function shouldRestore(state) {
    if (!state || state.from !== 'product-return-scroll') return false;
    if (isProductRoute()) return false;

    var expiresAt = Number(state.expiresAt || 0);
    if (!expiresAt) {
      expiresAt = (Number(state.ts || 0) || Date.now()) + RETURN_TTL_MS;
    }

    if (Date.now() > expiresAt) {
      clearState();
      return false;
    }

    var currentPath = location.pathname || '/';
    var savedPath = state.pathname || '/';

    return currentPath === savedPath;
  }

  function getRestoreStateKey(state) {
    return [
      state.ts || '',
      state.expiresAt || '',
      state.pathname || '',
      state.scrollY || '',
      state.productHref || ''
    ].join('|');
  }

  function endRestoreUi(stateKey) {
    if (activeRestoreKey === stateKey) activeRestoreKey = '';
    document.documentElement.classList.remove('tc-product-return-restoring-scroll');
    if (document.body) document.body.classList.remove('tc-product-return-restoring-scroll');
  }

  function startReturnScrollRestore(state, stateKey) {
    var targetY = Number(state.scrollY || 0);
    if (!Number.isFinite(targetY) || targetY < 0) targetY = 0;

    document.documentElement.classList.add('tc-product-return-restoring-scroll');
    if (document.body) document.body.classList.add('tc-product-return-restoring-scroll');

    try {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    } catch (_) {}

    var successCount = 0;
    var attempts = 0;
    var completedChecks = 0;
    var token = ++activeRestoreToken;
    var delays = [
      0,
      50,
      120,
      240,
      500,
      900,
      1400,
      2200,
      3200,
      4500,
      6000,
      8000,
      10000,
      15000,
      22000,
      30000
    ];

    function attemptRestore() {
      if (token !== activeRestoreToken) return;

      var latestState = readState();
      if (!shouldRestore(latestState)) {
        endRestoreUi(stateKey);
        return;
      }

      attempts += 1;
      blurProductSourceFocus();

      var maxY = getMaxScrollY();
      var y = maxY > 0 ? Math.min(targetY, maxY) : targetY;

      window.scrollTo(0, y);

      setTimeout(function () {
        if (token !== activeRestoreToken) return;

        completedChecks += 1;

        var currentY = getScrollY();

        if (isCloseEnough(currentY, targetY) || (maxY >= targetY - RESTORE_CLOSE_ENOUGH_PX && isCloseEnough(currentY, y))) {
          successCount += 1;
        } else {
          successCount = 0;
        }

        window.__TC_PRODUCT_RETURN_SCROLL_LAST_ATTEMPT__ = {
          attempts: attempts,
          targetY: targetY,
          appliedY: y,
          currentY: currentY,
          maxY: maxY,
          successCount: successCount,
          state: latestState
        };

        if (successCount >= 2) {
          endRestoreUi(stateKey);
          clearState();
          return;
        }

        if (completedChecks >= delays.length) {
          endRestoreUi(stateKey);
        }
      }, 120);
    }

    delays.forEach(function (delay) {
      setTimeout(attemptRestore, delay);
    });
  }

  function restoreReturnScroll() {
    var state = readState();
    if (!shouldRestore(state)) return;

    var stateKey = getRestoreStateKey(state);
    if (activeRestoreKey === stateKey) return;
    activeRestoreKey = stateKey;

    ensureCatalogExpandedFromSavedState(function () {
      startReturnScrollRestore(state, stateKey);
    }, state);
  }

  document.addEventListener('pointerdown', saveFromEvent, true);
  document.addEventListener('click', saveFromEvent, true);
  document.addEventListener('click', saveLoadMoreFromEvent, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restoreReturnScroll);
  } else {
    restoreReturnScroll();
  }

  window.addEventListener('load', restoreReturnScroll);
  window.addEventListener('pageshow', restoreReturnScroll);
  window.addEventListener('popstate', restoreReturnScroll);
  window.addEventListener('hashchange', restoreReturnScroll);

  [50, 150, 400, 900, 1600, 2400].forEach(function (delay) {
    setTimeout(restoreReturnScroll, delay);
  });

  window.__TC_SAVE_PRODUCT_RETURN_SCROLL__ = saveReturnScroll;
  window.__TC_RESTORE_PRODUCT_RETURN_SCROLL__ = restoreReturnScroll;
  window.__TC_FORCE_PRODUCT_RETURN_RESTORE__ = restoreReturnScroll;
  window.__TC_CATALOG_LOAD_MORE_STATE__ = function () { return readLoadMoreState(getCatalogKey()); };
  window.__TC_VISIBLE_CATALOG_CARD_COUNT__ = getVisibleCatalogCardCount;

  window.__TC_PRODUCT_RETURN_SCROLL_STATE__ = function () {
    var state = readState();
    var expiresAt = state ? Number(state.expiresAt || 0) : 0;
    return {
      raw: (function () {
        try { return sessionStorage.getItem(RETURN_KEY) || ''; } catch (_) { return ''; }
      })(),
      backupRaw: (function () {
        try { return sessionStorage.getItem(BACKUP_RETURN_KEY) || ''; } catch (_) { return ''; }
      })(),
      parsed: state,
      expiresAt: expiresAt,
      ttlLeftMs: expiresAt ? Math.max(0, expiresAt - Date.now()) : 0,
      shouldRestore: shouldRestore(state),
      isProductRoute: isProductRoute(),
      currentPageKey: getPageKey(),
      currentCatalogKey: getCatalogKey(),
      currentScrollY: getScrollY(),
      loadMoreState: readLoadMoreState(getCatalogKey()),
      visibleCatalogCardCount: getVisibleCatalogCardCount(),
      lastAttempt: window.__TC_PRODUCT_RETURN_SCROLL_LAST_ATTEMPT__ || null,
      activeElement: document.activeElement ? {
        tag: document.activeElement.tagName,
        cls: document.activeElement.className
      } : null
    };
  };
})();

(function () {
  "use strict";

  if (window.__TC_PRODUCT_EXIT_CONTROLLER_V1__) return;
  window.__TC_PRODUCT_EXIT_CONTROLLER_V1__ = true;

  var OPENED_KEY = 'tc:productOpenedFromSite:v1';

  function isProductRoute() {
    var path = location.pathname || '';
    return /^\/product\//.test(path) || /^\/tproduct\//.test(path);
  }

  function readOpenedState() {
    var raw = '';
    try { raw = sessionStorage.getItem(OPENED_KEY) || ''; } catch (_) {}
    if (!raw) return null;

    try { return JSON.parse(raw); } catch (_) {
      return null;
    }
  }

  function canUseHistoryBack() {
    if (!isProductRoute()) return false;

    var state = readOpenedState();
    if (!state) return false;

    var expiresAt = Number(state.expiresAt || 0);
    if (expiresAt && Date.now() > expiresAt) return false;

    // history.length is not perfect, but if we have our own marker,
    // it is safe enough to try history.back().
    return window.history && window.history.length > 1;
  }

  function fallbackToHome() {
    window.location.href = '/';
  }

  function goBackToPreviousPage() {
    if (canUseHistoryBack()) {
      try {
        history.back();
        return true;
      } catch (_) {}
    }

    fallbackToHome();
    return false;
  }

  function isProductBackLink(node) {
    if (!node || !node.closest) return false;

    var link = node.closest('a, button, [role="button"]');
    if (!link) return false;

    var text = String(link.textContent || '').toLowerCase();
    var href = link.getAttribute && String(link.getAttribute('href') || '');
    var absoluteHref = '';

    try {
      absoluteHref = href ? new URL(href, location.origin).href : '';
    } catch (_) {
      absoluteHref = href;
    }

    return (
      text.indexOf('назад') !== -1 ||
      text.indexOf('галере') !== -1 ||
      text.indexOf('more products') !== -1 ||
      href === '/' ||
      absoluteHref === 'https://tripchiller.com/' ||
      absoluteHref === 'http://tripchiller.com/'
    );
  }

  document.addEventListener('click', function (e) {
    if (!isProductRoute()) return;
    if (!isProductBackLink(e.target)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    goBackToPreviousPage();
  }, true);

  document.addEventListener('keydown', function (e) {
    if (!isProductRoute()) return;
    if (!e || e.key !== 'Escape') return;

    var tag = document.activeElement && document.activeElement.tagName;
    if (tag && /^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    goBackToPreviousPage();
  }, true);

  window.__TC_PRODUCT_EXIT_STATE__ = function () {
    return {
      isProductRoute: isProductRoute(),
      openedState: readOpenedState(),
      canUseHistoryBack: canUseHistoryBack(),
      historyLength: history.length,
      referrer: document.referrer || ''
    };
  };
})();

(function () {
  "use strict";

  window.__TC_PRODUCT_FLOW_DEBUG__ = function () {
    return {
      path: location.pathname,
      hash: location.hash,
      scrollY: window.pageYOffset || document.documentElement.scrollTop || 0,
      loadMoreState: window.__TC_CATALOG_LOAD_MORE_STATE__ ? window.__TC_CATALOG_LOAD_MORE_STATE__() : null,
      visibleCatalogCardCount: window.__TC_VISIBLE_CATALOG_CARD_COUNT__ ? window.__TC_VISIBLE_CATALOG_CARD_COUNT__() : 0,
      productReturnState: window.__TC_PRODUCT_RETURN_SCROLL_STATE__ ? window.__TC_PRODUCT_RETURN_SCROLL_STATE__() : null,
      productExitState: window.__TC_PRODUCT_EXIT_STATE__ ? window.__TC_PRODUCT_EXIT_STATE__() : null
    };
  };
})();

(function () {
  "use strict";

  var GUARD_KEY = '__TC_USER_PHOTOS_T123_V2__';
  var prevInstance = window[GUARD_KEY];
  if (prevInstance && typeof prevInstance.destroy === 'function') prevInstance.destroy();

  var USER_PHOTOS_REV = '20260521';

  var USER_PHOTOS = [
    { src: "https://static.tildacdn.com/tild3866-3134-4235-b739-386236373939/20250209_152049_IMG_.jpg", href: "https://tripchiller.com/tproduct/737223104992-camo-trauma", alt: "Camo Trauma" },
    { src: "https://static.tildacdn.com/tild3165-6233-4966-b365-306534343730/jT-rqCPef8n7kAtP79Dv.jpg", href: "", alt: "Фото адепта TRIPCHILLER" },
    { src: "https://static.tildacdn.com/tild3239-3630-4538-b363-333364323737/IMG_4749__2.jpg", href: "https://tripchiller.com/tproduct/919617109602-seraphim", alt: "SERAPHIM T-SHIRT" },
    { src: "https://static.tildacdn.com/tild3234-3538-4661-b436-346663663433/photo_2025-12-07_17-.jpg", href: "https://tripchiller.com/tproduct/872098106042-dfmb", alt: "DFMB Distressed black cap" },
    { src: "https://static.tildacdn.com/tild6632-6531-4062-b932-326661346366/IMG_8909.JPG", href: "https://tripchiller.com/tproduct/878341104272-dfmb", alt: "DFMB washed cap" },
    { src: "https://static.tildacdn.com/tild3138-3131-4030-b235-343662656564/IMG_4749__3.jpg", href: "https://tripchiller.com/tproduct/872098106042-dfmb", alt: "Distressed DFM Sand Cap" },
    { src: "https://static.tildacdn.com/tild3934-6435-4062-b035-623934333265/photo_2024-08-29_14-.jpg", href: "https://tripchiller.com/tproduct/516945778212-bloodie", alt: "BLOOD TANK TOP" },
    { src: "https://static.tildacdn.com/tild3462-3738-4665-a163-663163373862/photo_2026-01-07_05-.jpg", href: "https://tripchiller.com/tproduct/878341104272-dfmb", alt: "DFMB WASHED" },
    { src: "https://static.tildacdn.com/tild6438-3732-4131-a662-316337343765/IMG_47102_.jpg", href: "https://tripchiller.com/tproduct/872098106042-dfmb", alt: "Distressed DFMB Black Cap" },
    { src: "https://static.tildacdn.com/tild3331-3461-4235-b136-336637336333/6yu6j06OMVuTiTq3_83Q.jpg", href: "", alt: "BLACK STAR T-SHIRT" },
    { src: "https://static.tildacdn.com/tild6335-3432-4565-b636-306436343532/photo_2026-05-21_14-.jpg", href: "https://tripchiller.com/tproduct/657386204082-fog-mood", alt: "FOG MOOD CUSTOM CAP" },
    { src: "https://static.tildacdn.com/tild6263-3933-4631-b765-343764386231/IMG_4749__33.jpg", href: "https://tripchiller.com/tproduct/502715167942-glamour-emo", alt: "GLAMOUR EMO CAP" },
    { src: "https://static.tildacdn.com/tild6661-3232-4464-a231-623165643665/IMG_4749__34.jpg", href: "https://tripchiller.com/tproduct/502715167942-glamour-emo", alt: "GLAMOUR EMO CAP" },
    { src: "https://static.tildacdn.com/tild6232-6665-4532-b732-363561623133/IMG_4749__5.jpg", href: "https://tripchiller.com/tproduct/878341104272-dfmb", alt: "DFMB WASHED CAP" },
    { src: "https://static.tildacdn.com/tild3461-3739-4230-b437-356534376461/IMG_47102__2.jpg", href: "https://tripchiller.com/tproduct/709803209462-dfmb", alt: "DFMB T-SHIRT" },
    { src: "https://static.tildacdn.com/tild3263-6663-4261-b862-303232613766/IMG_4242__2.jpg", href: "https://tripchiller.com/tproduct/460014246552-frozen-flame", alt: "FROZEN VITEK FLAME T-SHIRT" },
    { src: "https://static.tildacdn.com/tild3237-3265-4434-b361-353639366137/_.jpg", href: "https://tripchiller.com/tproduct/658421571912-hand-printed", alt: "HAND-PRINTED POLO SHIRT" }
  ];

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function mod(n, m) { return ((n % m) + m) % m; }

  function withPhotoRev(url) {
    if (!url) return url;
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'rev=' + USER_PHOTOS_REV;
  }

  function saveUserPhotosReturnState(productHref) {
    if (window.__TC_SAVE_PRODUCT_RETURN_SCROLL__) {
      window.__TC_SAVE_PRODUCT_RETURN_SCROLL__(productHref, 'user-photos');
    }
  }

  window.__TC_USER_PHOTOS_RETURN_STATE__ = function () {
    if (window.__TC_PRODUCT_RETURN_SCROLL_STATE__) {
      return window.__TC_PRODUCT_RETURN_SCROLL_STATE__();
    }

    return {
      raw: '',
      parsed: null,
      shouldRestore: false,
      isProductRoute: false,
      currentPageKey: location.pathname + location.search + location.hash,
      currentScrollY: window.pageYOffset || document.documentElement.scrollTop || 0,
      activeElement: document.activeElement ? {
        tag: document.activeElement.tagName,
        cls: document.activeElement.className
      } : null
    };
  };
  function getPhotoSrc(item) {
    if (!item) return "";
    return typeof item === "string" ? item : item.src || "";
  }
  function getPhotoHref(item) {
    if (!item || typeof item === "string") return "";
    return item.href || "";
  }
  function getPhotoAlt(item, idx) {
    if (!item || typeof item === "string") return "Фото трипонавта " + (idx + 1);
    return item.alt || ("Фото трипонавта " + (idx + 1));
  }

  function randomInt(max) {
    if (max <= 0) return 0;

    if (window.crypto && window.crypto.getRandomValues) {
      var arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0] % max;
    }

    return Math.floor(Math.random() * max);
  }

  function shufflePhotos(list) {
    var arr = list.slice();

    for (var i = arr.length - 1; i > 0; i -= 1) {
      var j = randomInt(i + 1);
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }

    return arr;
  }

  function build(root) {
    var tickerSepToken = '\u00A0\u00A0|\u00A0\u00A0';
    var topTickerText =
      'ЗДЕСЬ ОТОБРАЖАЮТСЯ РАНДОМНЫЕ ФОТО НАШИХ АДЕПТОВ' +
      tickerSepToken +
      'ОСТАВЬ СВОЙ СЛЕД - ПРИШЛИ ФОТКУ В ЛЮБОМ ИЗДЕЛИИ В ДИРЕКТ: ' +
      '<a class="tc-user-photos__ticker-link" href="https://t.me/TRIPCHILLER_OFFICIAL" target="_blank" rel="noopener noreferrer">T.ME/TRIPCHILLER_OFFICIAL</a>';
    var bottomTickerText =
      'МЫ УВАЖАЕМ ПРИВАТНОСТЬ КАЖДОГО УЧАСТНИКА' +
      tickerSepToken +
      'В АРХИВ ПОПАДАЮТ ТОЛЬКО ФОТО, ПРИСЛАННЫЕ ВЛАДЕЛЬЦАМИ С ИХ РАЗРЕШЕНИЯ';

    function buildTickerLine(text) {
      var item = '<span class="tc-user-photos__ticker-item">' + text + '</span>';
      var sep = '<span class="tc-user-photos__ticker-sep" aria-hidden="true">' + tickerSepToken + '</span>';

      return item + sep + item + sep + item + sep + item;
    }

    var topTickerLine = buildTickerLine(topTickerText);
    var bottomTickerLine = buildTickerLine(bottomTickerText);

    root.innerHTML = '' +
      '<section class="tc-user-photos" aria-label=":: C0MMUN1TY ::">' +
        '<h2 class="tc-user-photos__title">:: C0MMUN1TY ::</h2>' +
        '<div class="tc-user-photos__ticker tc-user-photos__ticker--top" aria-hidden="true">' +
          '<div class="tc-user-photos__ticker-track">' + topTickerLine + '</div>' +
        '</div>' +
        '<div class="tc-user-photos__carousel">' +
          '<button class="tc-user-photos__nav tc-user-photos__nav--prev" type="button" aria-label="Предыдущее фото"><span>‹</span></button>' +
          '<div class="tc-user-photos__viewport">' +
            '<div class="tc-user-photos__track">' +
              '<div class="tc-user-photos__slide tc-user-photos__slide--far-prev"><a class="tc-user-photos__photo-link" href="" draggable="false" aria-label="Открыть товар"><img class="tc-user-photos__img" draggable="false" loading="lazy" decoding="async" alt="Фото трипонавта"></a></div>' +
              '<div class="tc-user-photos__slide tc-user-photos__slide--prev"><a class="tc-user-photos__photo-link" href="" draggable="false" aria-label="Открыть товар"><img class="tc-user-photos__img" draggable="false" loading="lazy" decoding="async" alt="Фото трипонавта"></a></div>' +
              '<div class="tc-user-photos__slide tc-user-photos__slide--active"><a class="tc-user-photos__photo-link" href="" draggable="false" aria-label="Открыть товар"><img class="tc-user-photos__img" draggable="false" loading="lazy" decoding="async" alt="Фото трипонавта"></a></div>' +
              '<div class="tc-user-photos__slide tc-user-photos__slide--next"><a class="tc-user-photos__photo-link" href="" draggable="false" aria-label="Открыть товар"><img class="tc-user-photos__img" draggable="false" loading="lazy" decoding="async" alt="Фото трипонавта"></a></div>' +
              '<div class="tc-user-photos__slide tc-user-photos__slide--far-next"><a class="tc-user-photos__photo-link" href="" draggable="false" aria-label="Открыть товар"><img class="tc-user-photos__img" draggable="false" loading="lazy" decoding="async" alt="Фото трипонавта"></a></div>' +
            '</div>' +
          '</div>' +
          '<button class="tc-user-photos__nav tc-user-photos__nav--next" type="button" aria-label="Следующее фото"><span>›</span></button>' +
        '</div>' +
        '<div class="tc-user-photos__ticker tc-user-photos__ticker--bottom" aria-hidden="true">' +
          '<div class="tc-user-photos__ticker-track">' + bottomTickerLine + '</div>' +
        '</div>' +
      '</section>';

    return root.querySelector('.tc-user-photos');
  }

  ready(function () {
    var root = document.getElementById('tc-user-photos-root');
    if (!root) return;

    root.innerHTML = '';
    var section = build(root);
    if (!section) return;

    var track = section.querySelector('.tc-user-photos__track');
    var viewport = section.querySelector('.tc-user-photos__viewport');
    var farPrevSlide = section.querySelector('.tc-user-photos__slide--far-prev');
    var prevSlide = section.querySelector('.tc-user-photos__slide--prev');
    var activeSlide = section.querySelector('.tc-user-photos__slide--active');
    var nextSlide = section.querySelector('.tc-user-photos__slide--next');
    var farNextSlide = section.querySelector('.tc-user-photos__slide--far-next');
    var farPrevLink = farPrevSlide ? farPrevSlide.querySelector('.tc-user-photos__photo-link') : null;
    var prevLink = prevSlide ? prevSlide.querySelector('.tc-user-photos__photo-link') : null;
    var activeLink = activeSlide ? activeSlide.querySelector('.tc-user-photos__photo-link') : null;
    var nextLink = nextSlide ? nextSlide.querySelector('.tc-user-photos__photo-link') : null;
    var farNextLink = farNextSlide ? farNextSlide.querySelector('.tc-user-photos__photo-link') : null;
    var farPrevImg = farPrevSlide ? farPrevSlide.querySelector('.tc-user-photos__img') : null;
    var prevImg = prevSlide ? prevSlide.querySelector('.tc-user-photos__img') : null;
    var activeImg = activeSlide ? activeSlide.querySelector('.tc-user-photos__img') : null;
    var nextImg = nextSlide ? nextSlide.querySelector('.tc-user-photos__img') : null;
    var farNextImg = farNextSlide ? farNextSlide.querySelector('.tc-user-photos__img') : null;
    var prevBtn = section.querySelector('.tc-user-photos__nav--prev');
    var nextBtn = section.querySelector('.tc-user-photos__nav--next');
    var topTickerTrack = section.querySelector('.tc-user-photos__ticker--top .tc-user-photos__ticker-track');
    var bottomTickerTrack = section.querySelector('.tc-user-photos__ticker--bottom .tc-user-photos__ticker-track');

    var photos = shufflePhotos(USER_PHOTOS);
    var len = photos.length;
    var current = len > 0 ? randomInt(len) : 0;
    var isSliding = false;
    var cleanupTransition = null;
    var tickerResizeRaf = 0;
    var autoTimer = 0;
    var AUTO_INTERVAL = 5000;
    var suppressPhotoClickUntil = 0;
    var dragState = null;
    var DRAG_START_THRESHOLD = 8;
    var DRAG_COMMIT_THRESHOLD = 70;
    var MAX_DRAG_RATIO = 0.9;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function parseAnimationDurationMs(track) {
      if (!track || !window.getComputedStyle) return 24000;

      var duration = window.getComputedStyle(track).animationDuration || '24s';
      var first = duration.split(',')[0].trim();

      if (first.slice(-2) === 'ms') return parseFloat(first) || 24000;
      if (first.slice(-1) === 's') return (parseFloat(first) || 24) * 1000;

      return 24000;
    }

    function syncTickerSpeeds() {
      if (!topTickerTrack || !bottomTickerTrack) return;

      var topWidth = topTickerTrack.scrollWidth || 0;
      var bottomWidth = bottomTickerTrack.scrollWidth || 0;
      if (!topWidth || !bottomWidth) return;

      var bottomDurationMs = parseAnimationDurationMs(bottomTickerTrack);
      var topDurationMs = bottomDurationMs * (topWidth / bottomWidth);

      topTickerTrack.style.animationDuration = Math.max(1000, topDurationMs) + 'ms';
    }

    function scheduleTickerSpeedSync() {
      if (tickerResizeRaf) return;
      tickerResizeRaf = requestAnimationFrame(function () {
        tickerResizeRaf = 0;
        syncTickerSpeeds();
      });
    }

    function getIndices(index) {
      if (len === 0) {
        return { farPrev: -1, prev: -1, active: -1, next: -1, farNext: -1 };
      }
      if (len === 1) {
        return { farPrev: 0, prev: 0, active: 0, next: 0, farNext: 0 };
      }
      return {
        farPrev: mod(index - 2, len),
        prev: mod(index - 1, len),
        active: mod(index, len),
        next: mod(index + 1, len),
        farNext: mod(index + 2, len)
      };
    }
    function getCurrentPhotoHref() {
      if (len < 1 || current < 0 || !photos[current]) return '';
      return getPhotoHref(photos[current]) || '';
    }

    function setPhotoSlot(link, img, idx, role) {
      if (!img || idx < 0 || !photos[idx]) return;
      var item = photos[idx];
      var src = getPhotoSrc(item);
      var href = getPhotoHref(item);
      var alt = getPhotoAlt(item, idx);
      img.src = withPhotoRev(src);
      img.alt = alt;
      if (!link) return;
      link.setAttribute('aria-label', href ? 'Открыть товар по фото' : alt);
      link.dataset.photoRole = role || '';
      link.dataset.photoIndex = String(idx);
      link.dataset.productHref = role === 'active' ? (href || '') : '';
      link.removeAttribute('href');
      link.removeAttribute('target');
      if (role === 'active' && href) {
        link.classList.add('is-linked');
        link.classList.remove('is-not-linked');
        link.setAttribute('role', 'button');
        link.tabIndex = 0;
        link.removeAttribute('aria-disabled');
      } else {
        link.classList.remove('is-linked');
        link.classList.add('is-not-linked');
        link.removeAttribute('role');
        link.tabIndex = -1;
        link.setAttribute('aria-disabled', 'true');
      }
    }

    function preloadNeighbors(index) {
      if (len < 2) return;
      [-3, -2, -1, 1, 2, 3].forEach(function (offset) {
        var idx = mod(index + offset, len);
        if (idx < 0 || !photos[idx]) return;
        var img = new Image();
        img.decoding = 'async';
        img.src = withPhotoRev(getPhotoSrc(photos[idx]));
      });
    }

    function render() {
      var ids = getIndices(current);
      if (ids.active < 0) return;
      setPhotoSlot(farPrevLink, farPrevImg, ids.farPrev, 'far-prev');
      setPhotoSlot(prevLink, prevImg, ids.prev, 'prev');
      setPhotoSlot(activeLink, activeImg, ids.active, 'active');
      setPhotoSlot(nextLink, nextImg, ids.next, 'next');
      setPhotoSlot(farNextLink, farNextImg, ids.farNext, 'far-next');
      preloadNeighbors(current);
    }

    function cleanupSlideState() {
      section.classList.remove('is-sliding-prev');
      section.classList.remove('is-sliding-next');
    }

    function finalize(dir) {
      if (!isSliding) return;

      isSliding = false;

      var nextCurrent = dir === 'next'
        ? mod(current + 1, len || 1)
        : mod(current - 1, len || 1);

      section.classList.add('is-resetting');

      cleanupSlideState();
      current = nextCurrent;
      render();

      if (cleanupTransition) {
        cleanupTransition();
        cleanupTransition = null;
      }

      if (track) void track.offsetWidth;

      requestAnimationFrame(function () {
        section.classList.remove('is-resetting');
      });
    }

    function slide(dir) {
      if (isSliding || len < 2 || !track) return false;
      isSliding = true;
      cleanupSlideState();
      void track.offsetWidth;
      section.classList.add(dir === 'next' ? 'is-sliding-next' : 'is-sliding-prev');

      var done = false;
      var timeoutId = setTimeout(function () {
        if (done) return;
        done = true;
        finalize(dir);
      }, 820);

      var onEnd = function (e) {
        if (e && e.target !== track) return;
        if (e && e.propertyName && e.propertyName !== 'transform') return;
        if (done) return;

        done = true;
        clearTimeout(timeoutId);
        finalize(dir);
      };

      track.addEventListener('transitionend', onEnd);
      cleanupTransition = function () {
        clearTimeout(timeoutId);
        track.removeEventListener('transitionend', onEnd);
      };

      return true;
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = 0;
      }
    }

    function startAuto() {
      stopAuto();
      if (reducedMotion || len < 2) return;
      autoTimer = setInterval(function () {
        slide('next');
      }, AUTO_INTERVAL);
    }

    function restartAuto() {
      stopAuto();
      startAuto();
    }
    function shouldSuppressPhotoClick() { return Date.now() < suppressPhotoClickUntil; }
    function getSlideStepPx() {
      if (!track) return 0;
      var raw = window.getComputedStyle(section).getPropertyValue('--tc-user-slide-step');
      var parsed = parseFloat(raw);
      if (parsed) return parsed;
      if (activeSlide && nextSlide) {
        var activeRect = activeSlide.getBoundingClientRect();
        var nextRect = nextSlide.getBoundingClientRect();
        return Math.abs(nextRect.left - activeRect.left) || 320;
      }
      return 320;
    }

    function onVisibilityChange() {
      if (document.hidden) stopAuto();
      else startAuto();
    }

    function onPrev() {
      if (slide('prev')) restartAuto();
    }
    function onNext() {
      if (slide('next')) restartAuto();
    }
    function onPrevSlideClick(e) {
      if (shouldSuppressPhotoClick()) { e.preventDefault(); e.stopPropagation(); return; }
      e.preventDefault();
      if (slide('prev')) restartAuto();
    }
    function onNextSlideClick(e) {
      if (shouldSuppressPhotoClick()) { e.preventDefault(); e.stopPropagation(); return; }
      e.preventDefault();
      if (slide('next')) restartAuto();
    }
    function getTProductIdFromHref(href) {
      if (!href) return '';
      var match = String(href).match(/tproduct\/([^?#]+)/);
      return match ? match[1] : '';
    }
    function getShortTProductId(productId) {
      if (!productId) return '';
      var parts = String(productId).split('-');
      return parts.length > 1 ? parts[parts.length - 1] : '';
    }
    function getHrefHash(href) {
      var raw = String(href || '');
      var hashIndex = raw.indexOf('#!');
      return hashIndex >= 0 ? raw.slice(hashIndex) : '';
    }
    function normalizeHrefForCompare(value) {
      return String(value || '').replace(/^https?:\/\/[^/]+/i, '');
    }
    function isInsideUserPhotos(node) {
      return !!(node && node.closest && node.closest('#tc-user-photos-root'));
    }
    function isClickableCandidate(node) {
      if (!node || !node.matches) return false;
      return node.matches('a, button, [role="button"], .t-store__card__btn, .t-store__card__btns-wrapper a, .t778__btn, .t-btn, .js-store-prod-name, .js-product-url');
    }
    function getClickableFromCandidate(node) {
      if (!node || isInsideUserPhotos(node)) return null;
      if (isClickableCandidate(node)) return node;
      var descendant = node.querySelector && node.querySelector(
        'a[href*="#!/tproduct/"], a[href*="/#!/tproduct/"], a[href*="tproduct"], button, [role="button"], .t-store__card__btn, .t-store__card__btns-wrapper a, .t778__btn, .t-btn, .js-store-prod-name, .js-product-url'
      );
      if (descendant && !isInsideUserPhotos(descendant)) return descendant;
      var closest = node.closest && node.closest(
        'a, button, [role="button"], .t-store__card__btn, .t778__btn, .t-btn, .js-store-prod-name, .js-product-url'
      );
      if (closest && !isInsideUserPhotos(closest)) return closest;
      return null;
    }
    function findTildaProductClickable(href) {
      var productId = getTProductIdFromHref(href);
      var shortProductId = getShortTProductId(productId);
      var hrefHash = getHrefHash(href);
      var normalizedHref = normalizeHrefForCompare(href);
      var selectors = [];
      if (hrefHash) {
        selectors.push('a[href="' + hrefHash + '"]');
        selectors.push('a[href*="' + hrefHash + '"]');
      }
      if (normalizedHref) selectors.push('a[href*="' + normalizedHref + '"]');
      if (productId) {
        selectors.push('a[href*="' + productId + '"]');
        selectors.push('[data-product-lid="' + productId + '"]');
        selectors.push('[data-product-gen-uid="' + productId + '"]');
        selectors.push('[data-product-id="' + productId + '"]');
        selectors.push('[data-product-uid="' + productId + '"]');
      }
      if (shortProductId) {
        selectors.push('a[href*="' + shortProductId + '"]');
        selectors.push('[data-product-lid="' + shortProductId + '"]');
        selectors.push('[data-product-gen-uid="' + shortProductId + '"]');
        selectors.push('[data-product-id="' + shortProductId + '"]');
        selectors.push('[data-product-uid="' + shortProductId + '"]');
      }
      for (var i = 0; i < selectors.length; i += 1) {
        var nodes = Array.prototype.slice.call(document.querySelectorAll(selectors[i]));
        for (var j = 0; j < nodes.length; j += 1) {
          var node = nodes[j];
          if (!node || node === activeLink || isInsideUserPhotos(node)) continue;
          var clickable = getClickableFromCandidate(node);
          if (clickable && !isInsideUserPhotos(clickable)) return clickable;
        }
      }
      return null;
    }
    function clickTildaTarget(target) {
      if (!target) return false;
      try {
        target.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
        target.dispatchEvent(new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
        target.dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
        return true;
      } catch (_) {
        try {
          target.click();
          return true;
        } catch (__) {
          return false;
        }
      }
    }
    function openTildaProductByHashFallback(href) {
      var hrefHash = getHrefHash(href);
      if (!hrefHash) {
        window.location.href = href;
        return true;
      }
      var applyHash = function () {
        window.location.hash = hrefHash;
        try {
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } catch (_) {
          window.dispatchEvent(new Event('hashchange'));
        }
        try {
          window.dispatchEvent(new Event('popstate'));
        } catch (_) {}
      };
      if (window.location.hash === hrefHash) {
        window.location.hash = '';
        setTimeout(applyHash, 30);
      } else {
        applyHash();
      }
      return true;
    }
    function openTildaProductFromPhoto(href) {
      if (!href) return false;
      var target = findTildaProductClickable(href);
      if (window.__TC_DEBUG_USER_PHOTOS) {
        console.log('[USER_PHOTOS] open product', { href: href, target: target });
      }
      if (target) {
        clickTildaTarget(target);
        setTimeout(function () {
          var hasPopup = document.querySelector('.t-store__prod-popup, .t-popup_show, .t-popup.t-popup_show, .js-product-popup, .t-store__product-popup');
          if (!hasPopup) openTildaProductByHashFallback(href);
        }, 120);
        return true;
      }
      return openTildaProductByHashFallback(href);
    }
    function onActiveLinkClick(e) {
      if (shouldSuppressPhotoClick()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      var href = getCurrentPhotoHref();
      if (window.__TC_DEBUG_USER_PHOTOS) {
        console.log('[USER_PHOTOS] active click current href', {
          current: current,
          href: href,
          datasetHref: activeLink ? activeLink.dataset.productHref : ''
        });
      }
      if (!href || !activeLink || activeLink.classList.contains('is-not-linked')) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      saveUserPhotosReturnState(href);
      openTildaProductFromPhoto(href);
    }
    function onActiveLinkKeyDown(e) {
      if (!e) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      onActiveLinkClick(e);
    }
    function onDragStart(e) {
      if (isSliding || len < 2) return;
      if (e && e.target && e.target.closest('.tc-user-photos__nav')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (typeof e.isPrimary === 'boolean' && !e.isPrimary) return;
      dragState = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        dx: 0,
        dy: 0,
        active: false,
        canceled: false,
        captured: false
      };
    }
    function onDragMove(e) {
      if (!dragState || dragState.canceled || dragState.pointerId !== e.pointerId || isSliding) return;
      dragState.dx = e.clientX - dragState.startX;
      dragState.dy = e.clientY - dragState.startY;
      var absX = Math.abs(dragState.dx);
      var absY = Math.abs(dragState.dy);
      if (!dragState.active) {
        if (absY > absX * 1.2) { dragState.canceled = true; dragState = null; return; }
        if (absX > DRAG_START_THRESHOLD && absX > absY) {
          dragState.active = true;
          suppressPhotoClickUntil = Date.now() + 350;
          section.classList.add('is-dragging');
          try {
            if (viewport && viewport.setPointerCapture) {
              viewport.setPointerCapture(e.pointerId);
              dragState.captured = true;
            }
          } catch (_) {}
        } else return;
      }
      e.preventDefault();
      var step = getSlideStepPx();
      var maxAbs = Math.max(DRAG_COMMIT_THRESHOLD, step * MAX_DRAG_RATIO);
      var clampedDx = Math.max(-maxAbs, Math.min(maxAbs, dragState.dx));
      section.style.setProperty('--tc-user-drag-x', clampedDx + 'px');
    }
    function onDragEnd(e) {
      if (!dragState || (e && dragState.pointerId !== e.pointerId)) return;
      var wasActive = dragState.active;
      var dx = dragState.dx;
      try {
        if (dragState.captured && viewport && viewport.releasePointerCapture) {
          viewport.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
      dragState = null;
      section.classList.remove('is-dragging');
      section.style.removeProperty('--tc-user-drag-x');
      if (!wasActive) return;
      suppressPhotoClickUntil = Date.now() + 350;
      if (Math.abs(dx) >= DRAG_COMMIT_THRESHOLD) {
        if (dx < 0) {
          if (slide('next')) restartAuto();
        } else if (slide('prev')) restartAuto();
      }
    }

    prevBtn.addEventListener('click', onPrev);
    nextBtn.addEventListener('click', onNext);
    if (prevLink) prevLink.addEventListener('click', onPrevSlideClick);
    if (nextLink) nextLink.addEventListener('click', onNextSlideClick);
    function preventNativePhotoDrag(e) {
      e.preventDefault();
    }

    if (activeLink) {
      activeLink.addEventListener('click', onActiveLinkClick);
      activeLink.addEventListener('keydown', onActiveLinkKeyDown);
    }
    if (viewport) viewport.addEventListener('pointerdown', onDragStart);
    if (viewport) viewport.addEventListener('dragstart', preventNativePhotoDrag);
    window.addEventListener('pointermove', onDragMove, { passive: false });
    window.addEventListener('pointerup', onDragEnd);
    window.addEventListener('pointercancel', onDragEnd);

    if (len === 0) {
      section.classList.add('is-empty');
    } else if (len === 1) {
      section.classList.add('has-single');
      render();
    } else {
      render();
    }


    requestAnimationFrame(syncTickerSpeeds);
    window.addEventListener('load', syncTickerSpeeds);
    window.addEventListener('resize', scheduleTickerSpeedSync);
    document.addEventListener('visibilitychange', onVisibilityChange);
    startAuto();

    window[GUARD_KEY] = {
      destroy: function () {
        if (cleanupTransition) cleanupTransition();
        if (tickerResizeRaf) {
          cancelAnimationFrame(tickerResizeRaf);
          tickerResizeRaf = 0;
        }
        window.removeEventListener('load', syncTickerSpeeds);
        window.removeEventListener('resize', scheduleTickerSpeedSync);

        document.removeEventListener('visibilitychange', onVisibilityChange);
        prevBtn.removeEventListener('click', onPrev);
        nextBtn.removeEventListener('click', onNext);
        if (prevLink) prevLink.removeEventListener('click', onPrevSlideClick);
        if (nextLink) nextLink.removeEventListener('click', onNextSlideClick);
        if (activeLink) {
          activeLink.removeEventListener('click', onActiveLinkClick);
          activeLink.removeEventListener('keydown', onActiveLinkKeyDown);
        }
        if (viewport) viewport.removeEventListener('pointerdown', onDragStart);
        if (viewport) viewport.removeEventListener('dragstart', preventNativePhotoDrag);
        window.removeEventListener('pointermove', onDragMove, { passive: false });
        window.removeEventListener('pointerup', onDragEnd);
        window.removeEventListener('pointercancel', onDragEnd);
        stopAuto();
        root.innerHTML = '';
      }
    };
  });

})();


(function () {
  if (window.__TC_CONTACTS_PAGE_CLASS_V1__) return;
  window.__TC_CONTACTS_PAGE_CLASS_V1__ = true;

  var normalizedPath = (location.pathname || '/').replace(/\/+$/, '') || '/';
  if (normalizedPath === '/contacts') {
    document.documentElement.classList.add('tc-page-contacts');
  }
})();

(function () {
  if (window.__TC_LEGAL_PAGE_CLASS_V1__) return;
  window.__TC_LEGAL_PAGE_CLASS_V1__ = true;

  var normalizedPath = (location.pathname || '/').replace(/\/+$/, '') || '/';
  if (normalizedPath === '/data_processing_policy' || normalizedPath === '/offer_agreement') {
    document.documentElement.classList.add('tc-page-legal');
  }
})();

(function () {
  if (window.__TC_UI_ACTION_PRESS_V1__) return;
  window.__TC_UI_ACTION_PRESS_V1__ = true;

  var TARGET_SELECTOR =
    '.tc-action, .tc-ui-btn, .tc-legal-btn, .tc-load-more-btn, .t778__showmore, .t-store__load-more-btn, .js-store-load-more-btn, ' +
    '.t-store__loadmore, .t-store__load-more, .js-store-load-more, .t-catalog__loadmore, .t-catalog__load-more, ' +
    '.js-catalog-load-more, .js-catalog-load-more-btn, ' +
    '#allrecords .t778__btn-wrapper .t778__btn, .soc1 .tn-atom, .soc2 .tn-atom, .soc3 .tn-atom, .soc4 .tn-atom, ' +
    '.tc-contact-link';

  var activeTarget = null;

  function getTarget(el) {
    if (!el || !el.closest) return null;
    var node = el.closest(TARGET_SELECTOR);
    if (!node) return null;
    if (node.matches(':disabled') || node.getAttribute('aria-disabled') === 'true') return null;
    return node;
  }

  function press(el) {
    if (!el) return;
    el.classList.add('tc-ui-pressed');
  }

  function release(el) {
    if (!el) return;
    el.classList.remove('tc-ui-pressed');
  }

  function releaseActiveTarget() {
    if (!activeTarget) return;
    release(activeTarget);
    activeTarget = null;
  }

  document.addEventListener('pointerdown', function (e) {
    var target = getTarget(e.target);
    if (!target) return;

    if (activeTarget && activeTarget !== target) {
      release(activeTarget);
    }

    activeTarget = target;
    press(target);
  }, true);

  document.addEventListener('pointerup', function () {
    releaseActiveTarget();
  }, true);

  document.addEventListener('pointercancel', function () {
    releaseActiveTarget();
  }, true);

  document.addEventListener('pointerleave', function () {
    releaseActiveTarget();
  }, true);

  window.addEventListener('blur', function () {
    document.querySelectorAll('.tc-ui-pressed').forEach(release);
    activeTarget = null;
  });
})();

(function () {
  if (window.__TC_CONTACTS_TYPEWRITER_V1__) return;
  window.__TC_CONTACTS_TYPEWRITER_V1__ = true;

  var normalizedPath = (location.pathname || '/').replace(/\/+$/, '') || '/';
  if (normalizedPath !== '/contacts') return;

  var line1 = 'цифровые уголки,';
  var line2 = 'где я обитаю:';
  var speed = 40;

  function startTyping() {
    var root = document.querySelector('.tw-type-1a');
    if (!root) return;
    if (root.dataset.tcContactsTypingDone === '1') return;

    var target = root.querySelector('.tn-atom') || root;
    if (!target) return;

    root.dataset.tcContactsTypingDone = '1';
    target.innerHTML = '';

    var full = line1 + '\n' + line2;
    var i = 0;

    function tick() {
      if (i > full.length - 1) return;
      var ch = full.charAt(i++);
      if (ch === '\n') {
        target.appendChild(document.createElement('br'));
      } else {
        target.appendChild(document.createTextNode(ch));
      }
      setTimeout(tick, speed);
    }

    tick();
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTyping);
  } else {
    startTyping();
  }
})();

(function () {
  if (window.__TC_PRODUCT_MAGNIFIER_V1__) return;
  window.__TC_PRODUCT_MAGNIFIER_V1__ = true;

  var CAN_USE_MAGNIFIER =
    window.matchMedia &&
    window.matchMedia('(min-width: 981px) and (pointer: fine)').matches;

  if (!CAN_USE_MAGNIFIER) return;

  var LENS_SIZE = 230;
  var LENS_ZOOM = 2.4;
  var lens = null;
  var lastDebugSrc = '';
  var imageMetaCache = {};
  var lensUpdateSeq = 0;

  function debugLog() {
    if (!window.__TC_DEBUG_PRODUCT_MAGNIFIER || !window.console || !console.log) return;
    console.log.apply(console, arguments);
  }

  function ensureLens() {
    if (lens && lens.parentNode) return lens;
    lens = document.createElement('div');
    lens.className = 'tc-product-magnifier';
    lens.setAttribute('aria-hidden', 'true');
    document.body.appendChild(lens);
    return lens;
  }

  function hideLens() {
    document.documentElement.classList.remove('tc-product-magnifier-active');
    if (!lens) return;
    lens.classList.remove('is-visible');
  }

  function getBgUrlFromNode(node) {
    if (!node) return '';
    var bg = window.getComputedStyle(node).backgroundImage;
    if (!bg || bg === 'none') return '';
    var match = bg.match(/^url\((['"]?)(.*)\1\)$/);
    return match && match[2] ? match[2] : '';
  }

  function getNodeImageAttr(node) {
    if (!node || !node.getAttribute) return '';

    var attrs = [
      'data-original',
      'data-original-src',
      'data-img-zoom-url',
      'data-zoom-url',
      'data-img',
      'data-lazy-rule',
      'data-src'
    ];

    for (var i = 0; i < attrs.length; i += 1) {
      var value = node.getAttribute(attrs[i]);
      if (value && /\.(jpg|jpeg|png|webp)(\?|#|$)/i.test(value)) return value;
    }

    return '';
  }

  function getOriginalImageSource(node) {
    if (!node) return '';

    var direct = getNodeImageAttr(node);
    if (direct) return direct;

    var img = node.querySelector && node.querySelector('img');
    if (img) {
      var imgOriginal = getNodeImageAttr(img);
      if (imgOriginal) return imgOriginal;
      if (img.currentSrc || img.src) return img.currentSrc || img.src;
    }

    var parentLink = node.closest && node.closest('a[href]');
    if (parentLink) {
      var href = parentLink.getAttribute('href');
      if (href && /\.(jpg|jpeg|png|webp)(\?|#|$)/i.test(href)) return href;
    }

    if (node.tagName && node.tagName.toLowerCase() === 'img') {
      return node.currentSrc || node.src || '';
    }

    return '';
  }

  function getImageSource(node) {
    if (!node) return '';
    var original = getOriginalImageSource(node);
    if (original) return original;
    return getBgUrlFromNode(node);
  }


  function getImageMeta(src, callback) {
    if (!src) {
      callback(null);
      return;
    }

    var cached = imageMetaCache[src];
    if (cached && cached.loaded) {
      callback(cached.failed ? null : cached);
      return;
    }

    if (cached && cached.loading) {
      cached.callbacks.push(callback);
      return;
    }

    imageMetaCache[src] = { loading: true, loaded: false, callbacks: [callback] };

    var img = new Image();
    img.onload = function () {
      var meta = {
        loaded: true,
        loading: false,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      };
      var callbacks = imageMetaCache[src].callbacks || [];
      imageMetaCache[src] = meta;
      callbacks.forEach(function (cb) { cb(meta); });
    };

    img.onerror = function () {
      var callbacks = imageMetaCache[src].callbacks || [];
      imageMetaCache[src] = { loaded: true, loading: false, width: 0, height: 0, failed: true };
      callbacks.forEach(function (cb) { cb(null); });
    };

    img.src = src;
  }

  function isActionControl(node) {
    if (!node || !node.closest) return false;
    return !!node.closest(
      '.t-popup__close, .t-store__prod-popup__close, .t-zoomer__close, .t-zoomer__control, .t-zoomer__scale, .t-zoomer__minus, .t-zoomer__plus, .t-zoomer__prev, .t-zoomer__next, .t-slds__arrow_wrapper, .t-slds__arrow, .t-slds__bullet, .t-slds__counter, .t-slds__thumbs, .t-slds__thumbsbullet, .t-slds__thumbsbullet-wrapper'
    );
  }

  function isThumbnailTarget(node) {
    if (!node || !node.closest) return false;
    return !!node.closest(
      '.t-slds__thumbs, .t-slds__thumbsbullet, .t-slds__thumbsbullet-wrapper, .t-slds__thumbsbullet-border, .t-store__prod-popup__sliderthumb, .t-store__prod-popup__gallery-thumb'
    );
  }

  function isProductPopupMainImageTarget(target) {
    if (!target || !target.closest) return false;
    var popup = target.closest('.t-store__prod-popup, .t-popup_show');
    if (!popup) return false;
    if (isActionControl(target) || isThumbnailTarget(target)) return false;

    var imageArea = target.closest('.t-slds__imgwrapper, .t-slds__bgimg-wrapper, .t-slds__bgimg, .t-bgimg, img');
    if (!imageArea) return false;
    if (isThumbnailTarget(imageArea)) return false;
    return true;
  }

  function getViewerImageFromTarget(target) {
    if (!isProductPopupMainImageTarget(target)) return null;
    var image = target.closest('img, .t-slds__bgimg, .t-bgimg, .t-slds__bgimg-wrapper, .t-slds__imgwrapper');
    if (!image) return null;
    if (isThumbnailTarget(image)) return null;
    return image;
  }

  function updateLensPosition(event, imageNode) {
    var src = getImageSource(imageNode);
    if (!src) {
      hideLens();
      return;
    }
    var rect = imageNode.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      hideLens();
      return;
    }
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      hideLens();
      return;
    }

    var px = event.clientX - rect.left;
    var py = event.clientY - rect.top;

    var lensEl = ensureLens();
    lensEl.style.left = (event.clientX - LENS_SIZE / 2) + 'px';
    lensEl.style.top = (event.clientY - LENS_SIZE / 2) + 'px';
    lensEl.style.backgroundImage = 'url("' + src + '")';

    var x = px / rect.width;
    var y = py / rect.height;
    lensEl.style.backgroundSize = (rect.width * LENS_ZOOM) + 'px ' + (rect.height * LENS_ZOOM) + 'px';
    lensEl.style.backgroundPosition =
      (-(x * rect.width * LENS_ZOOM - LENS_SIZE / 2)) + 'px ' +
      (-(y * rect.height * LENS_ZOOM - LENS_SIZE / 2)) + 'px';

    lensUpdateSeq += 1;
    var updateSeq = lensUpdateSeq;

    getImageMeta(src, function (meta) {
      if (updateSeq !== lensUpdateSeq) return;
      if (!lens || !lens.classList.contains('is-visible')) return;
      if (lens.style.backgroundImage.indexOf(src) === -1) return;
      if (!meta || !meta.width || !meta.height) return;

      var naturalW = meta.width;
      var naturalH = meta.height;
      var coverScale = Math.max(rect.width / naturalW, rect.height / naturalH);
      var displayW = naturalW * coverScale;
      var displayH = naturalH * coverScale;
      var offsetX = (rect.width - displayW) / 2;
      var offsetY = (rect.height - displayH) / 2;

      var imageX = (px - offsetX) / displayW;
      var imageY = (py - offsetY) / displayH;

      imageX = Math.max(0, Math.min(1, imageX));
      imageY = Math.max(0, Math.min(1, imageY));

      lensEl.style.backgroundSize = (displayW * LENS_ZOOM) + 'px ' + (displayH * LENS_ZOOM) + 'px';
      lensEl.style.backgroundPosition =
        (-(imageX * displayW * LENS_ZOOM - LENS_SIZE / 2)) + 'px ' +
        (-(imageY * displayH * LENS_ZOOM - LENS_SIZE / 2)) + 'px';
    });

    lensEl.classList.add('is-visible');
    document.documentElement.classList.add('tc-product-magnifier-active');

    if (window.__TC_DEBUG_PRODUCT_MAGNIFIER && src !== lastDebugSrc) {
      lastDebugSrc = src;
      debugLog('[PRODUCT_MAGNIFIER] active image', imageNode, src);
    }
  }

  document.addEventListener('pointermove', function (event) {
    var imageNode = getViewerImageFromTarget(event.target);
    if (!imageNode || isActionControl(event.target) || isThumbnailTarget(event.target)) {
      hideLens();
      return;
    }
    updateLensPosition(event, imageNode);
  }, true);

  document.addEventListener('pointerleave', hideLens, true);
  document.addEventListener('mouseleave', hideLens, true);

  document.addEventListener('pointerdown', function (event) {
    if (!CAN_USE_MAGNIFIER) return;
    if (isActionControl(event.target) || isThumbnailTarget(event.target)) {
      hideLens();
      return;
    }
    var imageNode = getViewerImageFromTarget(event.target);
    if (!imageNode) return;
    hideLens();
  }, true);

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') hideLens();
  }, true);

  var observer = new MutationObserver(function () {
    var visiblePopup = document.querySelector('.t-store__prod-popup.t-popup_show, .t-popup_show .t-store__prod-popup, .t-popup_show .js-store-prod-popup');
    if (!visiblePopup) hideLens();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

(function () {
  if (window.__TC_PRODUCT_ROUTE_ISOLATION_V2__) return;
  window.__TC_PRODUCT_ROUTE_ISOLATION_V2__ = true;

  function isProductRoute() {
    var path = location.pathname || '';
    return /^\/product\//.test(path) || /^\/tproduct\//.test(path);
  }

  function markProductPopupShell() {
    document.querySelectorAll('.t-popup.t-popup_show, .t-store__prod-popup.t-popup_show').forEach(function (popup) {
      popup.classList.add('tc-product-popup-top');
    });
  }

  function activateProductRouteMode() {
    if (!isProductRoute()) return false;

    var html = document.documentElement;
    var body = document.body;
    var rec = document.querySelector('#rec2312983111');

    html.classList.add(
      'tc-product-page',
      'tc-product-page-active',
      'tc-site-header-product-suppressed'
    );

    if (body) {
      body.classList.add(
        'tc-product-page',
        'tc-product-page-active',
        'tc-site-header-product-suppressed'
      );
    }

    if (rec) {
      rec.classList.add('tc-product-record', 'tc-catalog-record');
    }

    markProductPopupShell();

    return true;
  }

  activateProductRouteMode();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateProductRouteMode);
  } else {
    activateProductRouteMode();
  }

  window.addEventListener('load', activateProductRouteMode);
  window.addEventListener('popstate', activateProductRouteMode);
  window.addEventListener('hashchange', activateProductRouteMode);

  [50, 150, 300, 800, 1600].forEach(function (delay) {
    setTimeout(activateProductRouteMode, delay);
  });

  window.__TC_FORCE_PRODUCT_ROUTE_MODE__ = activateProductRouteMode;

  window.__TC_PRODUCT_MODE_STATE__ = function () {
    var html = document.documentElement;
    var body = document.body;
    var rec = document.querySelector('#rec2312983111');
    var popup = document.querySelector('.t-popup.t-popup_show, .t-store__prod-popup.t-popup_show');

    return {
      path: location.pathname,
      isProductRoute: /^\/product\//.test(location.pathname || '') || /^\/tproduct\//.test(location.pathname || ''),
      htmlClass: html.className,
      bodyClass: body ? body.className : '',
      recClass: rec ? rec.className : '',
      popupClass: popup ? popup.className : '',
      hasProductClasses: {
        htmlProduct: html.classList.contains('tc-product-page'),
        htmlActive: html.classList.contains('tc-product-page-active'),
        bodyProduct: body ? body.classList.contains('tc-product-page') : false,
        bodyActive: body ? body.classList.contains('tc-product-page-active') : false,
        recProduct: rec ? rec.classList.contains('tc-product-record') : false,
        popupTop: popup ? popup.classList.contains('tc-product-popup-top') : false
      },
      overlays: {
        menuEye: !!document.querySelector('.tc-menu-eye-logo'),
        flower: !!document.querySelector('.flower'),
        switcherRoot: !!document.querySelector('#tc-disk-switcher-root'),
        diskSwitcher: !!document.querySelector('.tc-disk-switcher'),
        pathRow: !!document.querySelector('.tc-path-row'),
        tildaClose: !!document.querySelector('.t-popup.t-popup_show .t-popup__close, .t-popup.t-popup_show .t-popup__close-icon, .t-popup.t-popup_show svg.t-popup__close-icon_cross')
      }
    };
  };
})();

(function(){
  "use strict";

  if (window.__TC_STORE_ST340C_CLEANUP__) return;
  window.__TC_STORE_ST340C_CLEANUP__ = true;

  function safeHideLegacyTildaHeader() {
    if (typeof window.__TC_HIDE_LEGACY_TILDA_HEADER__ === 'function') {
      window.__TC_HIDE_LEGACY_TILDA_HEADER__();
      return;
    }
    if (typeof hideLegacyTildaHeader === 'function') {
      hideLegacyTildaHeader();
    }
  }

  function safeSyncSiteHeaderReveal() {
    if (typeof window.__TC_SYNC_SITE_HEADER_REVEAL__ === 'function') {
      window.__TC_SYNC_SITE_HEADER_REVEAL__();
      return;
    }

    if (typeof syncSiteHeaderReveal === 'function') {
      syncSiteHeaderReveal();
    }
  }

  function normalize(str){
    return String(str || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function normalizePartLabel(str){
    var txt = normalize(str).replace(/[«»"'`]/g, '').trim();
    if (txt === 'каталог') return 'все';
    if (txt === 'футболка' || txt === 'футболки') return 'футболки';
    if (txt === 'кепка' || txt === 'кепки') return 'кепки';
    if (txt === 'верх') return 'верх';
    if (txt === 'архив') return 'архив';
    return txt;
  }

  function isProductRoute(){
    var path = location.pathname || '';
    return /^\/product\//.test(path) || /^\/tproduct\//.test(path);
  }

  function isElementVisible(el){
    if (!el) return false;
    var cs = window.getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    return cs.display !== 'none'
      && cs.visibility !== 'hidden'
      && cs.opacity !== '0'
      && rect.width > 0
      && rect.height > 0;
  }

  function hasVisibleProductView(scope){
    var root = scope || document;
    var rec = root.querySelector('#rec2312983111') || document.querySelector('#rec2312983111');
    if (!rec) return false;
    if (isProductRoute()) return true;

    var hasShownPopup = Array.prototype.some.call(
      rec.querySelectorAll('.t-popup.t-popup_show, .t-store__prod-popup.t-popup_show'),
      function(el){ return isElementVisible(el); }
    );
    if (!hasShownPopup) return false;
    if (!document.body || !document.body.classList.contains('tc-product-popup-open')) return hasShownPopup;
    return !!rec.querySelector('.t-popup.t-popup_show, .t-store__prod-popup.t-popup_show');
  }

  function syncProductPageMode(scope){
    var isRoute = isProductRoute();
    var productMode = isRoute ? true : hasVisibleProductView(scope);
    var html = document.documentElement;
    var body = document.body;
    var rec = (scope || document).querySelector('#rec2312983111') || document.querySelector('#rec2312983111');

    if (productMode) {
      html.classList.add('tc-product-page', 'tc-product-page-active', 'tc-site-header-product-suppressed');
      if (body) body.classList.add('tc-product-page', 'tc-product-page-active', 'tc-site-header-product-suppressed');
      if (rec) rec.classList.add('tc-product-record', 'tc-catalog-record');
      document.querySelectorAll('.t-popup.t-popup_show, .t-store__prod-popup.t-popup_show').forEach(function(popup){
        popup.classList.add('tc-product-popup-top');
      });
      return true;
    }

    html.classList.remove('tc-product-page', 'tc-product-page-active');
    if (body) body.classList.remove('tc-product-page', 'tc-product-page-active');
    if (rec) rec.classList.remove('tc-product-record');
    return false;
  }

  function getCatalogRecords(scope){
    var records = [];
    var seen = new Set();
    scope.querySelectorAll('.t-catalog.js-catalog, .js-catalog, .t-catalog').forEach(function(root){
      var record = root.closest('.r, .r-rec, .t-rec, [id^="rec"]') || root.parentElement;
      if (!record || seen.has(record)) return;
      seen.add(record);
      record.classList.add('tc-catalog-record');
      records.push(record);
    });
    return records;
  }

  function getDirectProductRecords(scope){
    var records = [];
    var seen = new Set();
    var selectors = [
      '.t-store__prod-popup',
      '.t-popup',
      '[data-product-lid]',
      '[data-product-gen-uid]',
      '.js-store-product',
      '.js-catalog-product',
      '.t-catalog__product-snippet',
      '.t-catalog__product',
      '.js-catalog-product-snippet',
      '.t-store__prod-popup__info',
      '.t-store__prod-popup__wrapper',
      '.t-store__prod-popup__container'
    ].join(', ');
    scope.querySelectorAll(selectors).forEach(function(node){
      var record = node.closest('.r, .r-rec, .t-rec, [id^="rec"], .t-store__prod-popup, .t-popup, #allrecords') || node;
      if (!record || seen.has(record)) return;
      seen.add(record);
      record.classList.add('tc-catalog-record', 'tc-product-record');
      records.push(record);
    });
    return records;
  }

  function setAllPartLabel(btn){
    if (!btn || normalizePartLabel(btn.textContent) !== 'все') return;
    if (btn.children.length === 0) {
      btn.textContent = 'ВСЕ';
      return;
    }
    Array.prototype.forEach.call(btn.childNodes, function(node){
      if (node.nodeType === 3 && normalizePartLabel(node.nodeValue) === 'все') {
        node.nodeValue = node.nodeValue.replace(/Все/g, 'ВСЕ').replace(/все/g, 'ВСЕ');
      }
    });
  }

  function cleanStoreUi(root){
    var scope = root || document;
    var productMode = syncProductPageMode(scope);


    var records = getCatalogRecords(scope);
    if (productMode) {
      getDirectProductRecords(scope).forEach(function(record){
        if (records.indexOf(record) === -1) records.push(record);
      });
    }

    records.forEach(function(record){

      record.querySelectorAll('.t-store__prod-popup .js-store-close-btn, .t-store__prod-popup .t-store__prod-popup__back, .t-store__prod-popup a, .t-store__prod-popup button, .t-store__prod-popup [role="button"], .t-popup .js-store-close-btn, .t-popup .t-store__prod-popup__back, .t-popup a, .t-popup button, .t-popup [role="button"]').forEach(function(back){
        var txt = normalize(back.textContent);
        if (txt.indexOf('more products') !== -1 || txt.indexOf('назад') !== -1 || txt.indexOf('каталог') !== -1) {
          back.textContent = 'НАЗАД В ГАЛЕРЕЮ...';
          back.classList.add('tc-store-back-link');
          var zone = back.closest('.t-popup__close, .t-popup__close-wrapper, .js-store-close-btn, .t-store__prod-popup__close') || back.parentElement;
          if (zone) zone.classList.add('tc-store-back-zone');
        }
      });

      record.querySelectorAll('.t-store__card *, .t-catalog__card *, .t-store__prod-popup *, .t-popup *, .js-store-product *, .js-catalog-product *, .t-catalog__product-snippet *, .t-catalog__product *').forEach(function(node){
        var txt = normalize(node.textContent);
        if (!txt) return;

        var isLeafLike = node.children.length === 0;

        var isSkuLike = /^артикул\b/.test(txt) || /^sku\b/.test(txt);
        if (isLeafLike && isSkuLike) {
          node.style.setProperty('display', 'none', 'important');
        }

        if (isLeafLike && (txt.indexOf('тип изделия:') === 0 || txt.indexOf('формат:') === 0)) {
          node.style.setProperty('display', 'none', 'important');
        }

        if (txt === 'custom') {
          var dataBadge = node.closest('[data-product-mark], [data-store-badge]');
          if (dataBadge) {
            dataBadge.style.setProperty('display', 'none', 'important');
            return;
          }

          if (isLeafLike) {
            node.style.setProperty('display', 'none', 'important');
          }
        }
      });

      var titleNode = record.querySelector('.js-block-header-title[field="title"][data-editable="false"]');
      var activeLabel = titleNode ? titleNode.textContent : '';
      if (titleNode) {
        var titleTxt = normalizePartLabel(titleNode.textContent);
        var titleWhitelist = new Set(['каталог', 'все', 'кепка', 'кепки', 'футболка', 'футболки', 'верх', 'архив']);
        if (titleWhitelist.has(titleTxt) && titleNode.children.length === 0) {
          titleNode.style.setProperty('display', 'none', 'important');
        }
      }

      if (!activeLabel || normalizePartLabel(activeLabel) === 'каталог') {
        activeLabel = 'все';
      }

    });

    if (productMode) {
      scope.querySelectorAll('.tc-product-record *, .t-catalog__card *, .js-catalog-product *, .t-catalog__product-snippet *, .t-catalog__product *, .t-store__prod-popup *, .t-popup *, [data-product-lid] *, [data-product-gen-uid] *, .js-store-product *').forEach(function(node){
        var txt = normalize(node.textContent);
        if (!txt) return;
        if (node.children.length !== 0) return;
        if (/^артикул\b/.test(txt) || /^sku\b/.test(txt) || txt.indexOf('тип изделия:') === 0 || txt.indexOf('формат:') === 0) {
          node.style.setProperty('display', 'none', 'important');
        }
      });
    }

    cleanProductSkuAndBackLink(scope);
    hideCatalogDynamicHeader(scope);
  }


  function cleanProductSkuAndBackLink(scope){
    var root = scope || document;
    var rec = root.querySelector('#rec2312983111') || document.querySelector('#rec2312983111') || document.body;
    if (!rec) return;

    rec.querySelectorAll('.t-catalog__prod-popup__sku, .js-catalog-prod-sku, .js-product-sku').forEach(function(el){
      var target = el.closest('.t-catalog__prod-popup__sku') || el;
      target.style.setProperty('display', 'none', 'important');
      target.style.setProperty('visibility', 'hidden', 'important');
      target.style.setProperty('opacity', '0', 'important');
    });

    rec.querySelectorAll('script.tc-store-back-link, style.tc-store-back-link').forEach(function(el){
      el.classList.remove('tc-store-back-link');
      el.removeAttribute('style');
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
    });

    var walker = document.createTreeWalker(rec, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        if (!node || !node.nodeValue || !/more products/i.test(node.nodeValue)) return NodeFilter.FILTER_SKIP;
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script, style, noscript, template')) return NodeFilter.FILTER_REJECT;
        if (parent.matches('[hidden], [aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[hidden], [aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (!parent) continue;
      var txt = String(parent.textContent || '').replace(/\s+/g, ' ').trim();
      if (!txt || txt.length > 80) continue;
      parent.textContent = 'НАЗАД В ГАЛЕРЕЮ...';
      parent.classList.add('tc-store-back-link');
      parent.style.setProperty('font-size', '20px', 'important');
      parent.style.setProperty('line-height', '1.2', 'important');
      parent.style.setProperty('letter-spacing', '.02em', 'important');
      parent.style.setProperty('width', 'fit-content', 'important');
      parent.style.setProperty('max-width', 'max-content', 'important');
      parent.style.setProperty('display', 'inline-flex', 'important');
      parent.style.setProperty('align-items', 'center', 'important');
      parent.style.setProperty('cursor', 'pointer', 'important');
    }
  }

  function hideCatalogDynamicHeader(scope){
    var root = scope || document;
    var norm = function(s){ return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); };
    var whitelist = new Set(['каталог', 'все', 'кепка', 'кепки', 'футболка', 'футболки', 'верх', 'архив']);

    root.querySelectorAll('#rec2312983111 .js-block-header-title, #rec2312983111 .t-section__title').forEach(function(el){
      var txt = norm(el.textContent);
      if (!whitelist.has(txt)) return;
      if (el.children.length !== 0) return;
      if (el.closest('.t-catalog__parts-above-item, .t-catalog__parts-wrapper, .t-catalog__parts-switch-btn, .js-catalog-parts-switcher, .t-catalog__parts-button-base')) return;
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('opacity', '0', 'important');
    });
  }


  function getAssetUrlFromElement(el){
    if (!el) return '';
    if (el.tagName === 'IMG') {
      return el.getAttribute('src') || el.src || '';
    }

    var href = el.getAttribute('href') || el.getAttribute('xlink:href');
    if (!href && el.href && typeof el.href.baseVal === 'string') href = el.href.baseVal;
    if (href) return href;

    var bg = '';
    try { bg = getComputedStyle(el).backgroundImage || ''; } catch (_) { bg = ''; }
    if (bg && bg !== 'none') {
      var m = bg.match(/url\((['"]?)(.*?)\1\)/i);
      if (m && m[2]) return m[2];
    }
    return '';
  }

  function resolveMenuEyeAsset(type){
    var baseCandidates = [
      '.flower img',
      '.flower svg image',
      'img[src*="2p_t.svg"], image[href*="2p_t.svg"], image[xlink\:href*="2p_t.svg"]',
      '[style*="2p_t.svg"], [style*="flower"]',
      'img[src*="flower"], image[href*="flower"], image[xlink\:href*="flower"]'
    ];
    var pupilCandidates = [
      '[class*="pupil"] img',
      '[class*="pupil"] image',
      'img[src*="pupil.svg"], image[href*="pupil.svg"], image[xlink\:href*="pupil.svg"]',
      '[style*="pupil.svg"]',
      '.eye-desktop img',
      '.eye-mobile img'
    ];
    var candidates = type === 'base' ? baseCandidates : pupilCandidates;

    for (var i = 0; i < candidates.length; i++) {
      var node = document.querySelector(candidates[i]);
      var url = getAssetUrlFromElement(node);
      if (url) return url;
    }
    return '';
  }

  function getMenuEyeHost(){
    return document.querySelector('#recME202 .t228, #recME202 .t228__positionfixed, #recME202 [data-record-type="202"], #recME202, .t228__positionfixed, .t228');
  }

  function ensureMenuEyeLogo(){
    if (document.body && document.body.classList.contains('tc-custom-header-enabled')) {
      document.querySelectorAll('.tc-menu-eye-logo').forEach(function(node){
        if (node && node.parentNode) node.parentNode.removeChild(node);
      });
      return;
    }

    var host = getMenuEyeHost();
    if (!host) return;
    var existing = document.querySelector('.tc-menu-eye-logo');
    if (existing) return;

    var baseSrc = resolveMenuEyeAsset('base');
    var pupilSrc = resolveMenuEyeAsset('pupil');
    if (!baseSrc || !pupilSrc) return;
    if (baseSrc === pupilSrc) {
      console.warn('[tc-menu-eye-logo] base and pupil assets are identical, skip init', baseSrc);
      return;
    }

    if (getComputedStyle(host).position === 'static') {
      host.style.position = 'relative';
    }

    var wrap = document.createElement('div');
    wrap.className = 'tc-menu-eye-logo';
    wrap.setAttribute('aria-hidden', 'true');

    var base = document.createElement('img');
    base.className = 'tc-menu-eye-logo__base';
    base.src = baseSrc;
    base.alt = '';
    base.decoding = 'async';

    var pupil = document.createElement('img');
    pupil.className = 'tc-menu-eye-logo__pupil';
    pupil.src = pupilSrc;
    pupil.alt = '';
    pupil.decoding = 'async';

    wrap.appendChild(base);
    wrap.appendChild(pupil);
    host.appendChild(wrap);
  }

  function initMenuEyeParallax(){
    if (window.__TC_MENU_EYE_PARALLAX_INIT__) return;
    window.__TC_MENU_EYE_PARALLAX_INIT__ = true;

    var state = { tx: 0, ty: 0, x: 0, y: 0, lastMoveTs: 0 };
    var idleBackMs = 1000;
    var maxShift = 5;

    function isDesktop(){ return window.matchMedia('(min-width: 980px)').matches; }
    function isProductMode(){
      var html = document.documentElement;
      var body = document.body;
      return !!((html && (html.classList.contains('tc-product-page') || html.classList.contains('tc-product-page-active'))) ||
        (body && (body.classList.contains('tc-product-page') || body.classList.contains('tc-product-page-active'))));
    }

    document.addEventListener('mousemove', function(e){
      if (!isDesktop() || isProductMode()) return;
      var pupil = document.querySelector('.tc-menu-eye-logo__pupil');
      if (!pupil) return;
      var rect = pupil.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = (e.clientX - cx) / Math.max(window.innerWidth * 0.5, 1);
      var dy = (e.clientY - cy) / Math.max(window.innerHeight * 0.5, 1);
      state.tx = Math.max(-maxShift, Math.min(maxShift, dx * maxShift));
      state.ty = Math.max(-maxShift, Math.min(maxShift, dy * maxShift));
      state.lastMoveTs = Date.now();
    }, { passive: true });

    function tick(){
      var pupil = document.querySelector('.tc-menu-eye-logo__pupil');
      if (pupil && isDesktop() && !isProductMode()) {
        var now = Date.now();
        if (now - state.lastMoveTs > idleBackMs) {
          state.tx *= 0.92;
          state.ty *= 0.92;
        }
        state.x += (state.tx - state.x) * 0.12;
        state.y += (state.ty - state.y) * 0.12;

        var idleX = Math.sin(now / 1400) * 1.2;
        var idleY = Math.cos(now / 1700) * 0.9;
        pupil.style.transform = 'translate(' + (state.x + idleX).toFixed(2) + 'px,' + (state.y + idleY).toFixed(2) + 'px)';
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function scheduleClean(){
    cleanStoreUi(document);

    ensureMenuEyeLogo();
    initMenuEyeParallax();
    safeHideLegacyTildaHeader();
    safeSyncSiteHeaderReveal();

    requestAnimationFrame(function(){
      cleanStoreUi(document);
      safeHideLegacyTildaHeader();
      safeSyncSiteHeaderReveal();
    });

    [100, 300, 800, 1600].forEach(function(delay){
      setTimeout(function(){
        cleanStoreUi(document);
        safeHideLegacyTildaHeader();
        safeSyncSiteHeaderReveal();
      }, delay);
    });
  }


  document.addEventListener('click', function(e){
    var target = e.target;
    if (!target || !target.closest) return;
    if (!target.closest('.tc-store-back-link')) return;
    setTimeout(function(){
      if (!isProductRoute()) {
        var html = document.documentElement;
        var body = document.body;
        var rec = document.querySelector('#rec2312983111');
        html.classList.remove('tc-product-page', 'tc-product-page-active');
        if (body) body.classList.remove('tc-product-page', 'tc-product-page-active');
        if (rec) rec.classList.remove('tc-product-record');
      }
      syncProductPageMode(document);
    }, 50);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleClean);
  } else {
    scheduleClean();
  }

  var observer = new MutationObserver(function(){
    ensureMenuEyeLogo();
    safeHideLegacyTildaHeader();
    safeSyncSiteHeaderReveal();
    cleanStoreUi(document);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
