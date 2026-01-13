---
layout: default
title: Travel Photos
---

{% for image in site.static_files %}
  {% if image.path contains 'photos/travel' and image.path contains '.jpg' or image.path contains '.png' %}
  ![Travel photo]({{ image.path }})
  {% endif %}
{% endfor %}
