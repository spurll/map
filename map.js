var highlight;
var display;
var markers = [];
var styleCache = {};
var highlightStyleCache = {};

var winnipeg = ol.proj.transform([-97.15, 49.85], 'EPSG:4326', 'EPSG:3857');
var london = ol.proj.transform([0.10, 51.53], 'EPSG:4326', 'EPSG:3857');

// Adds a single point to the map.
function addMarker(id, pos, name, link) {
	// Create HTML elements.
	var markerID = id + "_marker";
//	var labelID = id + "_label";

//	var labelElement = '<div class="overlay label" id="' + labelID + '">' + name + '</div>';
//	var markerElement = '<a href="' + link + '" target="_blank"><div class="marker overlay" id="' + markerID + '" title="' + name + '">&nbsp;</div></a>';
//	var labelElement = '<a class="overlay label" id="' + labelID + '" target="_blank" href="' + link + '">' + name + '</a>';
	var markerElement = '<div class="marker" id="' + markerID + '" title="' + name + '">&nbsp;</div>';

//	$("#hidden_content").append(labelElement);
	$("#hidden_content").append(markerElement);

	// Create map marker.
	var markerOverlay = new ol.Overlay({
		position: pos,
		positioning: 'center-center',
		element: $("#" + markerID),
		stopEvent: false
	});
	map.addOverlay(markerOverlay);

	// Add to object to cache.
	var markerObject = new function() {
		this.id = id;
		this.name = name;
		this.position = pos;
		this.link = link;
		this.overlay = markerOverlay;
		this.element = markerElement;

		// Could highlight by editing the div. Have a "highlighted" property.

		this.info = function() {
			return '<div class="info_title">' + this.name + '</div><div class="info_details"><a href="' + this.link + '" target="_blank">' + this.name + ' on Wikipedia</a></div>';
		};
	}
	markers.push(markerObject);

	// Create map label.
//	var label = new ol.Overlay({
//		position: pos,
//		offset: [0, 0],
//		element: $("#" + labelID)
//	});
//	map.addOverlay(label);
}

function toggleVectorLayer(checkbox){
	vectorLayer.setVisible(checkbox.checked);
}

// Define the vector layer (used for country borders, etc.)
var vectorLayer = new ol.layer.Vector({
	source: new ol.source.GeoJSON({
		projection: 'EPSG:3857',
		url: 'countries.geojson'
	}),
	style: function(feature, resolution) {
		var text = resolution < 5000 ? feature.get('name') : '';
		if (!styleCache[text]) {
			styleCache[text] = [new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(49, 159, 211, 0.1)'
//					color: 'rgba(255, 255, 255, 0.1)'
				}),
				stroke: new ol.style.Stroke({
//					color: '#319fd3',
					color: '#319fd3',
					width: 1
				}),
//				text: new ol.style.Text({
//					font: '11px Calibri, sans-serif',
//					text: text,
//					fill: new ol.style.Fill({
//						color: '#000000'
//					}),
//					stroke: new ol.style.Stroke({
//						color: '#ffffff',
//						width: 3
//					})
//				})
			})];
		}
		return styleCache[text];
	}
});

// Define the map.
var map = new ol.Map({
	target: 'map',
	layers: [
		new ol.layer.Tile({
			source: new ol.source.MapQuest({layer: 'sat'})
		}),
		vectorLayer
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
	style: function(feature, resolution) {
		var text = resolution < 5000 ? feature.get('name') : '';
		if (!highlightStyleCache[text]) {
			highlightStyleCache[text] = [new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: '#319fd3',
//					color: '#007f00',
					width: 1
				}),
				fill: new ol.style.Fill({
					color: 'rgba(49, 159, 211, 0.2)'
//					color: 'rgba(0, 127, 0, 0.1)'
				}),
//				text: new ol.style.Text({
//					font: '11px Calibri, sans-serif',
//					text: text,
//					fill: new ol.style.Fill({
//						color: '#ffffff'
//					}),
//					stroke: new ol.style.Stroke({
//						color: '#007f00',
//						width: 3
//					})
//				})
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

	for (var i = 0; i < markers.length; i++) {
		var m = markers[i];
		if (distance(pixel, map.getPixelFromCoordinate(m.position)) <= area) {
			info += m.info();
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

function distance(a, b) {
	return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

// Determines what to populate the info panel with.
function getFeatureInfo(feature) {
	//feature.getId() + ': ' + feature.get('name')

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

//$(map.getViewport()).on('mousemove', function(evt) {
//	var pixel = map.getEventPixel(evt.originalEvent);
//	displayFeatureInfo(pixel);
//});

addMarker(0, winnipeg, "Winnipeg", "http://en.wikipedia.org/wiki/Winnipeg");
addMarker(1, london, "London", "http://en.wikipedia.org/wiki/London");

