/* ============================================================
   INCLUDE ENGENHARIA — script.js
   GSAP + Three.js + Cursor + Preloader + All Interactions
   ============================================================ */

'use strict';

/* ============================================================
   1. PRELOADER
   ============================================================ */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  const counter  = document.getElementById('preloader-counter');
  const bar      = document.getElementById('preloader-bar');

  if (!preloader) return;

  let current = 0;
  const target  = 100;
  const duration = 2000; // ms
  const startTime = performance.now();

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    current = Math.floor(easeInOut(progress) * target);

    counter.textContent = current;
    bar.style.width = current + '%';

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = 100;
      bar.style.width = '100%';
      // After a short pause, animate out
      setTimeout(hidePreloader, 300);
    }
  }

  function hidePreloader() {
    if (typeof gsap !== 'undefined') {
      gsap.timeline()
        .to(preloader, {
          yPercent: -100,
          duration: 1,
          ease: 'power4.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            initMainAnimations();
          }
        });
    } else {
      preloader.style.display = 'none';
      initMainAnimations();
    }
  }

  requestAnimationFrame(tick);
})();


/* ============================================================
   2. CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if (window.innerWidth <= 768) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';
  });

  // Lerp ring with delay
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover states on interactive elements
  const interactables = document.querySelectorAll('a, button, .project-card, .service-card, .testimonial-btn');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();


/* ============================================================
   3. THREE.JS WEBGL BACKGROUND
   ============================================================ */
function initThreeJS() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // Create particles
  const count    = window.innerWidth < 768 ? 1500 : 4000;
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

    if (Math.random() > 0.4) {
      // Brand yellow #FFC209
      colors[i * 3]     = 1.0;
      colors[i * 3 + 1] = 0.761;
      colors[i * 3 + 2] = 0.035;
    } else {
      // Brand blue light #3F80EF
      colors[i * 3]     = 0.247;
      colors[i * 3 + 1] = 0.502;
      colors[i * 3 + 2] = 0.937;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 1.2;
    targetY = -(e.clientY / window.innerHeight - 0.5) * 1.2;
  });

  function animate() {
    requestAnimationFrame(animate);

    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    points.rotation.y = currentX * 0.4;
    points.rotation.x = currentY * 0.3;
    points.rotation.z += 0.0004;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}


/* ============================================================
   4. GSAP + SCROLLTRIGGER — MAIN ANIMATIONS
   (called after preloader finishes)
   ============================================================ */
function initMainAnimations() {
  // Init Three.js
  initThreeJS();

  if (typeof gsap === 'undefined') {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) heroContent.style.opacity = '1';
    return;
  }

  gsap.set('.hero-content', { opacity: 1 });

  // Register ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ---- 4a. Hero Animations ----
  animateHero();

  // ---- 4b. Services ----
  animateServices();

  // ---- 4c. Projects ----
  animateProjects();

  // ---- 4d. Timeline / About ----
  animateTimeline();

  // ---- 4e. Testimonials ----
  // (handled separately by slider logic)

  // ---- 4f. Footer ----
  animateFooter();

  // ---- 4g. Back to top ----
  initBackToTop();

  // ---- 4h. Header scroll ----
  initHeaderScroll();
}


/* ---- Hero: split text + stagger ---- */
function splitChars(el) {
  if (!el) return [];
  const text = el.textContent;
  el.textContent = '';
  const spans = [];
  [...text].forEach(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    el.appendChild(span);
    spans.push(span);
  });
  return spans;
}

