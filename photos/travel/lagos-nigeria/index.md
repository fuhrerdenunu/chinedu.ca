---
layout: default
title: Lagos, Nigeria
---

<section class="photo-category">
  <a href="/photos/travel/" class="back-link">← Back to Travel</a>
  <h1 class="location-title">Lagos, Nigeria</h1>
  
  <div class="gallery-grid">
    {% for image in site.static_files %}
      {% if image.path contains 'photos/travel/lagos-nigeria' and image.extname == '.jpg' or image.path contains 'photos/travel/lagos-nigeria' and image.extname == '.png' %}
        <div class="gallery-item">
          <a href="{{ image.path | relative_url }}" data-lightbox="lagos" data-title="Lagos, Nigeria">
            <img src="{{ image.path | relative_url }}" alt="Lagos photo" loading="lazy">
          </a>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>
