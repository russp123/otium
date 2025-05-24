// Navigation underline and active state on scroll/click

document.addEventListener('DOMContentLoaded', function () {
  // New nav order: Home, Collections, About us, Contact
  const navLinks = [
    { id: 'nav-home', section: 'home' },
    { id: 'nav-collections', section: 'collections' },
    { id: 'nav-about', section: 'about' },
    { id: 'nav-contact', section: 'contact' }
  ];
  const underline = document.getElementById('nav-underline');
  const navEls = navLinks.map(link => document.getElementById(link.id));
  // Get key DOM elements for scroll logic
  const heroCreative = document.querySelector('.hero-drive-creative');
  const sliderCenter = document.querySelector('.slider-center');
  const aboutTitle = document.querySelector('.about-title');
  const contactSection = document.getElementById('contact');

  function setActiveNav(index) {
    navEls.forEach((el, i) => {
      if (i === index) el.classList.add('active');
      else el.classList.remove('active');
    });
    // Move underline
    const activeEl = navEls[index];
    if (activeEl) {
      const rect = activeEl.getBoundingClientRect();
      const parentRect = activeEl.parentElement.getBoundingClientRect();
      underline.style.width = rect.width + 'px';
      underline.style.left = (rect.left - parentRect.left) + 'px';
    }
  }

  function onScroll() {
    const scrollY = window.scrollY;
    const offset = 120; // header offset
    let activeIdx = 0;

    // Get top positions
    const heroTop = heroCreative ? heroCreative.getBoundingClientRect().top + scrollY : 0;
    const sliderTop = sliderCenter ? sliderCenter.getBoundingClientRect().top + scrollY : 0;
    const aboutTop = aboutTitle ? aboutTitle.getBoundingClientRect().top + scrollY : 0;
    const contactTop = contactSection ? contactSection.getBoundingClientRect().top + scrollY : 0;

    if (scrollY + offset >= contactTop - 100) {
      activeIdx = 3; // Contact
    } else if (scrollY + offset >= aboutTop - 100) {
      activeIdx = 2; // About us
    } else if (scrollY + offset >= sliderTop - 100) {
      activeIdx = 1; // Collections
    } else {
      activeIdx = 0; // Home
    }
    setActiveNav(activeIdx);
  }

  // Click nav: smooth scroll and set underline
  navEls.forEach((el, idx) => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      let targetSection;
      if (idx === 0) targetSection = heroCreative;
      else if (idx === 1) targetSection = sliderCenter;
      else if (idx === 2) targetSection = aboutTitle;
      else if (idx === 3) targetSection = contactSection;
      if (targetSection) {
        const top = targetSection.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
        setActiveNav(idx);
      }
    });
  });

  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', onScroll);

  setTimeout(onScroll, 200);

  function updateCenterSlideClick() {
    // Remove previous click handlers and cursor from all slides
    document.querySelectorAll('.slide').forEach(slide => {
      slide.style.cursor = 'default';
      slide.onclick = null;
    });
    // Find the current (center) slide
    const current = document.querySelector('.slide[data-current]');
    if (current && current.dataset.link) {
      current.style.cursor = 'pointer';
      current.onclick = () => window.location.href = current.dataset.link;
    }
  }

  // Run once on page load
  updateCenterSlideClick();

  // If your slider changes slides with JS, call updateCenterSlideClick() after every slide change.
  // For example, in your slider.js, after updating which slide is 'data-current', call updateCenterSlideClick();
});