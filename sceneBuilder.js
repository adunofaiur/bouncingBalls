var renderer, cube, sphere, scene, camere;

var timeStep = 10;
var isplaying =  false;
var FRICTION_COEFFICIENT = .1;
var AIR_RESISTANCE = .1;
var spheres = [];


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

function ColumbPoint(anchor, constant){
	this.anchor = anchor;
	this.constant = constant;
	this.charge = -1;
	this.forceType = "columb";
}

var GRAVITY = new VectorForce($V([0, -9.8, 0]));


function State(moveables, forces){
	this.moveables = moveables;
	this.forces = forces;
	this.oldmoveables = [];
	this.collidables = collideableWalls();
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
	document.body.appendChild(renderer.domElement);
	 
	scene = new THREE.Scene;

	var cubeGeometry = new THREE.CubeGeometry(20, 20, 20);
	var cubeMaterials =[ new THREE.MeshBasicMaterial({ transparent: true ,color: 0x99CCFF, opacity: .5 }),
		new THREE.MeshBasicMaterial({ transparent: true ,color: 0xFFCCFF, opacity: .5 }),
		new THREE.MeshBasicMaterial({ transparent: true ,color: 0xCCFFCC, opacity: .5 }),
		new THREE.MeshBasicMaterial({ transparent: true ,color: 0xFFCCCC, opacity: .5 }),
		new THREE.MeshBasicMaterial({ transparent: true ,color: 0xCCFFCC, opacity: .5 }),
		new THREE.MeshBasicMaterial({ transparent: true ,color: 0xFF99CC, opacity: .5 })

	];
	cube = new THREE.Mesh(cubeGeometry, new THREE.MeshFaceMaterial(cubeMaterials));
	var egh = new THREE.EdgesHelper( cube, 0x00ffff );
	egh.material.linewidth = 2;
	scene.add( egh );

	cube.rotation.y = Math.PI * 45 / 180;

	scene.add(cube);
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	camera.position.y = 20;
	camera.position.x = 10;

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
}

function addSphereRendering(position){

	var geometry = new THREE.SphereGeometry( 2, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.position.x = position.e(1);
	sphere.position.y = position.e(2);
	sphere.position.z = position.e(3);
	scene.add( sphere );
	spheres.push(sphere)
}

function resetVars(){

}

function reset(){

}

function mainLoop(){
	makeScene();
	var clock = new THREE.Clock;
	var d = new Date();

	var preFrameTime = d.getTime();
	console.log(preFrameTime);
	var fragmentsOfTime = 0;

	//mine hardcoded values!!!!!!!

	addSphereRendering($V([5, 0, 0]));
	var ball = new Ball(
		$V([5, 0, 0]), $V([0, 30, 0]), $V([0, 0, 0]), spheres[0],  {
			elasticity: .8,
			mass: 1
		});
	var ball2 = new Ball(
		$V([0, 5, 0]), $V([-10, 0, 0]), $V([0, 0, 0]), spheres[1],  {
			elasticity: .8,
			mass: 1
		});



	var priorState = new State([ball], [GRAVITY]);
	

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
	    	eulerStep(priorState);

			priorState.oldmoveables = [];
			priorState.collidables = collideableWalls();

			for(var j = 0; j < priorState.moveables.length; j++){
				var moveable = priorState.moveables[j];
				priorState.oldmoveables.push(moveable.dup());
				priorState.collidables.push(moveable);
			}
		
		}
		for(var j = 0; j < priorState.moveables.length; j++){
				var moveable = priorState.moveables[j];

				moveable.rendering.position.x = moveable.position.e(1);
				moveable.rendering.position.y = moveable.position.e(2);
				moveable.rendering.position.z = moveable.position.e(3);

			}

	 	if(isplaying){
	 		requestAnimationFrame(render);

	 	}
	}

	var playButton = $('#playbutton')[0];
		var pauseButton = $('#pausebutton')[0];

	playButton.addEventListener('click', function(event){
		isplaying = true;
		d = new Date();
		$(playButton).addClass('grayed');
		$(pauseButton).removeClass('grayed');
		preFrameTime = d.getTime();
		render();
	})
	var pauseButton = $('#pausebutton')[0];
	pauseButton.addEventListener('click', function(event){
		$(pauseButton).addClass('grayed');
				$(playButton).removeClass('grayed');

		isplaying = false;
	})


	if(isplaying)
		render();
}


