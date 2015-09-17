var renderer, cube, sphere, scene, camere;

var timeStep = 10;
var isplaying =  false;
var FRICTION_COEFFICIENT = .1;
var AIR_RESISTANCE = .1;


var tempForceHolder = [];



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

function Ball(position, velocity, acceleration, rendering, properties){
	this.position = position.dup();
	this.velocity = velocity.dup();
	this.acceleration = acceleration.dup();
	this.rendering = rendering;
	this.movableType = "ball"
	this.col_type = "ball";
	if(properties){
		this.elasticity = properties.elasticity;
		this.mass = properties.mass;

	}
}

Ball.prototype.dup = function(){
	var pos = this.position.dup();
	var vel = this.velocity.dup();
	var acc = this.acceleration.dup();
	var el = this.elasticity;
	var m = this.mass;

	return new Ball(pos, vel, acc, this.rendering, {elasticity: el, mass: m});
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

var GRAVITY = new VectorForce($V([0, -9.8, 0]));


function State(moveables, forces, renderings){
	this.moveables = moveables;
	this.forces = forces;
	this.oldmoveables = [];
	this.collidables = collideableWalls();
	this.renderings = renderings;
	for (var i = 0; i < moveables.length; i++){
		this.oldmoveables.push(moveables[i].dup());
		this.collidables.push(moveables);
	}
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
	var cubeMaterials =[ new THREE.MeshLambertMaterial({ transparent: true ,color: 0x99CCFF, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xFFCCFF, opacity: .0}),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xCCFFCC, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xFFCCCC, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xCCFFCC, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xFF99CC, opacity: .0 })

	];
	cube = new THREE.Mesh(cubeGeometry, new THREE.MeshFaceMaterial(cubeMaterials));
	var egh = new THREE.EdgesHelper( cube, 0x00ffff );
	egh.material.linewidth = 2;
	scene.add( egh );


	scene.add(cube);
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	camera.position.y = 20;
	camera.position.x = 20;

	camera.position.z = 50;

	scene.add(camera);
	camera.lookAt(cube.position);

	var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
	var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
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

function addSphereRendering(position){

	var geometry = new THREE.SphereGeometry( 2, 32, 32 );
	var material = new THREE.MeshLambertMaterial( {color: 0xffff00} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.position.x = position.e(1);
	sphere.position.y = position.e(2);
	sphere.position.z = position.e(3);
	scene.add( sphere );
	return sphere;
}

function resetVars(){

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

function pulsarRendering(anchor){

	var geometry = new THREE.SphereGeometry( .5, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0x4444FF} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.position.x = anchor.e(1);
	sphere.position.y = anchor.e(2);
	sphere.position.z = anchor.e(3);
	scene.add( sphere );
	return sphere;
}

function initializeSim(props, state){
	//remove all current spheres
	if(state){
		for (var i = 0; i < state.renderings.length; i++){
			scene.remove(state.renderings[i]);
		}
	}
	//initial, garunteed sphere
	var initSphere = addSphereRendering(props.position);

	var initBall = new Ball(props.position, props.velocity, $V([0, 0, 0]), initSphere, {elasticity: props.me, mass: props.mass});

	//buncha other stuff
	var gravity = new VectorForce($V([0, props.gv, 0]));
	var forces = [gravity];
	if(state){
		for (var k = 0; k < state.forces.length; k++){
		if(state.forces[k].forceType == 'columb'){
			forces.push(state.forces[k]);
		}
	}
	}
	
	var newState = new State([initBall], forces, [initBall.rendering]);
	AIR_RESISTANCE = props.ar;
	FRICTION_COEFFICIENT = props.mf

	//get ativate columbs
	var forces = $('.force');

	return newState;


}
function initHTMLStuff(){
	var inputs = $("input");
	inputs.attr('step', '.05')
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
    simState = initializeSim(props);
	

	function render() {
		var n = new Date();
	    var frameTime = n.getTime();
	    
	    //determine how many steps to take
	    var timePassed = frameTime - preFrameTime;
	    var timeToConsider = timePassed + fragmentsOfTime;
	    var stepsGoneThrough = Math.floor(timeToConsider / timeStep);
	    fragmentsOfTime = timeToConsider % timeStep;
		preFrameTime = frameTime;
	    renderer.render(scene, camera);
	    
	    if(stepsGoneThrough > 0){
	    	console.log(('steps: ' + stepsGoneThrough.toString()));

	    }

	    for (var i = 0; i < stepsGoneThrough; i ++){
	    	eulerStep(simState);

			simState.oldmoveables = [];
			simState.collidables = collideableWalls();

			for(var j = 0; j < simState.moveables.length; j++){
				var moveable = simState.moveables[j];
				simState.oldmoveables.push(moveable.dup());
				simState.collidables.push(moveable);
			}
		
		}
		for(var j = 0; j < simState.moveables.length; j++){
				var moveable = simState.moveables[j];

				moveable.rendering.position.x = moveable.position.e(1);
				moveable.rendering.position.y = moveable.position.e(2);
				moveable.rendering.position.z = moveable.position.e(3);

			}

	 	//output to table

	 	$('#tpx').text(simState.moveables[0].position.e(1).toFixed(2));
	 	$('#tpy').text(simState.moveables[0].position.e(2).toFixed(2));
	 	$('#tpz').text(simState.moveables[0].position.e(3).toFixed(2));

	 	$('#tvx').text(simState.moveables[0].velocity.e(1).toFixed(2));
	 	$('#tvy').text(simState.moveables[0].velocity.e(2).toFixed(2));
	 	$('#tvz').text(simState.moveables[0].velocity.e(3).toFixed(2));


	 	$('#tax').text(simState.moveables[0].acceleration.e(1).toFixed(2));
	 	$('#tay').text(simState.moveables[0].acceleration.e(2).toFixed(2));
	 	$('#taz').text(simState.moveables[0].acceleration.e(3).toFixed(2));

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