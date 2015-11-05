var renderer, cube, sphere, scene, camere, points, colors = [], pMaterial, pGeo;

var timeStep = 100;
var isplaying =  false;
var FRICTION_COEFFICIENT = .2;
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

var objects = [];
var struts = [];
var vertices = [];
var faces = [];
var cube, cube2;
var edges = [];
var plane;
var torsions =[];
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




	var cubeGeometry = new THREE.Geometry();
	var cubeMaterials = new THREE.MeshLambertMaterial({ transparent: true ,color: 0x00ffff, opacity: 1, wireframe: true});
	
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	camera.position.y = 20;
	camera.position.x = 20;

	camera.position.z = 500;
	scene.add(camera);

	scene.add(cube);
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

function Face(struts, angels, vertices){
	this.struts = struts;
	this.angles = angels;
	
}
function Strut(vertices, faces){
	this.vertices = vertices;
	this.faces = faces;
	this.k = 11.1;
	this.d = 2.8;
	this.l = 70.7;
}
function Edge(start, end){
	this.start = start;
	this.end = end;
}

function Torsion(x0, x1, x2, x3, rest){
	this.x0 = x0;
	this.x1 = x1;
	this.rest = rest;
	this.k = 1000;
	this.d = 500;
	this.x2 = x2;
	this.x3 = x3;
}

function setupData(properties){
	
	var pOut = $V([-50, 0, 0]);
	cube.geometry.vertices.push(new THREE.Vector3( -50,  0, 0 ));
	var pUp = $V([0, 0, -50]);
	cube.geometry.vertices.push(new THREE.Vector3( 0,  0, -50 ));

	var pRight = $V([50, 10, 0]);
	cube.geometry.vertices.push(new THREE.Vector3( 50,  0, 0 ));

	var PDown = $V([0, 0, 50]);
	cube.geometry.vertices.push(new THREE.Vector3( 0,  0, 50 ));

	vertices.push(new Vertice(pOut, 0, cube.geometry.vertices[0]))
	vertices.push(new Vertice(pUp, 0, cube.geometry.vertices[1]))
	vertices.push(new Vertice(pRight, 0, cube.geometry.vertices[2]))
	vertices.push(new Vertice(PDown, 0, cube.geometry.vertices[3]))
	var timec = 5;
	var dc = 2.8;
	var kc = 11.1;
	var s1 = new Strut([0, 1]);
	var s2 = new Strut([1, 2]);

	var s3 = new Strut([2, 0]);
	var s4 = new Strut([0, 3]);
	var s5 = new Strut([3, 2]);
	struts.push(s1);
		struts.push(s2);
	struts.push(s3);
	struts.push(s4);
	struts.push(s5);

	var face1 = new Face([s1, s2, s3], [Math.PI/4, Math.PI/2, Math.PI/4], [0, 1, 2]);
	var face2 = new Face([s3, s4, s5], [Math.PI/4, Math.PI/4, Math.PI/2], [0, 2, 3]);

	faces.push(face1);
	faces.push(face2);
	var t1 = new Torsion(0, 2, 1, 3, (Math.PI/4));
	torsions.push(t1);
	cube.geometry.faces.push( new THREE.Face3( 0, 1, 2) );
	cube.geometry.faces.push( new THREE.Face3( 0, 2, 3) );

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
		    	var newStateArray = rungeKutta(stateArray, sdot, (timeStep/1000), stateTime, calculateStateDynamics);


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

		    }
	    }else{
	    	preFrameTime = n.getTime();
	    }
	   

	 	requestAnimationFrame(render);

	 	
	}

	var playButton = $('#playbutton')[0];
		var pauseButton = $('#pausebutton')[0];

	playButton.addEventListener('click', function(event){
		if($(playButton).hasClass('grayed')){
			return;
		}
		isplaying = true;
		d = new Date();
		$(playButton).addClass('grayed');
		$(pauseButton).removeClass('grayed');
		$(resetButton).removeClass('grayed');

		preFrameTime = d.getTime();
		render();
	})
	var pauseButton = $('#pausebutton')[0];
	pauseButton.addEventListener('click', function(event){
		if($(pauseButton).hasClass('grayed')){
			return;
		}
		$(pauseButton).addClass('grayed');
				$(playButton).removeClass('grayed');

		isplaying = false;
	})
	var resetButton = $('#resetbutton')[0];
	resetButton.addEventListener('click', function(event){
		if($(resetButton).hasClass('grayed')){
			return;
		}
		simState = resetSim(simState);
				d = new Date();

		preFrameTime = d.getTime();
		render();

	})
   render();
}
