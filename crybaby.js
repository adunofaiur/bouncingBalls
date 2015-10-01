var renderer, cube, sphere, scene, camere, points, colors = [], pMaterial, pGeo;

var timeStep = 10;
var isplaying =  false;
var FRICTION_COEFFICIENT = .1;
var AIR_RESISTANCE = .1;
var pSize = [];
var pOpacity = [];
pointsIndex = 0;
var MAX_PARTS = 4000;
var tempForceHolder = [];

var particleList = [];
var pointList;
var pli = 0;
var simState;
//units: 1 px = 1m


function collideableWalls(){
	/*var p1 = $P($V([10, 0, 0]), $V([-1, 0, 0]));

	var p2 = Plane.create($V([10, 0, 0]), $V([1, 0, 0]));

	var p3 = Plane.create($V([0, 10, 0]), $V([0, -1, 0]));*/

	var p4 = Plane.create($V([0, 0, 0]), $V([1, 1, 0]).toUnitVector());
	p4.verts = [$V([-5, -5, -5]), $V([5, -5, -5]), $V([5,5 ,5]), $V([-5, 5, 5])];



	var p1 = Plane.create($V([10, -10, 0]), $V([0, 1, 0]).toUnitVector());
	p1.verts = [$V([5, -10, -5]), $V([15, -10, -5]), $V([15, -10,5]), $V([5, -10, 5])];


/*
	var p5 = Plane.create($V([0, 0, 10]), $V([0, 0, -1]));

	var p6 = Plane.create($V([0, 0, 10]), $V([0, 0, 1]));*/
	var vals =  [p1, p4];
	for (v in vals){
		vals[v].col_type = 'plane';
	}
	return vals;

}

var GLOBAL_COLLIDABLES = collideableWalls();


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

//Variables used to define the rules of the simulation


//

function makeScene(){
	var width = 700;
	var height = 700;
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(width, height);
	 $('.renderingHolder').append(renderer.domElement);
	scene = new THREE.Scene;
	
	var cubeGeometry = new THREE.CubeGeometry(20, 20, 20);
	var cubeMaterials =[ new THREE.MeshLambertMaterial({ transparent: true ,color: 0x00ffff, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xFFCCFF, opacity: .0}),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xCCFFCC, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xFFCCCC, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xCCFFCC, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xFF99CC, opacity: .0 })

	];
	
	var cube = new THREE.Mesh(cubeGeometry, new THREE.MeshFaceMaterial(cubeMaterials));
	var egh = new THREE.EdgesHelper( cube, 0x00ffff );
	egh.material.linewidth = 2;
//	scene.add( egh );
	var geometry = new THREE.SphereGeometry( 2, 32, 32 ); var material = new THREE.MeshBasicMaterial( {color: 0xFF00FF} ); var sphere = new THREE.Mesh( geometry, material ); scene.add( sphere );	
	sphere.position.y = 15;
	sphere.position.x = -15;
	//scene.add(cube);	

	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	camera.position.y = 20;
	camera.position.x = 20;

	camera.position.z = 50;
	scene.add(camera);


	var geometry = new THREE.PlaneGeometry( 14.14, 14.14, 10 );
	var material = new THREE.MeshBasicMaterial( {color: 0xccffff, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
	plane.position.y = 0;
		plane.position.x = 0;

	plane.rotateX(Math.PI/2);
	plane.rotateY(-Math.PI/4);


	var plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
	plane.position.y = -10;
		plane.position.x = 10;

	plane.rotateX(Math.PI/2);
	//plane.rotateY(-Math.PI/4);


 	pGeo = new THREE.Geometry();
    var sprite = THREE.ImageUtils.generateDataTexture(16, 16, 0x00FF00);
	for ( i = 0; i < MAX_PARTS; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = 0;
		vertex.y = 0;
		vertex.z = 0;

		pGeo.vertices.push( vertex );

		colors[ i ] = new THREE.Color( 0x00ff00 );

	}
	pGeo.colors = colors;
	pMaterial = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors, alphaTest: 0.5, transparent: true } );

	points = new THREE.Points( pGeo, pMaterial );
	points.position.x = 0;
	points.position.y = 0;
	points.position.z = 0;
	scene.add( points );



	camera.lookAt(cube.position);
	var  controls = new THREE.OrbitControls(camera, renderer.domElement)
	var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
	var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x00BBFF, side: THREE.BackSide });
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



function resetSim(aState){
	//var simulationProperties = getSimProperities();
	//timeStep = simulationProperties.ts;
	var newState = aState;
	newState.t = 0;

	for (var i = 0; i < particleList.length; i++){
			var p = particleList[i];
			
			var rend = points.geometry.vertices[p.rendering];
			points.geometry.colors[p.rendering] = new THREE.Color(0x00FF00);

			rend.x = -10000;
			rend.y = 0;
			rend.z = 0;

/*
			if(p.p.e(2) < -10){
				points.geometry.colors[p.rendering] = new THREE.Color(0xFF0000);
			}
			if(p.p.e(2) < -5){
				points.geometry.colors[p.rendering] = new THREE.Color(0xFF0000);
			}*/

	}
	particleList = [];
	points.geometry.verticesNeedUpdate = true;
	points.geometry.colorsNeedUpdate = true;

	var gb = new GravityPoint($V([-15, 15, 0]), -5000, 2);
	var gravity = new VectorForce($V([0, -9.8, 0]));

	newState.forces = [gravity, gb];


	return newState;

}

