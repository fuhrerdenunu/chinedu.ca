---
layout: default
title: Boston, USA
---

<section class="photo-category">
  <a href="/photos/travel/" class="back-link">← Back to Travel</a>
  <h1 class="location-title">Boston, USA</h1>
  
  <div class="gallery-grid">
    {% for image in site.static_files %}
      {% if image.path contains 'photos/travel/boston-usa' and image.extname == '.jpg' or image.path contains 'photos/travel/boston-usa' and image.extname == '.png' %}
        <div class="gallery-item">
          <a href="{{ image.path | relative_url }}" data-lightbox="boston" data-title="Boston, USA">
            <img src="{{ image.path | relative_url }}" alt="Boston photo" loading="lazy">
          </a>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>
