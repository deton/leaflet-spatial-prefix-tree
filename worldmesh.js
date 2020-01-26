//
// Copyright (c) 2015-2019 Research Institute for World Grid Squares 
// Dr. Aki-Hiro Sato
// All rights reserved. 
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//
// javascript fnctions to calculate the world grid square code.
// The world grid square code computed by this library is
// compatible to JIS X0410    
//
// Version 1.0: Released on 2 February 2017
// Version 1.01: Released on 6 February 2017
// Version 1.1: Released on 21 November 2019
//
// Written by Dr. Aki-Hiro Sato    
// Yokohama City University
// and 
// Japan Science and Technology Agency (JST)
//
// Contact:
// Address: 22-2, Seto, Kanazawa-ku, Yokohama, Kanagawa 236-0027 Japan
// E-mail: ahsato@yokohama-cu.ac.jp
//
// Three types of functions are defined in this library.
// 1. calculate representative geographical position(s) (latitude, longitude) of a grid square from a grid square code
// 2. calculate a grid square code from a geographical position (latitude, longitude)
// 3. calculate geodesic distance and size of grid square (representative lengths and area)
//
// 1.
//
// meshcode_to_latlong(meshcode)
// : calculate northen western geographic position of the grid (latitude, longitude) from meshcode
// meshcode_to_latlong_NW(meshcode)
// : calculate northen western geographic position of the grid (latitude, longitude) from meshcode
// meshcode_to_latlong_SW(meshcode)
// : calculate sourthern western geographic position of the grid (latitude, longitude) from meshcode
// meshcode_to_latlong_NE(meshcode)
// : calculate northern eastern geographic position of the grid (latitude, longitude) from meshcode
// meshcode_to_latlong_SE(meshcode)
// : calculate sourthern eastern geographic position of the grid (latitude, longitude) from meshcode
// meshcode_to_latlong_grid(meshcode)
// : calculate northern western and sourthern eastern geographic positions of the grid (latitude0, longitude0, latitude1, longitude1) from meshcode
// cal_meshcode(latitude,longitude)
//
// 2.
//
// : calculate a basic (1km) grid square code (10 digits) from a geographical position (latitude, longitude)
// cal_meshcode1(latitude,longitude)
// : calculate an 80km grid square code (6 digits) from a geographical position (latitude, longitude)
// cal_meshcode2(latitude,longitude)
// : calculate a 10km grid square code (8 digits) from a geographical position (latitude, longitude)
// cal_meshcode3(latitude,longitude)
// : calculate a 1km grid square code (10 digits) from a geographical position (latitude, longitude)
// cal_meshcode4(latitude,longitude)
// : calculate a 500m grid square code (11 digits) from a geographical position (latitude, longitude)
// cal_meshcode5(latitude,longitude)
// : calculate a 250m grid square code (12 digits) from a geographical position (latitude, longitude)
// cal_meshcode6(latitude,longitude)
// : calculate a 125m grid square code (13 digits) from a geographical position (latitude, longitude)
//
// Structure of the world grid square code with compatibility to JIS X0410
// A : area code (1 digit) A takes 1 to 8
// ABBBBB : 80km grid square code (40 arc-minutes for latitude, 1 arc-degree for longitude) (6 digits)
// ABBBBBCC : 10km grid square code (5 arc-minutes for latitude, 7.5 arc-minutes for longitude) (8 digits)
// ABBBBBCCDD : 1km grid square code (30 arc-seconds for latitude, 45 arc-secondes for longitude) (10 digits)
// ABBBBBCCDDE : 500m grid square code (15 arc-seconds for latitude, 22.5 arc-seconds for longitude) (11 digits)
// ABBBBBCCDDEF : 250m grid square code (7.5 arc-seconds for latitude, 11.25 arc-seconds for longitude) (12 digits)
// ABBBBBCCDDEFG : 125m grid square code (3.75 arc-seconds for latitude, 5.625 arc-seconds for longitude) (13 digits)
//
// 3.
//
// Calculate geodesic distance and size of world grid square 
//
// Vincenty(latitude1, longitude1, latitude2, longitude)
// : calculate geodesitc distance between two points (latitude1, longitude1) and (latitude2, longitude2) placed on the WGS84 Earth ellipsoid based on the Vincenty's formulae (1975)
// cal_area_from_meshcode(meshcode)
// : calculate size (northern west-to-east span H1, sothern west-to-east span H2, north-to-south span W, and area approximated by trapezoide A) of world grid square indicated by meshcode
// cal_area_from_latlong(latlong)
// : calculate size (northern west-to-east span H1, sothern west-to-east span H2, north-to-south span W, and area approximated by trapezoid A) of a trapezoid on the WGS84 Earth ellipoid indicated by (latlong$lat0, latlong$long0, latlong$lat1, latlong$long1)
//

