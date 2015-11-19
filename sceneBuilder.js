var renderer, cube, sphere, scene, camere, points, colors = [], pMaterial, pGeo;

var timeStep = 100;
var isplaying =  false;
var FRICTION_COEFFICIENT = .000001;
var AIR_RESISTANCE = .1;
var pSize = [];
var pOpacity = [];
pointsIndex = 0;
var nyeah = 0;
var MAX_PARTS = 100;
var tempForceHolder = [];
var stateTime = 0;
var particleList = [];
var pointList;
var pli = 0;
var awingFighter;
var awing;
var sphere;
var splosion;
var runge = true;
var objects = [];
var struts = [];
var vertices = [];
var faces = [];
var cube, cube2, cube3;
var edges = [];
var plane;
var torsions =[];
var sphere;
var tface;
var canonicalArray;
var myBody;
function buildDiv(className){
	var elem = document.createElement('div');
	elem.className = className;
	return elem;
}
function buildSpan(className){
	var elem = document.createElement('span');
	elem.className = className;
	return elem;
}





function VectorForce(vector){
	this.force = vector;
	this.forceType = "vector";
}

function ColumbPoint(anchor, constant, rendering){
	this.anchor = anchor;
	this.constant = constant;
	this.charge = -1;
	this.forceType = "columb";
	this.rendering = rendering;
}


function setupGeometries(){
	var width = 700;
	var height = 700;
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(width, height);
	 $('.renderingHolder').append(renderer.domElement);
	scene = new THREE.Scene;
	
	var cubeGeometry = new THREE.Geometry();
	var cubeMaterials = new THREE.MeshLambertMaterial({ transparent: true ,color: 0x00ffff, opacity: 1, wireframe: true});
	
	cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
	var egh = new THREE.EdgesHelper( cube, 0x00ffff );
	egh.material.linewidth = 2;
	//scene.add( egh );	
var material2 = new THREE.MeshLambertMaterial({color: 0x0000ff, opacity: 1, wireframe: false, wireframecolor: 0x0000ff});
var material3 = new THREE.LineBasicMaterial({ color: 0xff00ff });
var geometry2 = new THREE.BoxGeometry(20, 20, 20);
var geometry3 = new THREE.Geometry();
 cube2 = new THREE.Mesh( geometry2, material2 ); scene.add( cube2 );
 	var egh2 = new THREE.EdgesHelper( cube2, 0x00ffff );
	egh2.material.linewidth = 2;

 cube3 = new THREE.Line( geometry3, material3 ); scene.add( cube3 );
	var cubeGeometry = new THREE.Geometry();
	var cubeMaterials = new THREE.MeshLambertMaterial({ transparent: true ,color: 0x00ffff, opacity: 1, wireframe: true});
	
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	camera.position.y = 20;
	camera.position.x = 20;

	camera.position.z = 500;
	scene.add(camera);

	scene.add(cube);

var fm = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
var fg = new THREE.Geometry();
tface = new THREE.Mesh(fg, fm);
scene.add(tface);
	var geometry = new THREE.SphereGeometry( 1, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
    sphere = new THREE.Mesh( geometry, material );
//	scene.add( sphere );



	camera.lookAt(cube.position);
	var  controls = new THREE.OrbitControls(camera, renderer.domElement)
	var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
	var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.BackSide });
	var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
	 
	scene.add(skybox);
	var pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0, 0, 30);
	 
	scene.add(pointLight);

	pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(30, 0, 0);
	 
	scene.add(pointLight);

	pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0, 30, 0);
	 
	scene.add(pointLight);

	pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0, 0, 0);
	 
	scene.add(pointLight);


	pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(30, 30, 0);
	 
	scene.add(pointLight);

}
function Mesh(points, edges, struts, props, faces){
	this.vertices = points;
	this.struts = struts;
	this.edges = edges;
	this.props = props;
	this.faces = faces;
}

//
/*

0 - non-springy, gravity affects
1 - non-springy, gravity does not affect
2 - springy, no gravity
3 - springy, with gravity

*/

function Vertice(p, type, r){
	this.struts = [];
	this.p = p;
	this.v = $V([0, 0, 0]);
	this.f = $V([0, 0, 0]);
	this.mass= 7;
	this.pType = type;
	this.rendering = r;
}
Vertice.prototype.toArray = function(array, index){
	array[index] = this.p.e(1);
	array[index+1] = this.p.e(2);
	array[index+2] = this.p.e(3);
	array[index+3] = this.v.e(1);
	array[index+4] = this.v.e(2);
	array[index+5] = this.v.e(3);

	array[index+6] = this.mass;
	array[index+7] = this.pType;

}

