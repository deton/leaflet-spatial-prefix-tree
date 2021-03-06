
var labelConfig = {
  noHide: true,
  className: "my-label",
  direction: 'right',
  offset: [5, 5],
  zoomAnimation: true
};

var labelConfig2 = {
  noHide: true,
  className: "my-label2",
  direction: 'right',
  offset: [-15, -10],
  zoomAnimation: true
};

var rectStyle = {
  color: "#ff0000",
  weight: 1,
  opacity: 0.3,
  fillOpacity: 0,
  lineCap: 'butt'
};

var layerGroup = L.layerGroup();
map.addLayer( layerGroup );

var quadAdapter = {
  range: function ( prefix ){
    return ['0','1','2','3'].map( function( n ){
      var hash = '' + prefix + n;
      return hash;
    } );
  },
  encode: function( centroid, precision ){
    var zoom = precision-1;
    var tile = getTileXYZ( centroid.lat, centroid.lng, zoom );
    return SlippyToQuad( tile.x, tile.y, tile.z );
  },
  bbox: function( hash ){

    var tileSize = 256;
    var tile = QuadToSlippy(hash);

    // get NorthWest and SouthEast points
    var nwTilePoint = new L.Point( tile.x * tileSize, tile.y * tileSize );
    var seTilePoint = new L.Point( tile.x * tileSize, tile.y * tileSize );
    seTilePoint.x += tileSize;
    seTilePoint.y += tileSize;

    var nwLatLon = map.unproject( nwTilePoint, tile.z );
    var seLatLon = map.unproject( seTilePoint, tile.z );

    return {
      minlng: nwLatLon.lng,
      minlat: seLatLon.lat,
      maxlng: seLatLon.lng,
      maxlat: nwLatLon.lat
    };
  },
  layers: function( currentHash, zoom ){
    var layers = {};
    // if( zoom > 4 ) layers[ currentHash.substr( 0, zoom -4 ) ] = true;
    // if( zoom > 3 ) layers[ currentHash.substr( 0, zoom -3 ) ] = true;
    if( zoom > 2 ) layers[ currentHash.substr( 0, zoom -2 ) ] = true;
    if( zoom > 1 ) layers[ currentHash.substr( 0, zoom -1 ) ] = true;
    layers[ currentHash.substr( 0, zoom ) ] = true;
    return layers;
  },
  labels: function( hash ){
    return {
      long: hash,
      short: hash.substr(-1, 1)
    };
  }
};

var slippyAdapter = {
  range: quadAdapter.range,
  encode: quadAdapter.encode,
  bbox: quadAdapter.bbox,
  layers: quadAdapter.layers,
  labels: function( hash ){
    var tile = QuadToSlippy( hash );
    return {
      long: [ tile.z, tile.x, tile.y ].join('/'),
      short: ''
    };
  }
};

/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  };
}

function getTileXYZ(lat, lon, zoom) {
  var xtile = parseInt(Math.floor( (lon + 180) / 360 * (1<<zoom) ));
  var ytile = parseInt(Math.floor( (1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1<<zoom) ));
  return { x:xtile, y:ytile, z:zoom };
}

function QuadToSlippy(quad) {
  var x = 0;
  var y = 0;
  var z = 0;
	quad.split("").forEach(function(char){
    x *= 2;
		y *= 2;
		z++;

		if( char == "1" || char == "3" ){
			x++;
		}

		if( char == "2" || char == "3" ){
			y++;
		}
  });
	return { x:x, y:y, z:z };
}

function SlippyToQuad(x, y, z) {
  var quadKey = [];
  for (var i = z; i > 0; i--) {
    var digit = '0';
    var mask = 1 << (i - 1);
    if( (x & mask) !== 0 ){
      digit++;
    }
    if( (y & mask) !== 0 ){
      digit++;
      digit++;
    }
    quadKey.push(digit);
  }
  return quadKey.join('');
}