function animateHero() {
  const line1 = document.getElementById('hero-line-1');
  const line2 = document.getElementById('hero-line-2'); // gradient line — do NOT split chars
  const line3 = document.getElementById('hero-line-3');

  const chars1 = splitChars(line1);
  // line2 kept as full element to preserve background-clip:text gradient
  const chars3 = splitChars(line3);

  const tl = gsap.timeline({ delay: 0.1 });

  tl.from('.hero-logo-wrap', { opacity: 0, y: -25, duration: 0.7, ease: 'power3.out' })
    .from('.hero-overline', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .from(chars1, {
      y: 80, opacity: 0, rotateX: -40,
      stagger: 0.03, duration: 0.7, ease: 'power4.out'
    }, '-=0.3')
    .from(line2, {
      y: 80, opacity: 0, duration: 0.75, ease: 'power4.out'
    }, '-=0.4')
    .from(chars3, {
      y: 60, opacity: 0,
      stagger: 0.025, duration: 0.6, ease: 'power3.out'
    }, '-=0.5')
    .from('#hero-subtitle', {
      opacity: 0, y: 30, duration: 0.7, ease: 'power3.out'
    }, '-=0.4')
    .from('#hero-cta', {
      opacity: 0, y: 20, duration: 0.6, ease: 'power3.out'
    }, '-=0.5')
    .from('.hero-scroll', {
      opacity: 0, x: -20, duration: 0.5, ease: 'power2.out'
    }, '-=0.4')
    .from('.hero-stats', {
      opacity: 0, x: 20, duration: 0.5, ease: 'power2.out'
    }, '-=0.5');

  // CTA pulse animation
  gsap.to('.btn-primary', {
    scale: 1.03,
    duration: 1.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: 2
  });

  // Counter animation for stats
  document.querySelectorAll('.hero-stat-number').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2.5,
      delay: 1.5,
      ease: 'power2.out',
      onUpdate: function() {
        el.textContent = Math.round(obj.val);
      }
    });
  });
}


/* ---- Services: stagger on scroll ---- */
function animateServices() {
  if (typeof ScrollTrigger === 'undefined') return;

  const cards = document.querySelectorAll('.service-card');
  gsap.from(cards, {
    y: 60,
    opacity: 0,
    stagger: 0.1,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#services',
      start: 'top 75%',
      once: true
    }
  });

  gsap.from('#services .section-header', {
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#services', start: 'top 80%', once: true }
  });
}


