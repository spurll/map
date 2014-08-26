Overview
========

A map of history.

Bugs and Feature Requests
=========================

Feature Requests
----------------

* No-satelite mode, where only vector borders of the land-masses are visible. (Should be default.)
* Present-day borders should be off by default.
* Area and point elements should be loaded from a DB.
* Events (with time and place) should be defined. (Could be added/removed via separate Python script that does lookups, etc.)
* Different colours for different event types.
* Time slider (that looks good, is labeled, and does something).
* Javascript code should be optimized ("compiled").

Known Bugs
----------

* Area elements must be added *before* the map is instantiated, while point elements must be added *after* the map is instantiated.
* When scrolling east/west, markers do not wrap (they don't reapear as the "globe" spins back around).
* User can scroll too far north/south, sliding the map off of the page.

License Information
===================

Written by Gem Newman.
http://www.startleddisbelief.com

This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

