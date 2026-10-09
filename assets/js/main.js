// Utility: Throttle function for performance
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update theme-color meta tag
    const themeColor = newTheme === 'light' ? '#fafbfc' : '#050508';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  });
}

// Configure Lightbox2 for better gallery experience
if (typeof lightbox !== 'undefined') {
  lightbox.option({
    resizeDuration: 200,
    fadeDuration: 200,
    imageFadeDuration: 200,
    wrapAround: true,
    albumLabel: '%1 of %2',
    disableScrolling: true,
    fitImagesInViewport: true,
    maxWidth: window.innerWidth * 0.9,
    maxHeight: window.innerHeight * 0.9
  });
}

// Custom cursor - only on desktop and if no reduced motion
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (cursor && follower && window.innerWidth > 968 && !prefersReducedMotion) {
  document.body.classList.add('has-cursor');

  const handleMouseMove = throttle((e) => {
    cursor.classList.add('active');
    follower.classList.add('active');

    cursor.style.left = e.clientX - 4 + 'px';
    cursor.style.top = e.clientY - 4 + 'px';

    setTimeout(() => {
      follower.style.left = e.clientX - 16 + 'px';
      follower.style.top = e.clientY - 16 + 'px';
    }, 50);
  }, 16);

  document.addEventListener('mousemove', handleMouseMove);

  document.querySelectorAll('a, button, .gallery-item, .category-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.classList.add('hover');
      cursor.style.transform = 'scale(0.5)';
    });
    el.addEventListener('mouseleave', () => {
      follower.classList.remove('hover');
      cursor.style.transform = 'scale(1)';
    });
  });
}

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isActive = menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', isActive);

    // Prevent body scroll when menu is open
    document.body.style.overflow = isActive ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menuToggle.focus();
    }
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  });
});

// Back to top button
const backToTop = document.querySelector('.back-to-top');

if (backToTop) {
  const handleBackToTopScroll = throttle(() => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }, 100);

  window.addEventListener('scroll', handleBackToTopScroll);

  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  });
}

// Reading progress bar
const progressBar = document.querySelector('.reading-progress');

if (progressBar) {
  const handleProgressScroll = throttle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }, 16);

  window.addEventListener('scroll', handleProgressScroll);
}

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .stagger-children').forEach(el => {
  observer.observe(el);
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

if (navbar) {
  const handleNavbarScroll = throttle(() => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 100);

  window.addEventListener('scroll', handleNavbarScroll);
}

// Gallery filter
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    const filter = this.dataset.filter;
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = 'block';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, 50);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 400);
      }
    });
  });
});

// Hero parallax - only if no reduced motion preference
const hero = document.querySelector('.hero');
if (hero && !prefersReducedMotion) {
  const handleHeroParallax = throttle(() => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      const heroContent = hero.querySelector('.hero-content');
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
        heroContent.style.opacity = 1 - (scrolled * 0.0015);
      }
    }
  }, 16);

  window.addEventListener('scroll', handleHeroParallax);
}

// Hero title letter animation
function animateText(element) {
  const text = element.textContent;
  element.innerHTML = '';
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? ' ' : char;
    span.className = 'letter';
    span.style.animationDelay = `${i * 0.05 + 0.2}s`;
    element.appendChild(span);
  });
}

const heroTitle = document.querySelector('.hero-title');
if (heroTitle && !heroTitle.querySelector('.letter') && !prefersReducedMotion) {
  animateText(heroTitle);
}

// Active nav link highlighting
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href*="#"]');

  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 200;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(current)) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', throttle(updateActiveNavLink, 100));
