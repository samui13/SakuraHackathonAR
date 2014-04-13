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
    onSuccess = function(_result){
	alert(_result.getStatus());
    };
    
    onError = function(_result){
	alert(_result.getStatus() + "\n" + _result.getValue());
    };
    
    var superimposedGraphic = new AR.Renderer.SuperimposedGraphic();
    var squareModelGraphic = new AR.Renderer.SquareModelGraphic();
    
    var scale = new AR.Renderer.Point();
    scale.setX(1.0);
    scale.setY(1.0);
    scale.setZ(1.0);
    squareModelGraphic.setScale(scale);
    
    var texture = new AR.Renderer.TextTexture();
    texture.setColor(4289720046);
    texture.setText("テキスト");
    squareModelGraphic.setTexture(texture);
    
    superimposedGraphic.setGraphic(squareModelGraphic);
    superimposedGraphic.setProjectionType(AR.Renderer.SuperimposedGraphic.ProjectionType.ORTHO2D);
    
    var rotation = new AR.Renderer.Point();
    rotation.setX(0.0);
    rotation.setY(0.0);
    rotation.setZ(0.0);
    superimposedGraphic.setRotation(rotation);
    
    var translation = new AR.Renderer.Point();
    translation.setX(1.0);
    translation.setY(1.0);
    translation.setZ(0.0);
    superimposedGraphic.setTranslation(translation);
    
    var coordinateSystem = new AR.Renderer.FJARMarkerCoordinateSystem();
    coordinateSystem.setValue(1);
    
    AR.Renderer.put(coordinateSystem, [superimposedGraphic], onSuccess, onError);
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
