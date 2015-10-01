var renderer, cube, sphere, scene, camere, points, colors = [], pMaterial, pGeo;

var timeStep = 10;
var isplaying =  false;
var FRICTION_COEFFICIENT = .1;
var AIR_RESISTANCE = .1;
var pSize = [];
var pOpacity = [];
pointsIndex = 0;

var tempForceHolder = [];

var particleList = [];
var pointList;
var pli = 0;
var simState;

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

var GRAVITY = new VectorForce($V([0, -9.8, 0]));


function State(forces, generators, time){
	this.forces = forces;
	this.generators = generators;
	this.t = time;
}
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
	var geometry = new THREE.PlaneGeometry( 14.14, 14.14, 10 );
	var material = new THREE.MeshBasicMaterial( {color: 0xccffff, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
	plane.position.y = -10;
		plane.rotateX(Math.PI/2);
		plane.rotateY(-Math.PI/4);

	//scene.add(cube);	

	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	camera.position.y = 20;
	camera.position.x = 20;

	camera.position.z = 50;
	scene.add(camera);

 	pGeo = new THREE.Geometry();
    var sprite = THREE.ImageUtils.generateDataTexture(16, 16, 0x00FF00);
	for ( i = 0; i < 300; i ++ ) {

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



function resetSim(aState){
	var simulationProperties = getSimProperities();
	timeStep = simulationProperties.ts;
	var newState = initializeSim(simulationProperties, aState);



	return newState;

}

function getSimProperities(){
	//for now just global stuff and ball one

	//ball one
	var initVX = parseFloat($('#initx').val());
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
	var mass = parseFloat($('#mass').val());

	return {
		position: position,
		velocity: velocity,
		ts: ts,
		me: me,
		mf: mf,
		gv: gv,
		ar: ar,
		mass: mass

	};

}


function initHTMLStuff(){
	var inputs = $("input");
	inputs.attr('step', '.05')
}	


function particleSim(props){
	var gravity = new VectorForce($V([0, props.gv, 0]));
	var forces = [gravity];
	var generators = [];
	var pg = new ConstantPosition($V([0, 0, 0]));
	var dg = new DirectionGenSphere();
	var sg = new SpeedGenN(3, 2);
	var omniGen = new ParticleGenerator(0, 5, 50, pg, dg, sg, function(){}, {mass: 2, elasticity: .6, life: 8});
	var nState = new State(forces, [omniGen], 0);
	return nState;

}
function mainLoop(){
	makeScene();
	initHTMLStuff();
	var clock = new THREE.Clock;
	var d = new Date();

	var preFrameTime = d.getTime();
	console.log(preFrameTime);
	var fragmentsOfTime = 0;

	var props = getSimProperities();
    simState = particleSim(props);
	
    timeStep = 10;









	function render() {
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
var fid = 1;
function newColumb(event){

	var force = $(event.target).closest('.force');
	var addRm = force.find('.forceAddRemove')
	var state = addRm[0].getAttribute('state');
	if (state == 'unadded'){
		var x = parseFloat(force.find('.vectIn')[0].value)
		var y = parseFloat(force.find('.vectIn')[1].value)
		var z = parseFloat(force.find('.vectIn')[2].value)
		var k = parseFloat(force.find('.vectIn')[3].value)
		var rend = pulsarRendering($V([x, y, z]))
		var f = new ColumbPoint($V([x, y, z]), k, rend);
		f.fid = force.attr('fid');

		tempForceHolder.push(f);
		simState.forces.push(f);

		addRm[0].innerHTML = 'x';
		addRm.attr('state', 'added')
		force.addClass('added')
	}else{
		for (var i = 0; i < simState.forces.length; i++){
			
			if(simState.forces[i].fid && simState.forces[i].fid == force.attr('fid')){
				scene.remove(simState.forces[i].rendering);
				simState.forces.splice(i, 1);
			}
			
		}
		addRm[0].innerHTML = '+';
		addRm.attr('state', 'unadded')
		force.removeClass('added')
	}


}

function buildForceThing(){
	var f = buildDiv('force');

	f.innerHTML = 
	'<div class="forceControls">' + 
        '<span class="forceDetail">x <input type="number" step=".05" class="vectIn" value="0"></input></span>' +
        '<span class="forceDetail">y <input type="number" step=".05" class="vectIn" value="0"></input></span>' +
        '<span class="forceDetail">z <input type="number" step=".05" class="vectIn" value="0"></input></span>' +
        '<span class="forceDetail">k <input type="number" step=".05" class="vectIn" value="5"></input></span>' +
      '</div>' +
      '<div class="forceAddRemove" state="unadded" onclick="newColumb(event)">+</div>';
    f.setAttribute('fid', fid.toString());
    fid++;

    return f;
	/*var label = buildDiv('forceLabel');
	var f = buildDiv('force');
	var conttrols = buildDiv('forceControls');
	var d1 = buildSpan(forceDetails)*/
}

function newCForce(){
	var forces = $('.forceBox');
	var f = buildForceThing();
	forces.append(f);

}