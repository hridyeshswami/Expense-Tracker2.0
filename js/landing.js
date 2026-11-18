/**
 * ==========================================================================
 * EXPENSE TRACKER LANDING PAGE SCRIPT
 * Lenis Inertia Scroll, GSAP Physics, Daily Limit Engine, Device Chassis
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initLenisSmoothScroll();
  initCustomCursor();
  initMobileNav();
  initDailyLimitSimulator();
  initDeviceTabSwitcher();
  initGSAPMotion();
  initMagneticButtons();
});

/**
 * 1. Lenis Smooth Inertial Scrolling
 */
function initLenisSmoothScroll() {
  if (typeof Lenis === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Synchronize Lenis with GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

/**
 * 2. Custom Mechanical Cursor
 */
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const follower = document.querySelector('.custom-cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderFollower);
  }
  renderFollower();

  // Hover state detection on interactive targets
  const interactiveTargets = document.querySelectorAll('a, button, input, select, .tap-spend-btn, .device-tab-btn, .demo-login-chip');
  interactiveTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/**
 * 2b. Mobile Navigation Drawer Toggle
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');
  const btnText = document.getElementById('menuBtnText');

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (btnText) btnText.textContent = isOpen ? 'CLOSE' : 'MENU';
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      if (btnText) btnText.textContent = 'MENU';
    });
  });
}

/**
 * 3. Interactive Safe Daily Limit Engine (Strict Real Math)
 * Equation: floor((Remaining Allowance) / (Days Left in Month))
 */
function initDailyLimitSimulator() {
  const allowanceInput = document.getElementById('simAllowanceInput');
  const daysSlider = document.getElementById('simDaysSlider');
  const daysDisplay = document.getElementById('simDaysDisplay');
  const tickerBigVal = document.getElementById('simDailyTicker');
  const remainingDisplay = document.getElementById('simRemainingDisplay');
  const spentDisplay = document.getElementById('simSpentDisplay');
  const healthBadge = document.getElementById('simHealthBadge');
  const formulaEquation = document.getElementById('simFormulaEquation');

  // Simulation State
  const state = {
    allowance: 6000,
    daysRemaining: 25,
    spentSoFar: 0,
  };

  function updateCalculations() {
    const allowance = Math.max(0, parseFloat(state.allowance) || 0);
    const spent = Math.max(0, state.spentSoFar);
    const remaining = Math.max(0, allowance - spent);
    const days = Math.max(1, parseInt(state.daysRemaining) || 1);

    // Mathematical formulation: floor(remaining / days)
    const safeDailyLimit = Math.floor(remaining / days);
    const spendPct = allowance > 0 ? Math.round((spent / allowance) * 100) : 0;

    // Update readouts
    if (tickerBigVal) {
      tickerBigVal.textContent = `₹${safeDailyLimit.toLocaleString('en-IN')}/day`;
    }
    if (remainingDisplay) {
      remainingDisplay.textContent = `₹${remaining.toLocaleString('en-IN')}`;
    }
    if (spentDisplay) {
      spentDisplay.textContent = `₹${spent.toLocaleString('en-IN')} (${spendPct}%)`;
    }
    if (daysDisplay) {
      daysDisplay.textContent = `${days} Days`;
    }
    if (formulaEquation) {
      formulaEquation.textContent = `⌊ ₹${remaining.toLocaleString('en-IN')} ÷ ${days} days ⌋ = ₹${safeDailyLimit}/day`;
    }

    // Dynamic Budget Health Badge update
    if (healthBadge) {
      healthBadge.className = 'health-badge';
      if (spendPct >= 95) {
        healthBadge.classList.add('badge-exceeded');
        healthBadge.textContent = `Exceeded (${spendPct}%)`;
        if (tickerBigVal) tickerBigVal.style.color = 'var(--accent-crimson)';
      } else if (spendPct >= 70) {
        healthBadge.classList.add('badge-getting-close');
        healthBadge.textContent = `Getting Close (${spendPct}%)`;
        if (tickerBigVal) tickerBigVal.style.color = 'var(--accent-amber)';
      } else {
        healthBadge.classList.add('badge-under-control');
        healthBadge.textContent = `Under Control (${spendPct}%)`;
        if (tickerBigVal) tickerBigVal.style.color = 'var(--accent-mint)';
      }
    }
  }

  // Allowance Input change listener
  if (allowanceInput) {
    allowanceInput.addEventListener('input', (e) => {
      state.allowance = parseFloat(e.target.value) || 0;
      updateCalculations();
    });
  }

  // Days Slider change listener
  if (daysSlider) {
    daysSlider.addEventListener('input', (e) => {
      state.daysRemaining = parseInt(e.target.value) || 1;
      const sliderLabel = document.getElementById('sliderDaysLabel');
      if (sliderLabel) sliderLabel.textContent = `Slide Days: ${state.daysRemaining}`;
      updateCalculations();
    });
  }

  // Quick Micro-Spend Tapboard Buttons
  const tapButtons = document.querySelectorAll('.tap-spend-btn[data-spend]');
  tapButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const spendAmount = parseFloat(btn.getAttribute('data-spend')) || 0;
      state.spentSoFar += spendAmount;

      // Haptic recoil effect
      btn.style.transform = 'scale(0.92)';
      setTimeout(() => (btn.style.transform = ''), 120);

      updateCalculations();
    });
  });

  // Real Example Button: ₹6,000 allowance, 25 days -> spend ₹300 leaves ₹5,700 over 24 days -> ₹237/day
  const exampleBtn = document.getElementById('simExampleBtn');
  if (exampleBtn) {
    exampleBtn.addEventListener('click', () => {
      state.allowance = 6000;
      state.daysRemaining = 24; // 1 day elapsed
      state.spentSoFar = 300;   // Spent ₹300 on day 1
      if (allowanceInput) allowanceInput.value = '6000';
      if (daysSlider) daysSlider.value = '24';
      const sliderLabel = document.getElementById('sliderDaysLabel');
      if (sliderLabel) sliderLabel.textContent = 'Slide Days: 24';

      // Haptic tactile recoil
      exampleBtn.style.transform = 'scale(0.95)';
      setTimeout(() => (exampleBtn.style.transform = ''), 150);

      updateCalculations();
    });
  }

  // Reset Simulator
  const resetBtn = document.getElementById('simResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.allowance = 6000;
      state.daysRemaining = 25;
      state.spentSoFar = 0;
      if (allowanceInput) allowanceInput.value = '6000';
      if (daysSlider) daysSlider.value = '25';
      const sliderLabel = document.getElementById('sliderDaysLabel');
      if (sliderLabel) sliderLabel.textContent = 'Slide Days: 25';
      updateCalculations();
    });
  }

  // Initialize on load
  updateCalculations();
}

