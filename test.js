function dist(lat1,lng1,lat2,lng2){
    var R = 6378.137;

    lat1 = lat1*Math.PI/180;
    lat2 = lat2*Math.PI/180;
    lng1 = lng1*Math.PI/180;
    lng2 = lng2*Math.PI/180;
    
    temp =  Math.acos(Math.sin(lng1)*Math.sin(lng2)+Math.cos(lng1)*Math.cos(lng2)*Math.cos(lat1-lat2))*R;
    return temp;
}
var Points = [
[139.750327, 35.646439],
[139.750531, 35.646090],
[139.750831, 35.645645],
[139.751110, 35.645201]
];


onSuccess = function(_result){
  alert(_result.getStatus());
};

onError = function(_result){
  alert(_result.getStatus() + "\n" + _result.getValue());
};

AR.Camera.startCameraView(onSuccess, onError);
(function(){
    console.log("H");
    for(var key = 0; key < Points.length; key++){
	var a = dist(Points[0][1],Points[0][0],
		     Points[key][1],Points[key][0]);
	console.log(a);
    }
    var t = dist(35.646090,139.750531,
		 35.646439,139.750327);

    
    navigator.geolocation.getCurrentPosition(
	function(position){
	    var lat = position.coords.latitude;
	    var lng = position.coords.longitude;
	    var txt = "緯度："+lat+"<br />経度："+lng;
	    console.log(lat,lng);
	    //document.getElementById("pos").innerHTML = txt;
	},function(){},{enableHighAccuracy:true});
})();

// http://192.168.1.100:9021
// http://192.168.1.100:9021/m3/index.html
/*
けいど,緯度(latitude)
139.750327 35.646439
139.750531 35.646090
139.750831 35.645645
139.751110 35.645201
*/