function basicProps(){
	//for now just global stuff and ball one

	//ball one
	/*var initVX = parseFloat($('#initx').val());
	var initVY = parseFloat($('#inity').val());
	var initVZ = parseFloat($('#initz').val());
	var velocity = $V([initVX, initVY, initVZ]);

	var initPX = parseFloat($('#initxx').val());
	var initPY = parseFloat($('#inityy').val());
	var initPZ = parseFloat($('#initzz').val());
	var position = $V([initPX, initPY, initPZ]);

	var ts = parseFloat($('#ts').val());
	var me = parseFloat($('#me').val());
	var mf = parseFloat($('#mf').val());
	var gv = parseFloat($('#gv').val());
	var ar = parseFloat($('#ar').val());
	var mass = parseFloat($('#mass').val());*/

	return {
		gv: -9.8,

	};

}

	var gb2; 
function particleSim(props){
	var gravity = new VectorForce($V([0, props.gv, 0]));
	var forces = [gravity];
	var gb = new GravityPoint($V([-15, 15, 0]), -5000, 2);
	gb2 = new GravityPoint($V([-15, 15, 0]), 10, -1);

	forces.push(gb);


	var generators = [];
	/*var pg = new ConstantPosition($V([5, 0, 0]));
	var dg = new DirectionGenGeyser($V([1, 1, 0]), .3);
	var sg = new SpeedGenN(5, 2);
	var grav = new ParticleGenerator(0, 5, 400, pg, dg, sg, function(){}, {mass: 2, elasticity: .6, life: 3, lcol: 0x00FF00});
	var pg2 = new ConstantPosition($V([-5, 0, 0]));
	var dg2 = new DirectionGenGeyser($V([-1, 1, 0]), .3);
	var sg2 = new SpeedGenN(5, 2);
	var ngrav = new ParticleGenerator(0, 5, 400, pg2, dg2, sg2, function(){}, {mass: 2, elasticity: .6, life: 3, lcol: 0xFF00FF});
*/
	var pg = new ConstantPosition($V([12, 0, 0]));
	var dg = new DirectionGenGeyser($V([-1, .5, 0]), .2);
	var sg = new SpeedGenN(20, 2);
	var squirt = new ParticleGenerator(0, 5, 400, pg, dg, sg, function(that, time){
		simState.forces = [gravity, gb2]

	}, {mass: 2, elasticity: .6, life: 6, lcol: 0xffa500});
	

	var pg = new ConstantPosition($V([10, 0, 0]));
	var dg = new DirectionGenSphere();
	var sg = new SpeedGenN(1, 1);
	var poof = new ParticleGenerator(0, 5, 400, pg, dg, sg, function(that, time){
		//simState.forces = [gravity, gb2]


	}, {mass: 2, elasticity: .6, life: 6, lcol: 0x00FF00});
	










	/*var pg2 = new ConstantPosition($V([-10, 10, 0]));

	var omniGen2 = new ParticleGenerator(0, 1, 400, pg2, dg, sg, function(that, time){


	}, {mass: 2, elasticity: .6, life: 5, lcol: 0x938366});


	var squirtgun = new ParticleGenerator(0, 1, 400, pg2, dg, sg, function(that, time){


	}, {mass: 2, elasticity: .6, life: 5, lcol: 0x938366});*/


	var nState = new State(forces, [squirt, poof], 0);
	return nState;

}
function mainLoop(){
	makeScene();
		var clock = new THREE.Clock;
	var d = new Date();

	var preFrameTime = d.getTime();
	console.log(preFrameTime);
	var fragmentsOfTime = 0;

	var props = basicProps();
    simState = particleSim(props);
	
    timeStep = 50;
	renderer.render(scene, camera);
	for ( i = 0; i < MAX_PARTS; i ++ ) {
		points.geometry.vertices[i].x = -10000;

	}
		points.geometry.verticesNeedUpdate = true;
	renderer.render(scene, camera);



	function render() {
		
		GLOBAL_COLLIDABLE = [];
		renderer.clear();

		renderer.render(scene, camera);
		var n = new Date();
	    var frameTime = n.getTime();
	    
	    //determine how many steps to take
	    var timePassed = frameTime - preFrameTime;
	    var timeToConsider = timePassed + fragmentsOfTime;
	    var stepsGoneThrough = Math.floor(timeToConsider / timeStep);
	    fragmentsOfTime = timeToConsider % timeStep;
		preFrameTime = frameTime;
	    
	    if(stepsGoneThrough > 0){
	    	console.log(('steps: ' + stepsGoneThrough.toString()));

	    }

	    for (var i = 0; i < stepsGoneThrough; i ++){
	    	eulerStep(simState);
		}
		for (var i = 0; i < particleList.length; i++){
			var p = particleList[i];

			var rend = points.geometry.vertices[p.rendering];




			rend.x = p.p.e(1);
			rend.y = p.p.e(2);
			rend.z = p.p.e(3);
/*
			if(p.p.e(2) < -10){
				points.geometry.colors[p.rendering] = new THREE.Color(0xFF0000);
			}
			if(p.p.e(2) < -5){
				points.geometry.colors[p.rendering] = new THREE.Color(0xFF0000);
			}*/

		}
		points.geometry.verticesNeedUpdate = true;
		points.geometry.colorsNeedUpdate = true;

	 	if(simState.resting){
	 		isplaying = false;
		}

	 	if(isplaying){
	 		requestAnimationFrame(render);

	 	}
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

	
	

	if(isplaying)
		render();
}
