var fs = require('fs')

var marylee = JSON.parse(fs.readFileSync('./marylee.json', 'utf8'))[0]

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