/* ---- Projects: horizontal scroll + pin (swapped with timeline) ---- */
function animateProjects() {
  if (typeof ScrollTrigger === 'undefined') return;

  gsap.from('#projects .section-header', {
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#projects', start: 'top 80%', once: true }
  });

  const scrollEl = document.getElementById('projects-scroll');
  if (!scrollEl || window.innerWidth <= 768) return;

  const cards = scrollEl.querySelectorAll('.project-card');
  if (!cards.length) return;

  const setEdgeGutters = () => {
    const first = cards[0];
    const last = cards[cards.length - 1];
    const viewport = document.documentElement.clientWidth;
    const safety = Math.max(20, viewport * 0.03);
    const startPad = Math.max(24, (viewport - first.offsetWidth) / 2 + safety);
    const endPad = Math.max(24, (viewport - last.offsetWidth) / 2 + safety);
    scrollEl.style.paddingLeft = `${startPad}px`;
    scrollEl.style.paddingRight = `${endPad}px`;
  };

  const getScrollDist = () => {
    const viewport = document.documentElement.clientWidth;
    return Math.max(0, scrollEl.scrollWidth - viewport);
  };

  setEdgeGutters();
  gsap.set(scrollEl, { x: 0 });

  gsap.to(scrollEl, {
    x: () => -getScrollDist(),
    ease: 'none',
    scrollTrigger: {
      trigger: '#projects',
      start: 'top+=30 top',
      end: () => `+=${getScrollDist()}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: setEdgeGutters
    }
  });
}


/* ---- About Timeline: simple reveal (horizontal scroll moved to projects) ---- */
function animateTimeline() {
  if (typeof ScrollTrigger === 'undefined') return;

  gsap.from('.about-intro .section-header', {
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-intro', start: 'top 80%', once: true }
  });

  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      opacity: 0, y: 25, duration: 0.5, delay: (i % 4) * 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#timeline-container', start: 'top 80%', once: true }
    });
  });
}


/* ---- Footer ---- */
function animateFooter() {
  if (typeof ScrollTrigger === 'undefined') return;

  gsap.from('.contact-title', {
    y: 60, opacity: 0, duration: 1, ease: 'power4.out',
    scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true }
  });

  gsap.from(['.contact-desc', '.contact-details'], {
    y: 30, opacity: 0, stagger: 0.15, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true }
  });

  gsap.from('.contact-form-wrap', {
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 75%', once: true }
  });
}


/* ============================================================
   5. HEADER SCROLL
   ============================================================ */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}


/* ============================================================
   6. MOBILE MENU
   ============================================================ */
(function initMobileMenu() {
  const toggle  = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const overlay = document.getElementById('mobile-overlay');
  const close   = document.getElementById('mobile-nav-close');
  const links   = document.querySelectorAll('.mobile-nav-link');

  if (!toggle || !mobileNav) return;

  function openNav() {
    mobileNav.classList.add('active');
    overlay.classList.add('active');
    toggle.classList.add('active');
    document.body.classList.add('nav-open');
  }

  function closeNav() {
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    toggle.classList.remove('active');
    document.body.classList.remove('nav-open');
  }

  toggle.addEventListener('click', openNav);
  close.addEventListener('click', closeNav);
  overlay.addEventListener('click', closeNav);
  links.forEach(link => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });
})();


/* ============================================================
   7. THEME TOGGLE
   ============================================================ */
(function initTheme() {
  const btn  = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!btn) return;

  // Always start in dark mode — brand identity default
  localStorage.removeItem('include-theme');
  applyTheme('dark');

  btn.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('light-mode');
    applyTheme(isDark ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      if (icon) { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
    } else {
      document.body.classList.remove('light-mode');
      if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    }
  }
})();


/* ============================================================
   8. PROJECT LIGHTBOX
   ============================================================ */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const overlay  = document.getElementById('lightbox-overlay');
  const closeBtn = document.getElementById('lightbox-close');
  const img      = document.getElementById('lightbox-img');
  const title    = document.getElementById('lightbox-title');
  const cat      = document.getElementById('lightbox-cat');
  const desc     = document.getElementById('lightbox-desc');
  const tech     = document.getElementById('lightbox-tech');
  const cta      = document.querySelector('[data-testid="lightbox-cta"]');

  if (!lightbox) return;

  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    const btn = card.querySelector('.project-btn');
    if (btn && btn.tagName === 'BUTTON') {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLightbox(card);
      });
    }
    card.addEventListener('click', (e) => {
      if (e.target.closest('.project-btn-link')) return;
      openLightbox(card);
    });
  });

  function openLightbox(card) {
    const imgSrc  = card.getAttribute('data-img') || '';
    const titleTx = card.getAttribute('data-title') || '';
    const catTx   = card.getAttribute('data-category') || '';
    const descTx  = card.getAttribute('data-desc') || '';
    const techStr = card.getAttribute('data-tech') || '';

    img.src = imgSrc;
    img.alt = titleTx;
    title.textContent = titleTx;
    cat.textContent   = catTx;
    desc.textContent  = descTx;

    tech.innerHTML = '';
    techStr.split(',').forEach(t => {
      const span = document.createElement('span');
      span.textContent = t.trim();
      tech.appendChild(span);
    });

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { img.src = ''; }, 400);
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (overlay)  overlay.addEventListener('click',  closeLightbox);
  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      closeLightbox();
      const contact = document.getElementById('contact');
      if (!contact) return;
      setTimeout(() => {
        const offset = document.getElementById('header')?.offsetHeight || 72;
        const top = contact.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 120);
    });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
})();


/* ============================================================
   9. TESTIMONIALS SLIDER
   ============================================================ */
(function initTestimonials() {
  const slider = document.getElementById('testimonials-slider');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dots    = document.querySelectorAll('.dot');
  if (!slider) return;

  const cards = slider.querySelectorAll('.testimonial-card');
  let current = 0;
  let autoTimer = null;

  function update() {
    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next', 'hidden');
      const diff = i - current;
      const len  = cards.length;

      if (diff === 0) {
        card.classList.add('active');
      } else if (diff === -1 || diff === len - 1) {
        card.classList.add('prev');
      } else if (diff === 1 || diff === -(len - 1)) {
        card.classList.add('next');
      } else {
        card.classList.add('hidden');
      }
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goNext() {
    current = (current + 1) % cards.length;
    update();
  }

  function goPrev() {
    current = (current - 1 + cards.length) % cards.length;
    update();
  }

  function startAuto() {
    autoTimer = setInterval(goNext, 5000);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { goNext(); resetAuto(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { goPrev(); resetAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      current = i;
      update();
      resetAuto();
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const section = document.getElementById('testimonials');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowRight') { goNext(); resetAuto(); }
      if (e.key === 'ArrowLeft')  { goPrev(); resetAuto(); }
    }
  });

  // Touch/swipe support
  let touchStartX = 0;
  if (slider) {
    slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goNext() : goPrev();
        resetAuto();
      }
    }, { passive: true });
  }

  update();
  startAuto();
})();


/* ============================================================
   10. RIPPLE EFFECT ON BUTTONS
   ============================================================ */
(function initRipple() {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top  = (e.clientY - rect.top)  + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
})();


/* ============================================================
   10. NEWSLETTER FORM (kept for backward compat)
   ============================================================ */
function handleNewsletter(e) {
  e.preventDefault();
}

/* ============================================================
   10b. CONTACT FORM
   ============================================================ */
function handleContactForm(e) {
  e.preventDefault();
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  const btn     = e.target.querySelector('[data-testid="contact-submit"]');

  if (btn) {
    btn.disabled = true;
    const span = btn.querySelector('span');
    if (span) span.textContent = 'Enviando...';
  }

  // Simulate sending
  setTimeout(() => {
    if (form)    form.style.display    = 'none';
    if (success) success.classList.add('visible');
    if (typeof gsap !== 'undefined') {
      gsap.from(success, { opacity: 0, y: 20, duration: 0.5, ease: 'power3.out' });
    }
  }, 900);
}


/* ============================================================
   12. BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
   13. FOOTER DYNAMIC YEAR
   ============================================================ */
(function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  const expEl  = document.getElementById('years-exp');
  const now    = new Date().getFullYear();
  if (yearEl) yearEl.textContent = now;
  if (expEl)  expEl.textContent  = now - 2015;
})();


/* ============================================================
   14. MAGNETIC BUTTON EFFECT
   ============================================================ */
(function initMagnetic() {
  if (window.innerWidth < 768) return;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect     = el.getBoundingClientRect();
      const centerX  = rect.left + rect.width  / 2;
      const centerY  = rect.top  + rect.height / 2;
      const deltaX   = (e.clientX - centerX) * 0.3;
      const deltaY   = (e.clientY - centerY) * 0.3;

      if (typeof gsap !== 'undefined') {
        gsap.to(el, { x: deltaX, y: deltaY, duration: 0.3, ease: 'power2.out' });
      }
    });

    el.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      }
    });
  });
})();


/* ============================================================
   15. SMOOTH SCROLL FOR NAV LINKS
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = document.getElementById('header')?.offsetHeight || 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ---- Service CTA: always focus the contact form ---- */
(function initServiceLinksToForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  document.querySelectorAll('.service-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const offset = document.getElementById('header')?.offsetHeight || 72;
      const top = form.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   16. SECTION OVERLINES REVEAL ON SCROLL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Reveal section overlines and subtitles generically
  if (typeof ScrollTrigger !== 'undefined') {
    document.querySelectorAll('.section-overline, .section-subtitle').forEach(el => {
      gsap.from(el, {
        opacity: 0, y: 20, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  // Testimonials section reveal
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.from('#testimonials .section-header', {
      y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '#testimonials', start: 'top 80%', once: true }
    });
  }
});
