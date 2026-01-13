---
layout: default
title: Food Photos
---

{% for image in site.static_files %}
  {% if image.path contains 'photos/food' and image.path contains '.jpg' or image.path contains '.png' %}
  ![Food photo]({{ image.path }})
  {% endif %}
{% endfor %}