Vertice.prototype.fromArray = function(array, index){
	this.p.elements[0] = array[index];
	this.p.elements[1] = array[index+1];
	this.p.elements[2] = array[index+2];
	this.v.elements[0] = array[index+3];
	this.v.elements[1] = array[index+4];
	this.v.elements[2] = array[index+5];


	this.mass = array[index+6];
	

}

function Face(vertices){
	this.vertices = vertices;	
}
function Strut(vertices, faces, l){
	this.vertices = vertices;
	this.faces = faces;
	this.k = 100;
	this.d = 1;
	if(!l){
		this.l = 100;
	}else{
			this.l = l;

	}


}
function Edge(start, end){
	this.start = start;
	this.end = end;
}

function Torsion(x0, x1, x2, x3, rest){
	this.x0 = x0;
	this.x1 = x1;
	this.rest = rest;
	this.k = 200;
	this.d = 100;
	this.x2 = x2;
	this.x3 = x3;
}
var edgeColMatrix;
function setupData(properties){
	

	
	var h0 = $V([0, 150, 150]);
	cube.geometry.vertices.push(new THREE.Vector3( 0,  150, 150 ));
	vertices.push(new Vertice(h0, 1, cube.geometry.vertices[0]))
	var g1 = $V([0, 150, -150]);
	cube.geometry.vertices.push(new THREE.Vector3( 0,  150, -150 ));
	vertices.push(new Vertice(g1, 1, cube.geometry.vertices[1]))
	var f4 = $V([-150, 0, -150]);
	cube.geometry.vertices.push(new THREE.Vector3( -150,  0, -150 ));
	vertices.push(new Vertice(f4, 1, cube.geometry.vertices[2]))
	var e5 = $V([-150, 0, 150]);
	cube.geometry.vertices.push(new THREE.Vector3( -150,  0, 150 ));
	vertices.push(new Vertice(e5, 1, cube.geometry.vertices[3]))
	cube.geometry.faces.push( new THREE.Face3( 0, 1, 2) );
	cube.geometry.faces.push( new THREE.Face3( 0, 2, 3) );
	edges.push(new Edge(0, 1));
	edges.push(new Edge(1, 2));
	edges.push(new Edge(2, 3));
	edges.push(new Edge(3, 0));
	var d2 = $V([150, -0, 150]);
	cube.geometry.vertices.push(new THREE.Vector3( 150,  -0, 150 ));
	vertices.push(new Vertice(d2, 1, cube.geometry.vertices[4]))
	var a7 = $V([-100, -150, 150]);
	cube.geometry.vertices.push(new THREE.Vector3( -100,  -150, 150 ));
	vertices.push(new Vertice(a7, 1, cube.geometry.vertices[5]))
	cube.geometry.faces.push( new THREE.Face3( 0, 3, 4) );
	cube.geometry.faces.push( new THREE.Face3( 3, 5, 4) );
	edges.push(new Edge(3, 5));
	edges.push(new Edge(5, 4));
	edges.push(new Edge(0, 4));
	var c3 = $V([150, -0, -150]);
	cube.geometry.vertices.push(new THREE.Vector3( 150,  -0, -150 ));
	vertices.push(new Vertice(c3, 1, cube.geometry.vertices[6]))
	edges.push(new Edge(4, 6));
	edges.push(new Edge(1, 6));
	cube.geometry.faces.push( new THREE.Face3( 0, 4, 6 ));
	cube.geometry.faces.push( new THREE.Face3( 0, 6, 1) );
	var b6 = $V([-100, -150, -150]);
	cube.geometry.vertices.push(new THREE.Vector3( -100,  -150, -150 ));
	vertices.push(new Vertice(b6, 1, cube.geometry.vertices[7]))
	edges.push(new Edge(6, 7));
	edges.push(new Edge(7, 2));
	cube.geometry.faces.push( new THREE.Face3( 6, 7, 1 ));
	cube.geometry.faces.push( new THREE.Face3( 1,7, 2) );
	edges.push(new Edge(5, 7));
	cube.geometry.faces.push( new THREE.Face3( 5, 7, 2 ));
	cube.geometry.faces.push( new THREE.Face3( 5,7, 3) );

	faces.push(new Face([0, 3, 5, 4]));
	faces.push(new Face([6, 0, 4, 7]));
	faces.push(new Face([1, 6, 7, 2]));
	faces.push(new Face([6, 4, 5, 7]));
	faces.push(new Face([3, 2, 7, 5]));
	faces.push(new Face([1, 0, 4, 6]));



//mini box

	
	var h02 = $V([15, 10, 10]);
	//cube2.geometry.vertices.push(new THREE.Vector3( 10,  10, 10 ));
	vertices.push(new Vertice(h02, 0, cube2.geometry.vertices[0]))
	var g12 = $V([15, 10, -10]);
	//cube2.geometry.vertices.push(new THREE.Vector3( 10,  10, -10 ));
	vertices.push(new Vertice(g12, 0, cube2.geometry.vertices[1]))
	var f42 = $V([-5, 10, -10]);
//	cube2.geometry.vertices.push(new THREE.Vector3( -10,  10, -10 ));
	vertices.push(new Vertice(f42, 0, cube2.geometry.vertices[2]))
	var e52 = $V([-5, 10, 10]);
//	cube2.geometry.vertices.push(new THREE.Vector3( -10,  10, 10 ));
	vertices.push(new Vertice(e52, 0, cube2.geometry.vertices[3]))
	//cube2.geometry.faces.push( new THREE.Face3( 0, 1, 2) );
	//cube2.geometry.faces.push( new THREE.Face3( 0, 2, 3) );
	edges.push(new Edge(8, 9));
	edges.push(new Edge(9, 10));
	edges.push(new Edge(10, 11));
	edges.push(new Edge(11, 8));
	var d22 = $V([15, -10, 10]);
//	cube2.geometry.vertices.push(new THREE.Vector3( 10,  -10, 10 ));
	vertices.push(new Vertice(d22, 0, cube2.geometry.vertices[4]))
	var a72 = $V([-5, -10, 10]);
//	cube2.geometry.vertices.push(new THREE.Vector3( -10,  -10, 10 ));
	vertices.push(new Vertice(a72, 0, cube2.geometry.vertices[5]))
	//cube2.geometry.faces.push( new THREE.Face3( 0, 3, 4) );
	//cube2.geometry.faces.push( new THREE.Face3( 3, 5, 4) );
	edges.push(new Edge(11, 13));
	edges.push(new Edge(13, 12));
	edges.push(new Edge(8, 12));
	var c32 = $V([15, -10, -10]);
//	cube2.geometry.vertices.push(new THREE.Vector3( 10,  -10, -10 ));
	vertices.push(new Vertice(c32, 0, cube2.geometry.vertices[6]))
	edges.push(new Edge(12, 14));
	edges.push(new Edge(9, 14));
//	cube2.geometry.faces.push( new THREE.Face3( 0, 4, 6 ));
//	cube2.geometry.faces.push( new THREE.Face3( 0, 6, 1) );
	var b62 = $V([5, -10, -10]);
//	cube2.geometry.vertices.push(new THREE.Vector3( -10,  -10, -10 ));
	vertices.push(new Vertice(b62, 0, cube2.geometry.vertices[7]))
	edges.push(new Edge(14, 15));
	edges.push(new Edge(15, 10));
	//cube2.geometry.faces.push( new THREE.Face3( 6, 7, 1 ));
	//cube2.geometry.faces.push( new THREE.Face3( 1,7, 2) );
	edges.push(new Edge(13, 15));
	//cube2.geometry.faces.push( new THREE.Face3( 5, 7, 2 ));
	//cube2.geometry.faces.push( new THREE.Face3( 5,7, 3) );
/*
	faces.push(new Face([8, 9, 10, 11]));
	faces.push(new Face([8, 9, 14, 12]));
	faces.push(new Face([13, 15, 10, 11]));
	faces.push(new Face([9, 10, 15, 14]));
	faces.push(new Face([8, 11, 13, 12]));
	faces.push(new Face([13, 15, 12, 14]));

*/
	myBody = new RigidBody([vertices[8], vertices[9], vertices[10], vertices[11], vertices[12], vertices[13], vertices[14], vertices[15]], []);







	edgeColMatrix = [];
	for(var i = 0; i < edges.length; i++){
		var c = [];

		for(var j = 0; j < edges.length; j++){
			if(i == j){
				c.push(undefined);
			}else{
				c.push(undefined)
			}
		}
		edgeColMatrix.push(c);
	}

}

