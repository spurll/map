var highlight;
var display;
var pointElements = [];
var styleCache = {};
var highlightStyleCache = {};

// Create some point elements.
var winnipeg = ol.proj.transform([-97.15, 49.85], 'EPSG:4326', 'EPSG:3857');
var london = ol.proj.transform([0.10, 51.53], 'EPSG:4326', 'EPSG:3857');

// Adds a point element to the map.
function addPointElement(pos, name, link) {
	id = pointElements.length;

	// Create HTML elements.
	var markerID = "marker_" + id;
	var markerElement = '<div class="marker" id="' + markerID + '" title="' + name + '">&nbsp;</div>';
	$("#hidden_content").append(markerElement);

	// Create map overlay object for marker.
	var markerOverlay = new ol.Overlay({
		position: pos,
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
		this.position = pos;
		this.link = link;
		this.selected = false;
		this.overlay = markerOverlay;

		this.info = function() {
			return '<div class="info_title">' + this.name + '</div><div class="info_details"><a href="' + this.link + '" target="_blank">' + this.name + ' on Wikipedia</a></div>';
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

function distance(a, b) {
	return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function toggleVectorLayer(checkbox){
	vectorLayer.setVisible(checkbox.checked);
}

// Define the satelite map layer.
var sateliteLayer = new ol.layer.Tile({
	source: new ol.source.MapQuest({layer: 'sat'})
})

// Define the vector layer (used for country borders, etc.)
var countryLayer = new ol.layer.Vector({
	source: new ol.source.GeoJSON({
		projection: 'EPSG:3857',
		url: 'countries.geojson'
	}),
	style: function(feature) {
		var text = feature.get('name');
		if (!styleCache[text]) {
			styleCache[text] = [new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(49, 159, 211, 0.1)'
				}),
				stroke: new ol.style.Stroke({
					color: '#319fd3',
					width: 1
				}),
			})];
		}
		return styleCache[text];
	}
});

// Define the map.
var map = new ol.Map({
	target: 'map',
	layers: [
		sateliteLayer,
		countryLayer,
	],
	view: new ol.View({
		center: winnipeg,
		zoom: 3,
		minZoom: 2,
		maxZoom: 9,
	})
});

var featureOverlay = new ol.FeatureOverlay({
	map: map,
	style: function(feature) {
		var text = feature.get('name');
		if (!highlightStyleCache[text]) {
			highlightStyleCache[text] = [new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#ffffff',
					width: 1
				}),
				fill: new ol.style.Fill({
					color: 'rgba(49, 159, 211, 0.2)'
				}),
			})];
		}
		return highlightStyleCache[text];
	}
});

// Displays information about whatever features (area elements) are beneath the given pixel.
function displayInfo(pixel) {
	var info = "";

	// Check overlays for "point elements" and highlight/display.
	var area = 10;	// Anything within 10 pixels is a "hit".

	for (var i = 0; i < pointElements.length; i++) {
		var p = pointElements[i];
		if (distance(pixel, map.getPixelFromCoordinate(p.position)) <= area) {
			p.select();
			info += p.info();
		}
		else if (p.selected) {
			p.deselect();
		}
	}

	// HIGHLIGHT THE POINT ELEMENT, TOO.

	// Check features for "area elements" and highlight/display.
	var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
		return feature;
	});

	// TEST TO SEE WHAT HAPPENS WITH MULTIPLE FEAUTRES THAT OVERLAP.
	// ENSURE THAT BOTH AREA AND POINT EVENTS DISPLAY AT THE SAME TIME.

	if (feature) {
		info += getFeatureInfo(feature);
	}

	if (feature !== highlight) {
		if (highlight) {
			featureOverlay.removeFeature(highlight);
		}
		if (feature) {
			featureOverlay.addFeature(feature);
		}
		highlight = feature;
	}



	// SHOULD REMOVE HIGHLIGHT INSTEAD OF ADDING IT IF IT'S ALREADY IN THE DISPLAY.
	// SHOULD JUST KEEP LISTS OF THINGS THAT ARE HIGHLIGHTED AND THINGS THAT AREN'T.

	if (info == "")
		info = "&nbsp;";

	$("#info").html(info);
}

// Determines what to populate the info panel with.
function getFeatureInfo(feature) {
	var name = feature.get('name');
	var link;

	var info = '<div class="info_title">' + name + '</div>';

	if (info.hasOwnProperty("link"))
		link = feature.get('link');
	else
		link = "https://en.wikipedia.org/wiki/" + name.replace(" ", "_");

	info += '<div class="info_details"><a href="' + link + '" target="_blank">' + name + ' on Wikipedia</a></div>';

	return info;
}

map.on('click', function(evt) {
	displayInfo(evt.pixel);
});

addPointElement(winnipeg, "Winnipeg", "http://en.wikipedia.org/wiki/Winnipeg");
addPointElement(london, "London", "http://en.wikipedia.org/wiki/London");