function meshcode_to_latlong_grid(meshcode){
    code = meshcode + '';
    ncode = code.length;
    if (ncode >= 6) { // more than 1st grid
	code0 = parseInt(code.substr(0, 1)); // code0 : 1 to 8
	code0 = code0 - 1; // transforming code0 from 0 to 7
	code12 = code.substr(1, 3);
	if(code12.substr(0,2)=='00'){
            code12 = parseInt(code.substr(3, 1));
	}else{
            if(code12.substr(0,1)=='0'){
		code12 = parseInt(code.substr(2, 2));
            }
            else{
		code12 = parseInt(code.substr(1, 3));
            }
	}
	if(code.substr(4,1)=='0'){
            code34 = parseInt(code.substr(5, 1));
	}
	else{
            code34 = parseInt(code.substr(4, 2));
	}
	lat_width  = 2 / 3;
	long_width = 1;
    }
    else {
	return(null);
    }
    if (ncode >= 8) { // more than 2nd grid
	code5 = parseInt(code.substr(6, 1));
	code6 = parseInt(code.substr(7, 1));
	lat_width  = lat_width / 8;
	long_width = long_width / 8;
    }
    if (ncode >= 10) { // more than 3rd grid
	code7 = parseInt(code.substr(8, 1));
	code8 = parseInt(code.substr(9, 1));
	lat_width = lat_width / 10;
	long_width = long_width / 10;
    }
    
    if (ncode >= 11) { // more than 4th grid
	code9 = parseInt(code.substr(10, 1));
	lat_width = lat_width / 20;
	long_width = long_width / 20;
    }

    if (ncode >= 12) { // more than 5th grid
	code10 = parseInt(code.substr(11, 1));
	lat_width = lat_width / 40;
	long_width = long_width / 40;
    }
    
    if (ncode >= 13) { // more than 6th grid
	code11 = parseInt(code.substr(12, 1));
	lat_width = lat_width / 80;
	long_width = long_width / 80;
    }
    
    // 0'th grid
    z = code0 % 2;
    y = ((code0 - z)/2) % 2;
    x = (code0 - 2*y - z)/4;

    switch(ncode){
    case 6: // 1st grid (6 digits)
	lat0 = (code12-x+1) * 2 / 3;        
	long0 = (code34+y) + 100*z;
	lat0 = (1-2*x)*lat0;        
	long0 = (1-2*y)*long0;
	dlat = 2/3;
	dlong = 1;
	break;
    case 8: // 2nd grid (8 digits)
	lat0 = code12 * 2 / 3;
	long0 = code34 + 100*z;
	lat0 = lat0  + ((code5-x+1) * 2 / 3) / 8; 
	long0 = long0 +  (code6+y) / 8;
	lat0 = (1-2*x) * lat0;
	long0 = (1-2*y) * long0;
	dlat = 2/3/8;
	dlong = 1/8;
	break;
    case 10: // 3rd grid (10 digits)
	lat0 = code12 * 2 / 3;  
	long0 = code34 + 100*z;
	lat0 = lat0 + (code5 * 2 / 3) / 8; 
	long0 = long0 +  code6 / 8;
	lat0 = lat0 + ((code7-x+1) * 2 / 3) / 8 / 10;
	long0 = long0 + (code8+y) / 8 / 10;
	lat0 = (1-2*x)*lat0;
	long0 = (1-2*y)*long0;
	dlat = 2/3/8/10;
	dlong = 1/8/10;
	break;
    case 11: // 4th grid (11 digits)
	// code 9
	//     N
	//   3 | 4
	// W - + - E
	//   1 | 2
	//     S
	lat0 = code12 * 2 / 3;  
	long0 = code34 + 100*z;
	lat0 = lat0 + (code5 * 2 / 3) / 8; 
	long0 = long0 + code6 / 8;
	lat0 = lat0  + ((code7-x+1) * 2 / 3) / 8 / 10;
	long0 = long0 + (code8+y) / 8 / 10;
	lat0 = lat0  + (Math.floor((code9-1)/2)+x-1) * 2 / 3 / 8 / 10 / 2;
	long0 = long0 + ((code9-1)%2-y) / 8 / 10 / 2;
	lat0 = (1-2*x)*lat0;
	long0 = (1-2*y)*long0;
	dlat = 2/3/8/10/2;
	dlong = 1/8/10/2;
	break;
    case 12 : // 5th grid (12 digits)
	// code 10
	//     N
	//   3 | 4
	// W - + - E
	//   1 | 2
	//     S
	lat0 = code12 * 2 / 3;  
	long0 = code34 + 100*z;
	lat0 = lat0  + (code5 * 2 / 3) / 8; 
	long0 = long0 + code6 / 8;
	lat0 = lat0  + ((code7-x+1) * 2 / 3) / 8 / 10;
	long0 = long0 +  (code8+y) / 8 / 10;
	lat0 = lat0  + (Math.floor((code9-1)/2)+x-1) * 2 / 3 / 8 / 10 / 2;
	long0 = long0 + ((code9-1)%2-y) / 8 / 10 / 2;
	lat0 = lat0  + (Math.floor((code10-1)/2)+x-1) * 2 / 3 / 8 / 10 / 2 / 2;
	long0 = long0 + ((code10-1)%2-y) / 8 / 10 / 2 / 2;
	lat0 = (1-2*x)*lat0;
	long0 = (1-2*y)*long0;
	dlat = 2/3/8/10/2/2;
	dlong = 1/8/10/2/2;
	break;
    case 13: // 6rd grid (13 digits)	
	// code 11
	//     N
	//   3 | 4
	// W - + - E
	//   1 | 2
	//     S
	lat0 = code12 * 2 / 3;  
	long0 = code34 + 100*z;
	lat0 = lat0  + (code5 * 2 / 3) / 8; 
	long0 = long0 + code6 / 8;
	lat0 = lat0  + ((code7-x+1) * 2 / 3) / 8 / 10;
	long0 = long0 + (code8+y) / 8 / 10;
	lat0 = lat0  + (Math.floor((code9-1)/2)+x-1) * 2 / 3 / 8 / 10 / 2;
	long0 = long0 + ((code9-1)%2-y) / 8 / 10 / 2;
	lat0 = lat0  + (Math.floor((code10-1)/2)+x-1) * 2 / 3 / 8 / 10 / 2 / 2;
	long0 = long0 + ((code10-1)%2-y) / 8 / 10 / 2 / 2;
	lat0 = lat0  + (Math.floor((code11-1)/2)+x-1) * 2 / 3 / 8 / 10 / 2 / 2 / 2;
	long0 = long0 + ((code11-1)%2-y) / 8 / 10 / 2 / 2 / 2;
	lat0 = (1-2*x)*lat0;
	long0 = (1-2*y)*long0;
	dlat = 2/3/8/10/2/2/2;
	dlong = 1/8/10/2/2/2;
    }
    lat1 = myformat8(lat0-dlat);  
    long1 = myformat8(long0+dlong);
    lat0 = myformat8(lat0);  
    long0 = myformat8(long0);
    var xx = new Object();
    xx['lat0'] = parseFloat(lat0);
    xx['long0'] = parseFloat(long0);
    xx['lat1'] = parseFloat(lat1);
    xx['long1'] = parseFloat(long1);
    return(xx);
}

