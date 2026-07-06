(function () {
  const storageKey = 'theme-preference';
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function getThemePreference() {
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
    return 'dark';
}

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(storageKey, theme);
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  const theme = getThemePreference();
  setTheme(theme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = html.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  var path = window.location.pathname;
  var page = path.split('/').pop() || 'index.html';
  var links = document.querySelectorAll('.nav__link');
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href');
    if (href === page) {
      links[i].classList.add('nav__link--active');
      break;
    }
  }

  // Lightbox
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCounter = document.getElementById('lightbox-counter');
    var lightboxClose = document.getElementById('lightbox-close');
    var lightboxPrev = document.getElementById('lightbox-prev');
    var lightboxNext = document.getElementById('lightbox-next');

    var currentImages = [];
    var currentIndex = 0;

    function openLightbox(index, images) {
      currentImages = images;
      currentIndex = index;
      updateLightbox();
      lightbox.classList.add('lightbox--open');
      document.body.style.overflow = 'hidden';
    }

    function updateLightbox() {
      lightboxImg.src = currentImages[currentIndex];
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + currentImages.length;
    }

    function closeLightbox() {
      lightbox.classList.remove('lightbox--open');
      document.body.style.overflow = '';
    }

    lightboxClose.addEventListener('click', function (e) {
      e.stopPropagation();
      closeLightbox();
    });

    lightbox.addEventListener('click', function () {
      closeLightbox();
    });

    lightboxImg.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    lightboxPrev.addEventListener('click', function (e) {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
      updateLightbox();
    });

    lightboxNext.addEventListener('click', function (e) {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % currentImages.length;
      updateLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('lightbox--open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        updateLightbox();
      }
      if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % currentImages.length;
        updateLightbox();
      }
    });

    // Thumbnail click handlers
    var galleries = document.querySelectorAll('.card__images');
    for (var g = 0; g < galleries.length; g++) {
      (function (gallery) {
        var thumbs = gallery.querySelectorAll('img');
        var images = [];
        for (var t = 0; t < thumbs.length; t++) {
          images.push(thumbs[t].getAttribute('data-full') || thumbs[t].src);
          (function (index) {
            thumbs[index].addEventListener('click', function () {
              openLightbox(index, images);
            });
          })(t);
        }
      })(galleries[g]);
    }
  }

  // Hero Canvas
  (function () {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var hero = document.querySelector('.hero');

    function resize() {
      if (!hero) return;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var chars = '0123456789ABCDEF><(){}[]/\\|;:*+-=<>?@#$%^&';
    var particles = [];
    var particleCount = 80;
    var mouseX = -1000;
    var mouseY = -1000;
    var mouseActive = false;

    for (var i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0.2 + Math.random() * 0.4,
        char: chars[Math.floor(Math.random() * chars.length)],
        size: 8 + Math.random() * 6,
        opacity: 0.2 + Math.random() * 0.08,
        scatterX: 0,
        scatterY: 0
      });
    }

    if (hero) {
      hero.addEventListener('mousemove', function (e) {
        var rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        mouseActive = true;
      });

      hero.addEventListener('mouseleave', function () {
        mouseActive = false;
      });
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        if (mouseActive) {
          var dx = p.x - mouseX;
          var dy = p.y - mouseY;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            var force = (120 - dist) / 120;
            p.scatterX += (dx / (dist || 1)) * force * 2;
            p.scatterY += (dy / (dist || 1)) * force * 2;
          }
        }

        p.scatterX *= 0.95;
        p.scatterY *= 0.95;

        p.x += p.vx + p.scatterX;
        p.y += p.vy + p.scatterY;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        ctx.font = p.size + 'px "Courier New", Courier, monospace';
        ctx.fillStyle = 'rgba(0, 229, 255, ' + p.opacity + ')';
        ctx.fillText(p.char, p.x, p.y);
      }
      requestAnimationFrame(loop);
    }
    loop();
  })();
})();
