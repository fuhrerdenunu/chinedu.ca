---
layout: default
title: Personal Photos
---

{% for image in site.static_files %}
  {% if image.path contains 'photos/personal' and image.path contains '.jpg' or image.path contains '.png' %}
  ![Personal photo]({{ image.path }})
  {% endif %}
{% endfor %}