function myformat8(v){
   var s = v+'';
   var ss;
   if(v > 100) ss = s.substr(0,3+8);
   else if(v > 10) ss = s.substr(0,2+8);
   else ss = s.substr(0,1+8);
   return(ss);
}

function meshcode_to_latlong(meshcode){
    var res = meshcode_to_latlong_grid(meshcode);
    var xx = new Object;
    xx['lat'] = res['lat0'];
    xx['long'] = res['long0'];
    return(xx);
}

function meshcode_to_latlong_NW(meshcode){
    var res = meshcode_to_latlong_grid(meshcode);
    var xx = new Object;
    xx['lat'] = res['lat0'];
    xx['long'] = res['long0'];
    return(xx);
}

function meshcode_to_latlong_SW(meshcode){
    var res = meshcode_to_latlong_grid(meshcode);
    var xx = new Object;
    xx['lat'] = res['lat1'];
    xx['long'] = res['long0'];
    return(xx);
}

function meshcode_to_latlong_NE(meshcode){
    var res = meshcode_to_latlong_grid(meshcode);
    var xx = new Object;
    xx['lat'] = res['lat0'];
    xx['long'] = res['long1'];
    return(xx);
}

function meshcode_to_latlong_SE(meshcode){
    var res = meshcode_to_latlong_grid(meshcode);
    var xx = new Object;
    xx['lat'] = res['lat1'];
    xx['long'] = res['long1'];
    return(xx);
}

