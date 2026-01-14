---
layout: default
title: St. Louis, USA
---

<section class="photo-category">
  <a href="/photos/travel/" class="back-link">← Back to Travel</a>
  <h1 class="location-title">St. Louis, USA</h1>
  
  <div class="gallery-grid">
    {% for image in site.static_files %}
      {% if image.path contains 'photos/travel/st-louis-usa' and image.extname == '.jpg' or image.path contains 'photos/travel/st-louis-usa' and image.extname == '.png' %}
        <div class="gallery-item">
          <a href="{{ image.path | relative_url }}" data-lightbox="stlouis" data-title="St. Louis, USA">
            <img src="{{ image.path | relative_url }}" alt="St. Louis photo" loading="lazy">
          </a>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>