/**
 * 4. Interactive Real App Device Chassis (8 Tabs)
 */
function initDeviceTabSwitcher() {
  const tabButtons = document.querySelectorAll('.device-tab-btn[data-screen-tab]');
  const tabPanels = document.querySelectorAll('.tab-content-panel');
  const urlDisplay = document.getElementById('deviceActiveUrl');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-screen-tab');

      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`screen-${tabTarget}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      if (urlDisplay) {
        urlDisplay.textContent = `student-expense-tracker.app/#${tabTarget}`;
      }
    });
  });
}

/**
 * 5. GSAP Motion & ScrollTrigger Reveals
 */
function initGSAPMotion() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Staggered reveals for hero elements
  gsap.from('.hero-headline span', {
    y: 60,
    opacity: 0,
    duration: 1.1,
    stagger: 0.15,
    ease: 'power3.out',
    delay: 0.1,
  });

  gsap.from('.hero-subhead, .hero-actions, .hero-meta-strip', {
    y: 35,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    delay: 0.45,
  });

  gsap.from('.hero-caliper-teaser', {
    x: 40,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    delay: 0.6,
  });

  // Section reveals
  const revealSections = document.querySelectorAll('.section');
  revealSections.forEach((sec) => {
    gsap.from(sec.querySelectorAll('.section-label, .section-heading-huge, .decoupling-grid, .comparison-grid, .caliper-card, .device-frame, .privacy-grid, .team-grid'), {
      scrollTrigger: {
        trigger: sec,
        start: 'top 82%',
      },
      y: 40,
      opacity: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out',
    });
  });

  // Parallax subtle float on the receipt
  const receipt = document.querySelector('.receipt-box');
  if (receipt) {
    gsap.to(receipt, {
      scrollTrigger: {
        trigger: receipt,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
      y: -30,
      rotation: 1.2,
      ease: 'none',
    });
  }
}

/**
 * 6. Magnetic Button Physics on Primary CTAs
 */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const magneticBtns = document.querySelectorAll('.btn-primary, .brand-glyph');
  magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}
