Map of History
==============

A map of history.

Bugs and Feature Requests
=========================

Feature Requests
----------------

* Proper support for smaller screens.
* No-satelite mode, where only vector borders of the land-masses are visible. (Should be default.)
* Present-day borders should be off by default.
* Area and point elements should be loaded from a DB.
* Events (with time and place) should be defined. (Could be added/removed via separate Python script that does lookups, etc.)
* Different colours for different event types.
* Time slider (that looks good, is labeled, and does something).
* Javascript code should be optimized ("compiled").
* Proper favicon.

Known Bugs
----------

* Area elements must be added *before* the map is instantiated, while point elements must be added *after* the map is instantiated.
* When scrolling east/west, markers do not wrap (they don't reapear as the "globe" spins back around).
* User can scroll too far north/south, sliding the map off of the page.

License Information
===================

Written by Gem Newman. [GitHub](https://github.com/spurll/) | [Blog](http://www.startleddisbelief.com) | [Twitter](https://twitter.com/spurll)

This work is licensed under Creative Commons [BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/).

This work makes use of [OpenLayers 3](http://openlayers.org), licensed under the <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/">Creative Commons BY-NC-SA 3.0 license</a>. Map code uses OpenLayers 3, Copyright &copy; OpenLayers Contributors, licensed under the [BSD 2-Clause License](https://tldrlegal.com/license/bsd-2-clause-license-(freebsd)).
