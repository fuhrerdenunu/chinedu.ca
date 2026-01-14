---
layout: default
title: Blue Mountain, Ontario
---

<section class="photo-category">
  <a href="/photos/travel/" class="back-link">← Back to Travel</a>
  <h1 class="location-title">Blue Mountain, Ontario</h1>
  
  <div class="gallery-grid">
    {% for image in site.static_files %}
      {% if image.path contains 'photos/travel/blue-mountain-ontario' and image.extname == '.jpg' or image.path contains 'photos/travel/blue-mountain-ontario' and image.extname == '.png' %}
        <div class="gallery-item">
          <a href="{{ image.path | relative_url }}" data-lightbox="bluemountain" data-title="Blue Mountain, Ontario">
            <img src="{{ image.path | relative_url }}" alt="Blue Mountain photo" loading="lazy">
          </a>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>