function getProperties(){
	return {};
}

function makeScene(){
	
	var properties = getProperties();
	setupGeometries();
	setupData(properties);
}



function resetSim(aState){

}
var radded = false;






function RigidBody(vertices, edges){
	this.bodyType = 'cube'
	this.vertices = vertices;
	this.edges = edges;
	this.mass = 1;
}

RigidBody.prototype.centerOfMass = function(){
	//since it's a cube I cheat because I'm a fucking cheater and that's all I'll ever be you dumb piece of human garbage
	var cross1 = this.vertices[0].p.subtract(this.vertices[7].p).multiply(1/2);
	var center = this.vertices[7].p.add(cross1);
	return center;



}

RigidBody.prototype.momentOfInertia = function(){
	var constantForCubes = (this.mass/12)*(400)
	var I = $M([
		[constantForCubes, 0, 0],
		[0, constantForCubes, 0],
		[0, 0, constantForCubes]

		]);
	return I;
}
function mainLoop(){
	makeScene();
	var clock = new THREE.Clock;
	var d = new Date();

	var preFrameTime = d.getTime();
	var fragmentsOfTime = 0;
	canonicalArray = new RigidArray();
	canonicalArray.init();
	
    timeStep = 50;
	renderer.render(scene, camera);
	function render() {
		renderer.clear();

		renderer.render(scene, camera);
		var n = new Date();
	    if(isplaying){
	    	 var frameTime = n.getTime();
	    
		    //determine how many steps to take
		    
		    var timePassed = frameTime - preFrameTime;
		    var timeToConsider = timePassed + fragmentsOfTime;
		    var stepsGoneThrough = Math.floor(timeToConsider / timeStep);
		    fragmentsOfTime = timeToConsider % timeStep;
			preFrameTime = frameTime;
		    
		    //simulate timesteps
		    for (var i = 0; i < stepsGoneThrough; i ++){

				var svForced = calculateStateDynamics(canonicalArray, stateTime);
		    	var newStateArray;
		    	newStateArray = rungeKutta(canonicalArray, svForced, (timeStep/1000), stateTime, calculateStateDynamics);
		    	canonicalArray = newStateArray;
		    	nyeah = nyeah + 1;
		    	stateTime = (timeStep/1000)*nyeah; 
			

		    }
		    /*//update vertices IRL
		    for (var i = 0; i < myBody.vertices.length; i++){
		    	var vert = myBody.vertices[i];
		    	var vertVec = new THREE.Vector3(vert.p.e(1), vert.p.e(2), vert.p.e(3));
		    	vertVec.applyQuaternion(canonicalArray.orientation);
		    	vertVec.x = vertVec.x + canonicalArray.p.e(1);
		    	vertVec.y = vertVec.y + canonicalArray.p.e(2);
		    	vertVec.z = vertVec.z + canonicalArray.p.e(3);

		    	vert.rendering.x = vertVec.x; 
		    	vert.rendering.y = vertVec.y;
		    	vert.rendering.z = vertVec.z; 

		    }*/
		    cube2.position.x = canonicalArray.p.e(1);
		    cube2.position.y = canonicalArray.p.e(2);
		    cube2.position.z = canonicalArray.p.e(3);

		    var rotationM = new THREE.Matrix4()
		    
		    rotationM.makeRotationFromQuaternion(canonicalArray.orientation);

		    cube2.quaternion.setFromRotationMatrix(rotationM);
		    	cube.geometry.verticesNeedUpdate = true;
		    	cube2.geometry.verticesNeedUpdate = true;
		    	cube3.geometry.verticesNeedUpdate = true;
		    	tface.geometry.verticesNeedUpdate = true;

	    }else{
	    	preFrameTime = n.getTime();
	    }
	   

	 	requestAnimationFrame(render);

	 	
	}

	var playButton = $('#playbutton')[0];
		var pauseButton = $('#pausebutton')[0];

	playButton.addEventListener('click', function(event){
		if($(playButton).hasClass('active')){
			return;
		}
		isplaying = true;
		d = new Date();
		$(playButton).addClass('active');
		$(pauseButton).removeClass('active');

		preFrameTime = d.getTime();
		render();
	})
	var pauseButton = $('#pausebutton')[0];
	pauseButton.addEventListener('click', function(event){
		if($(pauseButton).hasClass('active')){
			return;
		}
				$(playButton).removeClass('active');

		isplaying = false;
	})
	var eu = $('#euler')[0];
	eu.addEventListener('click', function(event){
		if($(eu).hasClass('active')){
			return;
		}
		runge = false;
		$(eu).addClass('active');
		$(rk).removeClass('active');

	})

	var rk = $('#rk')[0];
	rk.addEventListener('click', function(event){
		if($(rk).hasClass('active')){
			return;
		}
		runge = true;
		$(rk).addClass('active');
		$(eu).removeClass('active');


	})
   render();
}
