---
layout: default
title: Family Photos
---

{% for image in site.static_files %}
  {% if image.path contains 'photos/family' and image.path contains '.jpg' or image.path contains '.png' %}
  ![Family photo]({{ image.path }})
  {% endif %}
{% endfor %}
