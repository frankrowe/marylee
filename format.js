var fs = require('fs')
  , http = require('http')

var options = {
  host: 'www.ocearch.org',
  path: '/tracker/ajax/filter-sharks/?sharks%5B%5D=41&tracking-activity=+&gender=+&stage-of-life=+&location=0'
}

http.request(options, function(response) {
  var str = '';

  response.on('data', function (chunk) {
    str += chunk
  })

  response.on('end', function () {
    format(JSON.parse(str))
    save(JSON.parse(str))
  })

}).end()

function format(json) {
  var marylee = json[0]

  var geojson = {
    "type": "Feature",
    "geometry": {
      "type": "MultiPoint",
      "coordinates": []
    },
    "properties": {
      "time": []
    }
  }

  marylee.pings.reverse().forEach(function(ping, idx) {
    geojson.geometry.coordinates.push([+ping.longitude, +ping.latitude])
    geojson.properties.time.push(new Date(ping.datetime))
  })

  fs.writeFileSync('./js/marylee-track.js', 'var track = ' + JSON.stringify(geojson))
}


function save(json) {
  fs.writeFileSync('./marylee.json', JSON.stringify(json))
}