function cal_meshcode6(latitude, longitude){
    var mesh;
    if(latitude < 0){
          o = 4;
    }
    else{
          o = 0;
    }
    if(longitude < 0){
          o = o + 2;
    }
    if(Math.abs(longitude) >= 100) o = o + 1;
    z = o % 2;
    y = ((o-z)/2) % 2;
    x = (o - 2*y - z)/4;
    o = o + 1;
    latitude = (1-2*x)*latitude;
    longitude = (1-2*y)*longitude;
    p = Math.floor(latitude*60/40);
    a = (latitude*60/40-p)*40;
    q = Math.floor(a/5);
    b = (a/5-q)*5;
    r = Math.floor(b*60/30);
    c = (b*60/30-r)*30;
    s2u = Math.floor(c/15);
    d = (c/15-s2u)*15;
    s4u = Math.floor(d/7.5);
    e = (d/7.5-s4u)*7.5;
    s8u = Math.floor(e/3.75);
    u = Math.floor(longitude-100*z);
    f = longitude-100*z-u;
    v = Math.floor(f*60/7.5);
    g = (f*60/7.5-v)*7.5;
    w = Math.floor(g*60/45);
    h = (g*60/45-w)*45;
    s2l = Math.floor(h/22.5);
    i = (h/22.5-s2l)*22.5;
    s4l = Math.floor(i/11.25);
    j = (i/11.25-s4l)*11.25;
    s8l = Math.floor(j/5.625);
    s2 = s2u*2+s2l+1;
    s4 = s4u*2+s4l+1;
    s8 = s8u*2+s8l+1;
    if(u < 10){
       if(p < 10){
           mesh = String(o)+'00'+String(p)+'0'+String(u)+String(q)+String(v)+String(r)+String(w)+String(s2)+String(s4)+String(s8);
       }else{
           if(p < 100){
               mesh = String(o)+'0'+String(p)+'0'+String(u)+String(q)+String(v)+String(r)+String(w)+String(s2)+String(s4)+String(s8);
           }
           else{
               mesh = String(o)+String(p)+'0'+String(u)+String(q)+String(v)+String(r)+String(w)+String(s2)+String(s4)+String(s8);
           }
       }
    }else{
       if(p < 10){
            mesh = String(o)+'00'+String(p)+String(u)+String(q)+String(v)+String(r)+String(w)+String(s2)+String(s4)+String(s8);
       }else{
           if(p < 100){
                mesh = String(o)+'0'+String(p)+String(u)+String(q)+String(v)+String(r)+String(w)+String(s2)+String(s4)+String(s8);
           }else{
                mesh = String(o)+String(p)+String(u)+String(q)+String(v)+String(r)+String(w)+String(s2)+String(s4)+String(s8);
           }
       }
    }
    return(mesh);
}
// 

