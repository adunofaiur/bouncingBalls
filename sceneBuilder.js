var renderer, cube, sphere, scene, camere, points, colors = [], pMaterial, pGeo;

var timeStep = 100;
var isplaying =  false;
var FRICTION_COEFFICIENT = .1;
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
var material2 = new THREE.LineBasicMaterial({ color: 0x0000ff });
var material3 = new THREE.LineBasicMaterial({ color: 0xff00ff });
var geometry2 = new THREE.Geometry();
var geometry3 = new THREE.Geometry();
 cube2 = new THREE.Line( geometry2, material2 ); scene.add( cube2 );
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
	

	
	var h0 = $V([50, 50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  50, 50 ));
	vertices.push(new Vertice(h0, 0, cube.geometry.vertices[0]))
	var g1 = $V([50, 50, -50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  50, -50 ));
	vertices.push(new Vertice(g1, 0, cube.geometry.vertices[1]))
	var f4 = $V([-50, 50, -50]);
	cube.geometry.vertices.push(new THREE.Vector3( -50,  50, -50 ));
	vertices.push(new Vertice(f4, 0, cube.geometry.vertices[2]))
	var e5 = $V([-50, 50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( -50,  50, 50 ));
	vertices.push(new Vertice(e5, 0, cube.geometry.vertices[3]))
	cube.geometry.faces.push( new THREE.Face3( 0, 1, 2) );
	cube.geometry.faces.push( new THREE.Face3( 0, 2, 3) );
	edges.push(new Edge(0, 1));
	edges.push(new Edge(1, 2));
	edges.push(new Edge(2, 3));
	edges.push(new Edge(3, 0));
	var d2 = $V([50, -50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  -50, 50 ));
	vertices.push(new Vertice(d2, 0, cube.geometry.vertices[4]))
	var a7 = $V([-50, -50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( -50,  -50, 50 ));
	vertices.push(new Vertice(a7, 0, cube.geometry.vertices[5]))
	cube.geometry.faces.push( new THREE.Face3( 0, 3, 4) );
	cube.geometry.faces.push( new THREE.Face3( 3, 5, 4) );
	edges.push(new Edge(3, 5));
	edges.push(new Edge(5, 4));
	edges.push(new Edge(0, 4));
	var c3 = $V([50, -50, -50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  -50, -50 ));
	vertices.push(new Vertice(c3, 0, cube.geometry.vertices[6]))
	edges.push(new Edge(4, 6));
	edges.push(new Edge(1, 6));
	cube.geometry.faces.push( new THREE.Face3( 0, 4, 6 ));
	cube.geometry.faces.push( new THREE.Face3( 0, 6, 1) );
	var b6 = $V([-50, -50, -50]);
	cube.geometry.vertices.push(new THREE.Vector3( -50,  -50, -50 ));
	vertices.push(new Vertice(b6, 0, cube.geometry.vertices[7]))
	edges.push(new Edge(6, 7));
	edges.push(new Edge(7, 2));
	cube.geometry.faces.push( new THREE.Face3( 6, 7, 1 ));
	cube.geometry.faces.push( new THREE.Face3( 1,7, 2) );
	edges.push(new Edge(5, 7));
	cube.geometry.faces.push( new THREE.Face3( 5, 7, 2 ));
	cube.geometry.faces.push( new THREE.Face3( 5,7, 3) );




	faces.push(new Face([0, 1, 2, 3]));
	faces.push(new Face([0, 1, 6, 4]));
	faces.push(new Face([5, 7, 2, 3]));
	faces.push(new Face([1, 2, 7, 6]));
	faces.push(new Face([0, 3, 5, 4]));
	faces.push(new Face([5, 7, 4, 6]));

	struts.push(new Strut([7, 4], 141));
	struts.push(new Strut([5, 6], 141));
	struts.push(new Strut([3, 4], 141));
	struts.push(new Strut([5, 0], 141));
	struts.push(new Strut([1, 4], 141));
	struts.push(new Strut([6, 0], 141));
	struts.push(new Strut([6, 2], 141));
	struts.push(new Strut([7, 1], 141));
	struts.push(new Strut([5, 2], 141));
	struts.push(new Strut([7, 3], 141));
	struts.push(new Strut([0, 2], 141));
	struts.push(new Strut([1, 3], 141));

	struts.push(new Strut([0, 3]));
	struts.push(new Strut([0, 1]));
	struts.push(new Strut([2, 1]));
	struts.push(new Strut([2, 3]));

	struts.push(new Strut([7, 6]));
	struts.push(new Strut([6, 4]));
	struts.push(new Strut([5, 4]));
	struts.push(new Strut([7, 5]));

	struts.push(new Strut([1, 6]));
	struts.push(new Strut([0, 4]));
	
	struts.push(new Strut([5, 3]));
	struts.push(new Strut([7, 2]));

	var p0 = $V([-201,-0, 0]);
	var p1 = $V([200, -250, 3]);

	cube2.geometry.vertices.push(new THREE.Vector3(-201, -0, 1));
	cube2.geometry.vertices.push(new THREE.Vector3(200, -250, 0));
	vertices.push(new Vertice(p0, 1, cube2.geometry.vertices[0]));
	vertices.push(new Vertice(p1, 1, cube2.geometry.vertices[1]));

	edges.push(new Edge(8, 9));
	
	




	var t1 = $V([0, 75, 0]);
	var t2 = $V([0, 125, 0]);
	var t3 = $V([50, 75, 0]);
	var t4 = $V([0, 75, 50]);
	tface.geometry.vertices.push(new THREE.Vector3(0, 75, 0));
	tface.geometry.vertices.push(new THREE.Vector3(0, 125, 0));
	tface.geometry.vertices.push(new THREE.Vector3(50, 75, 0));
	tface.geometry.vertices.push(new THREE.Vector3(0, 75, 50));
	tface.geometry.faces.push( new THREE.Face3( 0, 1, 2) );
	tface.geometry.faces.push( new THREE.Face3( 0, 1, 3) );

	vertices.push(new Vertice(t1, 1, tface.geometry.vertices[0]));
	vertices.push(new Vertice(t2, 1, tface.geometry.vertices[1]));
	vertices.push(new Vertice(t3, 1, tface.geometry.vertices[2]));
	vertices.push(new Vertice(t4, 1, tface.geometry.vertices[3]));

	struts.push(new Strut([10, 11], 50));
	struts.push(new Strut([11, 12]));
	struts.push(new Strut([11, 13]));
	struts.push(new Strut([12, 10], 50));
	struts.push(new Strut([13, 10], 50));

	torsions.push(new Torsion(10, 11, 12, 13, Math.PI/4));












/*
	var h0 = $V([50, 50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  50, 50 ));
	vertices.push(new Vertice(h0, 0, cube.geometry.vertices[0]))

	var h0 = $V([50, 50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  50, 50 ));
	vertices.push(new Vertice(h0, 0, cube.geometry.vertices[0]))


	var h0 = $V([50, 50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  50, 50 ));
	vertices.push(new Vertice(h0, 0, cube.geometry.vertices[0]))

	var h0 = $V([50, 50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  50, 50 ));
	vertices.push(new Vertice(h0, 0, cube.geometry.vertices[0]))


	var h0 = $V([50, 50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  50, 50 ));
	vertices.push(new Vertice(h0, 0, cube.geometry.vertices[0]))

	var h0 = $V([50, 50, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  50, 50 ));
	vertices.push(new Vertice(h0, 0, cube.geometry.vertices[0]))

*/

/*
	vertices.push(new Vertice(pOut, 0, cube.geometry.vertices[0]))
	vertices.push(new Vertice(pUp, 0, cube.geometry.vertices[1]))
	vertices.push(new Vertice(pRight, 0, cube.geometry.vertices[2]))
	vertices.push(new Vertice(PDown, 0, cube.geometry.vertices[3]))
	var timec = 5;
	var dc = 2.8;
	var kc = 11.1;
	var s1 = new Strut([0, 1]);
	var s2 = new Strut([1, 2]);

	var s3 = new Strut([0, 2]);
	var s4 = new Strut([0, 3]);
	var s5 = new Strut([3, 2]);
	struts.push(s1);
	struts.push(s2);
	struts.push(s3);
	struts.push(s4);
	struts.push(s5);

	var face1 = new Face([s1, s2, s3], [Math.PI/4, Math.PI/2, Math.PI/4], [0, 1, 2]);
	face1.vertices = [0, 1, 2];
	face1.pType = 1;
	var face2 = new Face([s3, s4, s5], [Math.PI/4, Math.PI/4, Math.PI/2], [0, 2, 3]);
	face2.vertices = [0, 2, 3];
	face2.pType = 1;
	faces.push(face1);
	faces.push(face2);
	var t1 = new Torsion(0, 2, 1, 3, (Math.PI/4));
	torsions.push(t1);
	cube.geometry.faces.push( new THREE.Face3( 0, 1, 2) );
	cube.geometry.faces.push( new THREE.Face3( 0, 2, 3) );
*/


//edge edge test
	/*
	var p0 = $V([-20, 5, 0]);
	var p1 = $V([20, 8, 3]);
	cube2.geometry.vertices.push(new THREE.Vector3(-20, 5, 0));
	cube2.geometry.vertices.push(new THREE.Vector3(20, 8, 3));

	var p2 = $V([0, 2, -20]);
	var p3 = $V([-3, 2, 20]);




	cube3.geometry.vertices.push(new THREE.Vector3(0, 2, -20));
	cube3.geometry.vertices.push(new THREE.Vector3(-3, 2, 20));
	vertices.push(new Vertice(p0, 0, cube2.geometry.vertices[0]));
	vertices.push(new Vertice(p1, 0, cube2.geometry.vertices[1]));
	vertices.push(new Vertice(p2, 1, cube3.geometry.vertices[0]));
	vertices.push(new Vertice(p3, 1, cube3.geometry.vertices[1]));

	edges.push(new Edge(0, 1));
	edges.push(new Edge(2, 3));
*/


//isolated spring
/*

	var p0 = $V([-20, 5, 0]);
	var p1 = $V([20, 8, 3]);
	cube2.geometry.vertices.push(new THREE.Vector3(-20, 5, 0));
	cube2.geometry.vertices.push(new THREE.Vector3(20, 8, 3));

	vertices.push(new Vertice(p0, 1, cube2.geometry.vertices[0]));
	vertices.push(new Vertice(p1, 1, cube2.geometry.vertices[1]));
	struts.push(new Strut([0, 1]));*/
	//setup the vertices of a cube at 0 0 0 that has points on the lines of 50
	
	/*for(var i = 0; i  < 8; i++){
		var x = 50;
		if(i >= 4){
			x = -50;
		}
		var y = 50;
		if(i == 2 || i == 3 || i == 6 || i == 7){
			y = -50;
		}
		var z = 50;
		if(i == 1 || i == 3 || i == 4 || i == 6){
			z = -50;
		}
		var nv = new Vertice($V([x, y, z]), $V([0, 0, 0]), 1, cube.geometry.vertices[i], 0);
		vertices.push(nv);
	}
	edges.push(new Edge(7, 2));
	edges.push(new Edge(7, 0));
	edges.push(new Edge(7, 6));
	edges.push(new Edge(7, 5));
	edges.push(new Edge(6, 3));
	edges.push(new Edge(6, 4));
	edges.push(new Edge(6, 2));
	edges.push(new Edge(6, 5));
	edges.push(new Edge(3, 2));
	edges.push(new Edge(3, 1));
	edges.push(new Edge(3, 4));
	edges.push(new Edge(2, 0));
	edges.push(new Edge(2, 1));
	edges.push(new Edge(5, 4));
	edges.push(new Edge(5, 1));
	edges.push(new Edge(5, 0));
	edges.push(new Edge(4, 1));
	edges.push(new Edge(1, 0));*/
/*
	var p1 = $V([-100, -100, 100])
	vertices.push(new Vertice(p1, $V([0, 0, 0]), 1, plane.geometry.vertices[0], 1));
	var p2 = $V([100, -100, 100])
	var p3 = $V([-100, -100, -100])
	var p4 = $V([ 100, -100, -100])
	vertices.push(new Vertice(p2, $V([0, 0, 0]), 1, plane.geometry.vertices[1], 2));
vertices.push(new Vertice(p3, $V([0, 0, 0]), 1, plane.geometry.vertices[2], 2));
	vertices.push(new Vertice(p4, $V([0, 0, 0]), 1, plane.geometry.vertices[3], 2));
	faces.push(new Face([], [], [8, 9, 11, 10]));*/



/*
	faces.push(new Face([], [], [5, 7, 2, 0]));
	faces.push(new Face([], [], [0, 2, 3, 1]));
	faces.push(new Face([], [], [1, 3, 6, 4]));
	faces.push(new Face([], [], [4, 6, 7, 5]));
	faces.push(new Face([], [], [4, 5, 0, 1]));
	faces.push(new Face([], [], [7, 6, 3, 2]));*/

	//static cube 2
	/*
	for(var i = 0; i  < 8; i++){
		var x = 50;
		if(i >= 4){
			x = -50;
		}
		var y = -150;
		if(i == 2 || i == 3 || i == 6 || i == 7){
			y = -250;
		}
		var z = 50;
		if(i == 1 || i == 3 || i == 4 || i == 6){
			z = -50;
		}
		var p = $V([x, y, z]);
		var m = $M([[.7071, -.7071, 0],[.7071, .7071, 0],[0, 0, 1]]);
		p = m.multiply(p);
		p.elements[0] = p.elements[0] -225;
				p.elements[1] = p.elements[1] -10;
				p.elements[2] = p.elements[2] + 50;
		var nv = new Vertice(p, $V([0, 0, 0]), 1, cube2.geometry.vertices[i], 1);
		vertices.push(nv);
	}
	var indexForCube2 = 8;
	edges.push(new Edge(7+indexForCube2, 2+indexForCube2));
	edges.push(new Edge(7+indexForCube2, 0+indexForCube2));
	edges.push(new Edge(7+indexForCube2, 6+indexForCube2));
	edges.push(new Edge(7+indexForCube2, 5+indexForCube2));
	edges.push(new Edge(6+indexForCube2, 3+indexForCube2));
	edges.push(new Edge(6+indexForCube2, 4+indexForCube2));
	edges.push(new Edge(6+indexForCube2, 2+indexForCube2));
	edges.push(new Edge(6+indexForCube2, 5+indexForCube2));
	edges.push(new Edge(3+indexForCube2, 2+indexForCube2));
	edges.push(new Edge(3+indexForCube2, 1+indexForCube2));
	edges.push(new Edge(3+indexForCube2, 4+indexForCube2));
	edges.push(new Edge(2+indexForCube2, 0+indexForCube2));
	edges.push(new Edge(2+indexForCube2, 1+indexForCube2));
	edges.push(new Edge(5+indexForCube2, 4+indexForCube2));
	edges.push(new Edge(5+indexForCube2, 1+indexForCube2));
	edges.push(new Edge(5+indexForCube2, 0+indexForCube2));
	edges.push(new Edge(4+indexForCube2, 1+indexForCube2));
	edges.push(new Edge(1+indexForCube2, 0+indexForCube2));

	faces.push(new Face([], [], [5+indexForCube2, 7+indexForCube2, 2+indexForCube2, 0+indexForCube2]));
	faces.push(new Face([], [], [0+indexForCube2, 2+indexForCube2, 3+indexForCube2, 1+indexForCube2]));
	faces.push(new Face([], [], [1+indexForCube2, 3+indexForCube2, 6+indexForCube2, 4+indexForCube2]));
	faces.push(new Face([], [], [4+indexForCube2, 6+indexForCube2, 7+indexForCube2, 5+indexForCube2]));
	faces.push(new Face([], [], [4+indexForCube2, 5+indexForCube2, 0+indexForCube2, 1+indexForCube2]));
	faces.push(new Face([], [], [7+indexForCube2, 6+indexForCube2, 3+indexForCube2, 2+indexForCube2]));*/
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






function mainLoop(){
	makeScene();
	var clock = new THREE.Clock;
	var d = new Date();

	var preFrameTime = d.getTime();
	console.log(preFrameTime);
	var fragmentsOfTime = 0;

	
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

		    	//dump all objects into stateArray
		    	for (var j = 0; j < vertices.length; j++){
		    		vertices[j].toArray(stateArray, (j*PROPERTIES_PER_AGENT));
		    	}
		    	var sdot = calculateStateDynamics(stateArray, stateTime);
		    	var newStateArray;
		    		newStateArray = rungeKutta(stateArray, sdot, (timeStep/1000), stateTime, calculateStateDynamics);
		    	


		    	/*calculateStateDynamics(stateTime);

		    	//like, other stuff here

		    	var newStateArray = numericallyIntegrate(timeStep);

		    	//collision detect here
	-*/
		    	stateArray = newStateArray; 

		    	//dump all objects into stateArray
		    	for(var j =0; j < vertices.length; j++){
		    		vertices[j].fromArray(stateArray, (j*PROPERTIES_PER_AGENT));

		    	}

		    	nyeah = nyeah + 1;
		    	stateTime = (timeStep/1000)*nyeah; 
			

		    }
		    //update vertices IRL
		    for (var i = 0; i < vertices.length; i++){
		    	vertices[i].rendering.x = vertices[i].p.e(1)
		    	vertices[i].rendering.y = vertices[i].p.e(2);
		    	vertices[i].rendering.z = vertices[i].p.e(3);
		    	cube.geometry.verticesNeedUpdate = true;
		    	cube2.geometry.verticesNeedUpdate = true;
		    	cube3.geometry.verticesNeedUpdate = true;
		    	tface.geometry.verticesNeedUpdate = true;

		    }
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
