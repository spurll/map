var pointElements = [];
var areaElements = [];
var highlightedFeatures = [];
var styleCache = {};
var highlightStyleCache = {};
var clickDeselects = false;
var nextID = 0;

var winnipeg = [-97.15, 49.85]
var london = [0.10, 51.53]
var singleArea = [[[0, 0], [0, 15], [15, 15], [15, 0]]];
var doubleArea = [[[10, 10], [10, 15], [15, 15], [15, 10]], [[-20, -20], [-15, -20], [-15, -15], [-20, -15]]]

addAreaElement(singleArea, "Example Area", "Some information.", "http://en.wikipedia.org/wiki/Fred_Penner");
addAreaElement(doubleArea, "Example Double Area", "Some information.", "http://en.wikipedia.org/wiki/Raffi_(musician)");

// Adds a point element to the map.
function addPointElement(position, name, text, link) {
	id = nextID++;
	position = ol.proj.transform(position, 'EPSG:4326', 'EPSG:3857');

	// Create HTML elements.
	var markerID = "marker_" + id;
	var markerElement = '<div class="marker" id="' + markerID + '" title="' + name + '">&nbsp;</div>';
	$("#hidden_content").append(markerElement);

	// Create map overlay object for marker.
	var markerOverlay = new ol.Overlay({
		position: position,
		positioning: 'center-center',
		element: $("#" + markerID),
		stopEvent: false
	});
	map.addOverlay(markerOverlay);

	// Add to object to cache.
	var pointElement = new function() {
		this.id = id;
		this.markerID = markerID;
		this.name = name;
		this.position = position;
		this.text = text;
		this.link = link;
		this.selected = false;
		this.overlay = markerOverlay;

		this.info = function() {
			return '<div class="info_title">' + this.name + '</div><div class="info_details">' + this.text + ' <a href="' + this.link + '" target="_blank">More information.</a></div>';
		};

		this.select = function() {
			$("#" + this.markerID).addClass("selected");
			this.selected = true;
		}

		this.deselect = function() {
			$("#" + this.markerID).removeClass("selected");
			this.selected = false;
		}
	}

	pointElements.push(pointElement);
}

function addAreaElement(area, name, text, link) {
	id = nextID++;

	var feature = new ol.Feature({
		geometry: new ol.geom.Polygon(area).transform('EPSG:4326', 'EPSG:3857'),
		name: name,
		id: id,
		link: link,
		text: text,
	});

	areaElements.push(feature)
}

function distance(a, b) {
	return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function toggleCountryLayer(checkbox){
	countryLayer.setVisible(checkbox.checked);
}

function inList(object, list) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === object) {
            return true;
        }
    }

    return false;
}

// Define the satelite map layer.
var sateliteLayer = new ol.layer.Tile({
	source: new ol.source.MapQuest({layer: 'sat'})
})

// Define the vector layer used for country borders.
var countryLayer = new ol.layer.Vector({
	source: new ol.source.GeoJSON({
		projection: 'EPSG:3857',
		url: 'countries.geojson'
	}),
	style: function(feature) {
		var id = feature.get('id');
		if (!styleCache[id]) {
			styleCache[id] = [new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(49, 159, 211, 0.1)'
				}),
				stroke: new ol.style.Stroke({
					color: '#319fd3',
					width: 1
				}),
			})];
		}
		return styleCache[id];
	}
});

// Define the vector layer used for non-country area elements.
var areaElementLayer = new ol.layer.Vector({
	source: new ol.source.Vector({
		projection: 'EPSG:3857',
		features: areaElements,
	}),
	style: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: '#ff0000',
			width: 1
		})
	})
});

// Define the map.
var map = new ol.Map({
	target: 'map',
	layers: [
		sateliteLayer,
		countryLayer,
		areaElementLayer,
	],
	view: new ol.View({
		center: ol.proj.transform(winnipeg, 'EPSG:4326', 'EPSG:3857'),
		zoom: 0,
		minZoom: 2,
		maxZoom: 9,
	})
});

var featureOverlay = new ol.FeatureOverlay({
	map: map,
	style: function(feature) {
		var id = feature.get('id');
		if (!highlightStyleCache[id]) {
			highlightStyleCache[id] = [new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#ffffff',
					width: 2
				}),
				fill: new ol.style.Fill({
					color: 'rgba(255, 255, 255, 0.1)'
//					color: 'rgba(49, 159, 211, 0.2)'
				}),
			})];
		}
		return highlightStyleCache[id];
	}
});

// Displays information about whatever features (area elements) are beneath the given pixel.
function displayInfo(pixel) {
	var info = "";
	var addHighlight = [];

	// Check for "point elements" and highlight/display.
	var area = 10;
	// Anything within 10 pixels is a "hit".

	// Highlight point elements and add them to info.
	for (var i = 0; i < pointElements.length; i++) {
		var p = pointElements[i];
		if (distance(pixel, map.getPixelFromCoordinate(p.position)) <= area && (!clickDeselects || !p.selected)) {
			p.select();
			info += p.info();
		} else if (p.selected) {
			p.deselect();
		}
	}

	// Check features for area elements to  highlight/display.
	map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		if (!inList(feature, addHighlight)) {
			if (!clickDeselects || !inList(feature, highlightedFeatures)) {
				addHighlight.push(feature);
			}
		}
	});

	// Remove highlights from all existing highlighted areas.
	for (var i = 0; i < highlightedFeatures.length; i++) {
		featureOverlay.removeFeature(highlightedFeatures[i]);
	}
	highlightedFeatures = [];

	// Add new highlights to area elements.
	for (var i = 0; i < addHighlight.length; i++) {
		// Highlight the area element.
		featureOverlay.addFeature(addHighlight[i]);
		highlightedFeatures.push(addHighlight[i]);

		// Add area element info to the info panel.
		info += getFeatureInfo(addHighlight[i]);
	}

	if (info == "")
		info = "&nbsp;";

	$("#info").html(info);
}

// Determines what to populate the info panel with.
function getFeatureInfo(feature) {
	var name = feature.get('name');
	var link;

	var info = '<div class="info_title">' + name + '</div><div class="info_details">';

	text = feature.get("text");
	if (text)
		info += text + " ";

	link = feature.get("link")
	if (!link)
		link = "https://en.wikipedia.org/wiki/" + name.replace(" ", "_");

	info += '<a href="' + link + '" target="_blank">More information.</a></div>';

	return info;
}

map.on('click', function(evt) {
	displayInfo(evt.pixel);
});

addPointElement(winnipeg, "Winnipeg", "Something about Winnipeg.", "http://en.wikipedia.org/wiki/Winnipeg");
addPointElement(london, "London", "Something about London.", "http://en.wikipedia.org/wiki/London");

