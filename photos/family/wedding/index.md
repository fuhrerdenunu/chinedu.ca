---
layout: default
title: Wedding Photos
---

<section class="photo-category">
  <a href="/photos/family/" class="back-link">← Back to Family</a>
  <h1 class="location-title">Wedding</h1>
  
  <div class="gallery-grid">
    {% for image in site.static_files %}
      {% if image.path contains 'photos/family/wedding' and image.extname == '.jpg' or image.path contains 'photos/family/wedding' and image.extname == '.png' %}
        <div class="gallery-item">
          <a href="{{ image.path | relative_url }}" data-lightbox="wedding" data-title="Wedding">
            <img src="{{ image.path | relative_url }}" alt="Wedding photo" loading="lazy">
          </a>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>
