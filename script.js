/* Execional Build — script.js
   JS global de presentación (nav, secciones, animaciones).
   Sin lógica de tienda, carrito, pedidos, autenticación ni storage.
   La tienda en /tienda usa su propio runtime ITM compartido. */
(function () {
  'use strict';

  var doc = document;

  function ready(fn) {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    /* ---------- Menú móvil (header .links + #burger) ---------- */
    var burger = doc.getElementById('burger');
    var menu = doc.getElementById('menu');

    function closeMenu() {
      if (menu) menu.classList.remove('open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu() {
      if (!menu) return;
      var isOpen = menu.classList.toggle('open');
      if (burger) burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (burger && menu) {
      burger.setAttribute('aria-expanded', 'false');
      burger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
      });
      menu.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.closest && t.closest('a')) closeMenu();
      });
      doc.addEventListener('click', function (e) {
        if (!menu.classList.contains('open')) return;
        var t = e.target;
        if (t === burger || (burger && burger.contains(t))) return;
        if (menu.contains(t)) return;
        closeMenu();
      });
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
    }

    /* ---------- Sombra del header al hacer scroll ---------- */
    var header = doc.querySelector('header');
    function onScrollHeader() {
      if (!header) return;
      var y = window.scrollY || window.pageYOffset || 0;
      header.style.boxShadow = y > 8 ? '0 10px 30px rgba(0,0,0,.35)' : 'none';
    }
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();

    /* ---------- Reveal on scroll (.reveal -> .on) ---------- */
    var revealEls = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));
    if (revealEls.length) {
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('on');
                io.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
        );
        revealEls.forEach(function (el) {
          io.observe(el);
        });
      } else {
        revealEls.forEach(function (el) {
          el.classList.add('on');
        });
      }
    }

    /* ---------- Scroll suave con offset del header ---------- */
    var anchors = Array.prototype.slice.call(
      doc.querySelectorAll('a[href^="#"]')
    );
    anchors.forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      a.addEventListener('click', function (e) {
        var target = null;
        try {
          target = doc.querySelector(href);
        } catch (err) {
          return;
        }
        if (!target) return;
        e.preventDefault();
        closeMenu();
        var top =
          target.getBoundingClientRect().top + (window.pageYOffset || 0);
        var offset = header ? header.offsetHeight + 12 : 76;
        window.scrollTo({ top: Math.max(0, top - offset), behavior: 'smooth' });
        if (target.setAttribute) {
          target.setAttribute('tabindex', '-1');
        }
      });
    });

    /* ---------- Link activo según sección visible ---------- */
    var sectionIds = ['inicio', 'paquetes', 'tienda-destacada', 'sistema', 'contacto'];
    var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.links a.nl'));
    function setActive(id) {
      navLinks.forEach(function (link) {
        var href = link.getAttribute('href') || '';
        if (href === '#' + id) {
          link.setAttribute('aria-current', 'true');
          link.style.color = '#fff';
        } else {
          link.removeAttribute('aria-current');
          link.style.color = '';
        }
      });
    }
    if ('IntersectionObserver' in window && navLinks.length) {
      var secObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.target.id) {
              setActive(entry.target.id);
            }
          });
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
      );
      sectionIds.forEach(function (id) {
        var s = doc.getElementById(id);
        if (s) secObserver.observe(s);
      });
    }

    /* ---------- FAQ: una respuesta abierta a la vez (solo presentación) ---------- */
    var faq = doc.querySelector('.faq');
    if (faq) {
      faq.addEventListener('toggle', function (e) {
        var opened = e.target;
        if (!opened || opened.tagName !== 'DETAILS' || !opened.open) return;
        Array.prototype.slice
          .call(faq.querySelectorAll('details[open]'))
          .forEach(function (d) {
            if (d !== opened) d.removeAttribute('open');
          });
      }, true);
    }

    /* ---------- Año dinámico en el footer (si existe marcador) ---------- */
    var yearEls = doc.querySelectorAll('[data-year], .js-year');
    Array.prototype.forEach.call(yearEls, function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  });
})();