// function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
// function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
// function tile2long(x,z) {
//  return (x/Math.pow(2,z)*360-180);
// }
// function tile2lat(y,z) {
//  var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
//  return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
// }

var hashAdapter = {
  range: function ( prefix ){
    return Object.keys( BASE32_CODES_DICT ).map( function( n ){
      var hash = '' + prefix + n;
      return hash;
    } );
  },
  encode: function( centroid, precision ){
    return '' + geohash.encode( centroid.lat, centroid.lng, precision );
  },
  bbox: function( str ){
    var box = geohash.decode_bbox( '' + str );
    return { minlat: box[0], minlng: box[1], maxlat: box[2], maxlng: box[3] };
  },
  layers: function( currentHash, zoom ){
    var layers = {};
    layers[ '' ] = true;
    for( var x=1; x<7; x++ ){
      if( zoom >= (x*3) && zoom < ((x+2)*3) ){
        layers[ '' + currentHash.substr( 0, x ) ] = true;
      }
    }
    return layers;
  },
  labels: function( hash ){
    return {
      long: hash,
      short: hash.substr(-1, 1)
    };
  }
};

var RANGE100 = [];
for( var i = 0; i < 10; i++ ){
  RANGE100.push( '0' + i );
}
for( var i = 10; i < 100; i++ ){
  RANGE100.push( '' + i );
}

var RANGE64 = [];
for( var i = 0; i < 8; i++ ){
  RANGE64.push( '0' + i );
}
for( var j = 1; j < 8; j++ ){
  for( var i = 0; i < 8; i++ ){
    RANGE64.push( '' + ( j*10 + i ) );
  }
}

var jisx0410meshAdapter = {
  range: function ( prefix ){
    if( prefix.length < 4 ){
      var center = map.getCenter();
      // JISX0410 domain of definition
      if( center.lat < 0 || center.lat >= 66.66 || center.lng < 100 || center.lng >= 180 ){
        return [];
      }
      var hashlist = [];
      var cmesh = cal_meshcode1( center.lat, center.lng ).substring(2);
      var vertparam = cmesh.substr( 0, 2 );
      for( var i = +cmesh - 5; i < +cmesh + 5; i++ ){
        var mesh = '' + i;
        var horizparam = mesh.substr( 2, 2 );
        for( var j = +vertparam - 5; j < +vertparam + 5; j++ ){
          hashlist.push( '' + j + horizparam );
        }
      }
      //console.log(hashlist);
      return hashlist;
    }else if( prefix.length == 4 ){
      return tohash( RANGE64 );
    }
    return tohash( RANGE100 );
    function tohash( subkeys ){
      return subkeys.map( function( n ){
        var hash = '' + prefix + n;
        return hash;
      } );
    }
  },
  encode: function( centroid, precision ){
    var zoom = precision-1;
    if( zoom < 6 ){
      return '' + cal_meshcode1( centroid.lat, centroid.lng ).substring(2);
    }else if( zoom < 10 ){
      return '' + cal_meshcode1( centroid.lat, centroid.lng ).substring(2);
    }else if( zoom < 14 ){
      return '' + cal_meshcode2( centroid.lat, centroid.lng ).substring(2);
    }else if( zoom < 19 ){
      return '' + cal_meshcode3( centroid.lat, centroid.lng ).substring(2);
    }
  },
  bbox: function( str ){
    var box = meshcode_to_latlong_grid( '20' + str );
    return { minlat: box.lat0, minlng: box.long0, maxlat: box.lat1, maxlng: box.long1 };
  },
  layers: function( currentHash, zoom ){
    var layers = {};
    if( zoom >= 6 ){
      layers[ currentHash.substr( 0, 2 ) ] = true;
    }
    if( zoom >= 10 ){
      layers[ currentHash.substr( 0, 4 ) ] = true;
    }
    if( zoom >= 14 ){
      layers[ currentHash.substr( 0, 6 ) ] = true;
    }
    return layers;
  },
  labels: function( hash ){
    return {
      long: hash,
      short: hash.substr(-2, 2)
    };
  }
};

