$(document).ready(function(){
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ]

  var tick = 10

  var map = new L.Map('map')

  var info = L.control({position: 'bottomleft'});

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'controls'); // create a div with a class "info"
      this.update();
      return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
      this._div.innerHTML = '<button id="start" type="button" class="btn btn-default"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button><span id="date"></span><input type="range" id="slider" min="1" value="1" max="1" step="1">';
  };

  info.addTo(map);

  info.getContainer().addEventListener('mouseover', function () {
      map.dragging.disable();
  });

  // Re-enable dragging when user's cursor leaves the element
  info.getContainer().addEventListener('mouseout', function () {
      map.dragging.enable();
  });

  var basemapLayer = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/github.map-xgq2svrz/{z}/{x}/{y}.png');
  var osm = new L.TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
  var ocean = new L.TileLayer('http://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: '<a href="http://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer">ESRI World Ocean Base</a>'
  })
  map.setView([40, -80], 4)

  map.addLayer(ocean)

  $('#slider').attr('max', track.geometry.coordinates.length-1)

  var finIcon = L.icon({
    iconUrl: './shark.png',
    iconSize:     [71, 41], // size of the icon
    iconAnchor:   [35, 20], // point of the icon which will correspond to marker's location
})

  var starting_geojson = {
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": track.geometry.coordinates.slice(0,2)
    },
    "properties": {
      "time": track.properties.time.slice(0,2)
    }
  }

  var trackLayer = L.geoJson(starting_geojson, {
    opacity: 1
    , weight: 1
  }).addTo(map)

  var finMarker = L.marker([track.geometry.coordinates[1][1], track.geometry.coordinates[1][0]], {icon: finIcon}).addTo(map)

  var idx = 1
  var dateEl = $('#date')
  var slider = $('#slider')

  function formatDate(_date) {
    if (_date) {
      var date = new Date(_date)
      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();
      return monthNames[monthIndex] + ' ' + day + ' ' + year
    } else return ''
  }

  var intervalFunc = function() {
    if (idx < track.geometry.coordinates.length-1) {
       var geojson = {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": track.geometry.coordinates.slice(idx,idx+2)
        },
        "properties": {}
      }
      trackLayer.addData(geojson)
      finMarker.setLatLng([track.geometry.coordinates[idx+1][1], track.geometry.coordinates[idx+1][0]])
      dateEl.html(formatDate(track.properties.time[idx]))
      slider.val(idx)
      idx = idx + 1
    }
  }

  var intervalID = setInterval(intervalFunc, tick)
  var isRunning = true

  $('#start').click(function() {
    if (isRunning) {
      $(this).html('<span class="glyphicon glyphicon-play" aria-hidden="true"></span>')
      clearInterval(intervalID)
    } else {
      $(this).html('<span class="glyphicon glyphicon-pause" aria-hidden="true"></span>')
      intervalID = setInterval(intervalFunc, tick)
    }
    isRunning = !isRunning
  })

  $('#slider').on('input change', function() {
    clearInterval(intervalID)
    var value = +$(this).val()
    if (value < idx) {
      trackLayer.clearLayers()
      idx = 1
    }
    var geojson = {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": track.geometry.coordinates.slice(idx,value+1)
      },
      "properties": {}
    }
    trackLayer.addData(geojson)
    finMarker.setLatLng([track.geometry.coordinates[value][1], track.geometry.coordinates[value][0]])
    dateEl.html(formatDate(track.properties.time[value]))
    idx = value

  })

  $('#slider').on(' change', function() {
    var value = +$(this).val()
    if (isRunning) {
      intervalID = setInterval(intervalFunc, tick)
    }
  })

})
