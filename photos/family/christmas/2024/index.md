---
layout: default
title: Christmas 2024
---

<section class="photo-category">
  <a href="/photos/family/christmas/" class="back-link">← Back to Christmas</a>
  <h1 class="location-title">Christmas 2024</h1>
  
  <div class="gallery-grid">
    {% for image in site.static_files %}
      {% if image.path contains 'photos/family/christmas/2024' and image.extname == '.jpg' or image.path contains 'photos/family/christmas/2024' and image.extname == '.png' %}
        <div class="gallery-item">
          <a href="{{ image.path | relative_url }}" data-lightbox="christmas2024" data-title="Christmas 2024">
            <img src="{{ image.path | relative_url }}" alt="Christmas 2024 photo" loading="lazy">
          </a>
        </div>
      {% endif %}
    {% endfor %}
  </div>
</section>
