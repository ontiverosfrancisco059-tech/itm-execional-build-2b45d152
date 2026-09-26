/* Execional Build — script.js
 * UI de presentación únicamente: navegación móvil, año, sombra del header,
 * resaltado de sección activa y revelado suave.
 * Solo presentación: sin persistencia en navegador y sin lógica de venta.
 */
(function () {
  "use strict";

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $all(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  /* --- Menú móvil --- */
  function initMenu() {
    var burger = document.getElementById("burger");
    var menu = document.getElementById("menu");
    if (!burger || !menu) return;

    // Evita duplicar listeners si index.html ya tiene inline handler:
    // usamos una marca para no re-enganchar.
    if (burger.dataset.itmMenuBound === "1") {
      syncAria(burger, menu);
      return;
    }
    burger.dataset.itmMenuBound = "1";
    syncAria(burger, menu);

    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      syncAria(burger, menu, open);
    });

    menu.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.tagName === "A") {
        menu.classList.remove("open");
        syncAria(burger, menu, false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        syncAria(burger, menu, false);
        burger.focus();
      }
    });

    document.addEventListener("click", function (e) {
      if (!menu.classList.contains("open")) return;
      var inside = menu.contains(e.target) || burger.contains(e.target);
      if (!inside) {
        menu.classList.remove("open");
        syncAria(burger, menu, false);
      }
    });

    function syncAria(b, m, open) {
      var isOpen = typeof open === "boolean" ? open : m.classList.contains("open");
      b.setAttribute("aria-expanded", isOpen ? "true" : "false");
      b.setAttribute("aria-controls", "menu");
      m.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  }

  /* --- Año dinámico --- */
  function initYear() {
    var nodes = $all("#yr, [data-year]");
    if (!nodes.length) return;
    var year = String(new Date().getFullYear());
    nodes.forEach(function (n) {
      n.textContent = year;
    });
  }

  /* --- Sombra del header al hacer scroll --- */
  function initHeaderShadow() {
    var header = $(".top");
    if (!header) return;
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      header.classList.toggle("is-scrolled", y > 8);
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* --- Resaltado de enlace activo por sección visible --- */
  function initActiveLink() {
    var links = $all('#menu a[href^="#"]');
    if (!links.length) return;
    if (!("IntersectionObserver" in window)) return;

    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (id) map[id] = a;
    });
    var ids = Object.keys(map);
    if (!ids.length) return;

    function clear() {
      links.forEach(function (a) { a.removeAttribute("aria-current"); });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          clear();
          var link = map[entry.target.id];
          if (link) link.setAttribute("aria-current", "page");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0.05 });

    ids.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* --- Revelado suave opcional (solo elementos con [data-reveal]) --- */
  function initReveal() {
    var items = $all("[data-reveal]");
    if (!items.length) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* --- Scroll suave con compensación del header fijo --- */
  function initSmoothAnchors() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var hash = a.getAttribute("href");
      if (!hash || hash.length < 2) return;
      var target = document.getElementById(hash.slice(1));
      if (!target) return;
      e.preventDefault();
      var header = $(".top");
      var offset = header ? header.offsetHeight + 8 : 72;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(top, 0), behavior: reduce ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", hash);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  function boot() {
    initMenu();
    initYear();
    initHeaderShadow();
    initActiveLink();
    initReveal();
    initSmoothAnchors();
  }
})();