var currentHash;
var adapter = quadAdapter;
// var adapter = hashAdapter;

var mousePositionEvent = null;

var generateCurrentHash = function( precision ){

  var center = map.getCenter();

  if( mousePositionEvent ){
    center = mousePositionEvent.latlng;
    // console.log( center );
  }

  return adapter.encode( center, precision );
};

var prevHash = 'NOTAHASH';
var changeHashFunction = function( algorithm ){
  if( algorithm == 'geohash' ) adapter = hashAdapter;
  else if( algorithm == 'slippy' ) adapter = slippyAdapter;
  else if( algorithm == 'jisx0410mesh' ) adapter = jisx0410meshAdapter;
  else adapter = quadAdapter;
  prevHash = 'NOTAHASH'; // force hash to regenerate
  updateLayer();
};

// 0 : 1 char
// 3 : 2 chars
// 6 : 3 chars
var zoomToHashChars = function( zoom ){
  return 1 + Math.floor( zoom / 3 );
};

var zoomToMeshChars = function( zoom ){
  if( zoom < 6 ){
    return 2;
  }else if( zoom < 10 ){
    return 2;
  }else if( zoom < 14 ){
    return 4;
  }else if( zoom < 19 ){
    return 6;
  }
  return 6;
};

function updateLayer(){

  var zoom = map.getZoom();
  var hashLength = zoom+1;

  // update current hash
  currentHash = generateCurrentHash( hashLength );

  if( adapter === hashAdapter ){
    hashLength = zoomToHashChars( zoom );
  }else if( adapter === jisx0410meshAdapter ){
    hashLength = zoomToMeshChars( zoom );
  }

  var hashPrefix = currentHash.substr( 0, hashLength );

  // console.log( 'zoom', zoom );
  // console.log( 'prevHash', prevHash );
  // console.log( 'hashPrefix', hashPrefix );

  // performance tweak
  // @todo: not that performant?
  if( prevHash != hashPrefix ){
    // console.log( 'zoom', zoom );
    layerGroup.clearLayers();

    var layers = adapter.layers( currentHash, zoom );
    for( var attr in layers ){
      drawLayer( attr, layers[attr] );
    }
  }

  prevHash = hashPrefix;
}

function drawRect( bounds, hash, showDigit ){

  // console.log('draw');

  // http://leafletjs.com/reference.html#path-options
  var poly = L.rectangle( bounds, rectStyle );
  poly.addTo( layerGroup );

  // generate labels
  var labels = adapter.labels( hash );

  // full (long) hash marker
  if( labels.long.length > 1 ){
    var marker = new L.marker( poly.getBounds().getNorthWest(), { opacity: 0.0001 });
    marker.bindLabel( labels.long, labelConfig );
    marker.addTo( layerGroup );
  }

  // large single digit marker
  if( showDigit ){
    var marker2 = new L.marker( poly.getBounds().getCenter(), { opacity: 0.0001 });
    marker2.bindLabel( labels.short, labelConfig2 );
    marker2.addTo( layerGroup );
  }
}

function drawLayer( prefix, showDigit ){
  adapter.range( prefix ).forEach( function( hash ){

    var bbox = adapter.bbox( hash );
    if( bbox === null ){
      return;
    }

    var bounds = L.latLngBounds(
      L.latLng( bbox.maxlat, bbox.minlng ),
      L.latLng( bbox.minlat, bbox.maxlng )
    );

    // console.log( hash );
    // console.log( bbox );
    // console.log( bounds );

    drawRect( bounds, hash, showDigit );
  });
}

// update on changes
map.on('zoomend', updateLayer);
map.on('moveend', updateLayer);

// init
changeHashFunction( 'quadtree' );
// updateLayer();

//map.on('mousemove', function( e ){
//  mousePositionEvent = e;
//  updateLayer();
//});
