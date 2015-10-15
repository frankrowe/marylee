$(document).ready(function(){
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ]

  var tick = 5

  var map = new L.Map('map')

  var info = L.control({position: 'bottomleft'});

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'controls'); // create a div with a class "info"
      this.update();
      return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML = '<div class="btn-group" role="group"><button id="prev" type="button" class="btn btn-default"><span class="glyphicon glyphicon-backward" aria-hidden="true"></span></button><button id="start" type="button" class="btn btn-default"><span class="glyphicon glyphicon-pause" aria-hidden="true"></span></button><button id="forward" type="button" class="btn btn-default"><span class="glyphicon glyphicon-forward" aria-hidden="true"></span></button></div><span id="date"></span><input type="range" id="slider" min="1" value="1" max="1" step="1">';
  };

  info.addTo(map);

  info.getContainer().addEventListener('mouseover', function () {
    map.doubleClickZoom.disable()
    map.dragging.disable();
  });

  // Re-enable dragging when user's cursor leaves the element
  info.getContainer().addEventListener('mouseout', function () {
    map.doubleClickZoom.enable()
    map.dragging.enable();
  });

  var basemapLayer = new L.TileLayer('http://{s}.tiles.mapbox.com/v3/github.map-xgq2svrz/{z}/{x}/{y}.png');
  var osm = new L.TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
  var ocean = new L.TileLayer('http://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: '<a href="http://server.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer">ESRI World Ocean Base</a>'
  })
  var labels = new L.TileLayer('http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}')
  map.setView([40, -80], 4)

  map.addLayer(ocean)
  map.addLayer(labels)

  $('#slider').attr('max', track.geometry.coordinates.length-1)

  var finIcon = L.icon({
    iconUrl: './shark.png',
    iconSize:     [71, 41], // size of the icon
    iconAnchor:   [35, 20], // point of the icon which will correspond to marker's location
  })

  var trackLayer = L.geoJson(null, {
    opacity: 1
    , weight: 1
  }).addTo(map)

  var finMarker = L.marker([track.geometry.coordinates[1][1], track.geometry.coordinates[1][0]], {icon: finIcon}).addTo(map)

  var idx = 1
  var dateEl = $('#date')
  var slider = $('#slider')

  addPing(idx)

  function formatDate(_date) {
    if (_date) {
      var date = new Date(_date)
      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();
      var hr = date.getHours();
      var min = date.getMinutes()
      if (min < 10) {
        min = '0' + min
      }
      return monthNames[monthIndex] + ' ' + day + ' ' + year + ' ' + hr + ':' + min
    } else return ''
  }

  function addPing(value) {
    if (idx < track.geometry.coordinates.length-1 || value < idx) {
      trackLayer.clearLayers()
      var geojson = {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": track.geometry.coordinates.slice(0,value+1)
        },
        "properties": {}
      }
      trackLayer.addData(geojson)
      finMarker.setLatLng([track.geometry.coordinates[value][1], track.geometry.coordinates[value][0]])
      dateEl.html(formatDate(track.properties.time[value]))
      idx = value
    }
  }

  var intervalFunc = function() {
    addPing(idx+1)
    slider.val(idx+1)
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

  $('#prev').click(function() {
    if (idx > 1) {
      addPing(idx - 1)
    }
  })

  $('#forward').click(function() {
    if (idx < track.geometry.coordinates.length-1) {
      addPing(idx+1)
    }
  })

  $('#slider').on('input change', function() {
    clearInterval(intervalID)
    addPing(+$(this).val())
  })

  $('#slider').on(' change', function() {
    if (isRunning) {
      intervalID = setInterval(intervalFunc, tick)
    }
  })

})
