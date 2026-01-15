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

// Loading screen
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  if (loader) {
    if (prefersReducedMotion) {
      loader.classList.add('hidden');
    } else {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 1500);
    }
  }
});

// Custom cursor - only on desktop and if no reduced motion
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (cursor && follower && window.innerWidth > 968 && !prefersReducedMotion) {
  document.body.classList.add('has-cursor');

  const handleMouseMove = throttle((e) => {
    cursor.classList.add('active');
    follower.classList.add('active');

    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    setTimeout(() => {
      follower.style.left = e.clientX - 15 + 'px';
      follower.style.top = e.clientY - 15 + 'px';
    }, 50);
  }, 16); // ~60fps

  document.addEventListener('mousemove', handleMouseMove);

  document.querySelectorAll('a, button, .gallery-item').forEach(el => {
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
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
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
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + '%';
  }, 16);

  window.addEventListener('scroll', handleProgressScroll);
}

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
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
      navbar.style.background = 'rgba(10, 10, 10, 0.95)';
    } else {
      navbar.style.background = 'rgba(10, 10, 10, 0.8)';
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
        item.style.transform = 'scale(0.8)';
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
    // Only apply parallax when hero is in view
    if (scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${scrolled * 0.3}px)`;
      hero.style.opacity = 1 - (scrolled * 0.002);
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
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.className = 'letter';
    span.style.animationDelay = `${i * 0.05}s`;
    element.appendChild(span);
  });
}

const heroTitle = document.querySelector('.hero-title');
if (heroTitle && !heroTitle.querySelector('.letter') && !prefersReducedMotion) {
  animateText(heroTitle);
}
