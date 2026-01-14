---
layout: default
title: Ogidi, Anambra
---

<section class="photo-category">
  <a href="/photos/travel/" class="back-link">← Back to Travel</a>
  <h1 class="location-title">Ogidi, Anambra</h1>
  
  <div class="gallery-grid">
    {% for image in site.static_files %}
      {% if image.path contains 'photos/travel/ogidi-anambra' and image.extname == '.jpg' or image.path contains 'photos/travel/ogidi-anambra' and image.extname == '.png' %}
        <div class="gallery-item">
          <a href="{{ image.path | relative_url }}" data-lightbox="ogidi" data-title="Ogidi, Anambra">
            <img src="{{ image.path | relative_url }}" alt="Ogidi photo" loading="lazy">
          </a>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>