function cal_meshcode(latitude,longitude){
    return(cal_meshcode3(latitude,longitude));
}

function cal_meshcode1(latitude,longitude){
    mesh = cal_meshcode6(latitude,longitude);
    return(mesh.substr(0,6));
}

function cal_meshcode2(latitude,longitude){
    mesh = cal_meshcode6(latitude,longitude);
    return(mesh.substr(0,8));
}

function cal_meshcode3(latitude,longitude){
    mesh = cal_meshcode6(latitude,longitude);
    return(mesh.substr(0,10));
}

function cal_meshcode4(latitude,longitude){
    mesh = cal_meshcode6(latitude,longitude);
    return(mesh.substr(0,11));
}

function cal_meshcode5(latitude,longitude){
    mesh = cal_meshcode6(latitude,longitude);
    return(mesh.substr(0,12));
}

function Vincenty(latitude1,longitude1,latitude2,longitude2){
    // WGS84
    f = 1/298.257223563;
    a = 6378137.0;
    b = 6356752.314245;
    //
    L = (longitude1 - longitude2)/180*Math.PI;
    U1 = Math.atan((1-f)*Math.tan(latitude1/180*Math.PI));
    U2 = Math.atan((1-f)*Math.tan(latitude2/180*Math.PI));
    lambda = L;
    dlambda = 10;
    while(Math.abs(dlambda) > 1e-12){
       cs = Math.cos(U2)*Math.sin(lambda);
       cscc = Math.cos(U1)*Math.sin(U2)-Math.sin(U1)*Math.cos(U2)*Math.cos(lambda);
       sinsigma = Math.sqrt(cs*cs + cscc*cscc);
       cossigma = Math.sin(U1)*Math.sin(U2)+Math.cos(U1)*Math.cos(U2)*Math.cos(lambda);
       sigma = Math.atan(sinsigma/cossigma);
       sinalpha = Math.cos(U1)*Math.cos(U2)*Math.sin(lambda)/sinsigma;
       cos2alpha = 1 - sinalpha*sinalpha;
       if(cos2alpha == 0.0){
         C = 0.0;
         lambda0 = L + f*sinalpha*sigma;
       }else{
         cos2sigmam = cossigma - 2*Math.sin(U1)*Math.sin(U2)/cos2alpha;
         C = f/16*cos2alpha*(4+f*(4-3*cos2alpha));
         lambda0 = L + (1-C)*f*sinalpha*(sigma + C*sinsigma*(cos2sigmam + C*cossigma*(-1+2*cos2sigmam*cos2sigmam)));
       }
       dlambda = lambda0 - lambda;
       lambda = lambda0;
    }
    if(C == 0.0){
      A = 1.0;
      dsigma = 0.0;
    }else{
      u2 = cos2alpha * (a*a-b*b)/(b*b);
      A = 1 + u2/16384*(4096 + u2 * (-768 + u2*(320-175*u2)));
      B = u2/1024*(256+u2*(-128+u2*(74-47*u2)));
      dsigma = B*sinsigma*(cos2sigmam + 1/4*B*(cossigma*(-1+2*cos2sigmam*cos2sigmam)-1/6*B*cos2sigmam*(-3+4*sinsigma*sinsigma)*(-3+4*cos2sigmam*cos2sigmam)));
    }
    s = b*A*(sigma-dsigma);
    return(s);
}

function cal_area_from_meshcode(meshcode){
    latlong = meshcode_to_latlong_grid(meshcode);
    return(cal_area_from_latlong(latlong));
}

function cal_area_from_latlong(latlong){
    W1 = Vincenty(latlong['lat0'],latlong['long0'],latlong['lat0'],latlong['long1']);
    W2 = Vincenty(latlong['lat1'],latlong['long0'],latlong['lat1'],latlong['long1']);
    H = Vincenty(latlong['lat0'],latlong['long0'],latlong['lat1'],latlong['long0']);
    A = (W1+W2)*H*0.5;
    var xx = new Object;
    xx['W1'] = W1;
    xx['W2'] = W2;
    xx['H'] = H;
    xx['A'] = A;
    return(xx);
}
