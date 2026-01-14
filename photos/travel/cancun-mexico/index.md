---
layout: default
title: Cancun, Mexico
---

<section class="photo-category">
  <a href="/photos/travel/" class="back-link">← Back to Travel</a>
  <h1 class="location-title">Cancun, Mexico</h1>
  
  <div class="gallery-grid">
    {% for image in site.static_files %}
      {% if image.path contains 'photos/travel/cancun-mexico' and image.extname == '.jpg' or image.path contains 'photos/travel/cancun-mexico' and image.extname == '.png' %}
        <div class="gallery-item">
          <a href="{{ image.path | relative_url }}" data-lightbox="cancun" data-title="Cancun, Mexico">
            <img src="{{ image.path | relative_url }}" alt="Cancun photo" loading="lazy">
          </a>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>
