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



function makeScene(){
	var width = 700;
	var height = 700;
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(width, height);
	 $('.renderingHolder').append(renderer.domElement);
	scene = new THREE.Scene;
	
	var cubeGeometry = new THREE.CubeGeometry(20, 20, 20);
	var cubeMaterials =[ new THREE.MeshLambertMaterial({ transparent: true ,color: 0x00ffff, opacity: 1 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xFFCCFF, opacity: .0}),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xCCFFCC, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xFFCCCC, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xCCFFCC, opacity: .0 }),
		new THREE.MeshLambertMaterial({ transparent: true ,color: 0xFF99CC, opacity: .0 })

	];
	
	var cube = new THREE.Mesh(cubeGeometry, new THREE.MeshFaceMaterial(cubeMaterials));


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

	//setup a wing

	var map = THREE.ImageUtils.loadTexture('ship_owens.png');
	var material = new THREE.SpriteMaterial({map: map, color: 0xffffff, fog: true, transparent: true, size: 20});
	awing = new THREE.Sprite(material);
	awing.scale.set(10, 10, 1);
	scene.add(awing);


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
	for ( i = 0; i < MAX_PARTS; i ++ ) {
		points.geometry.vertices[i].x = -10000;

	}
	points.geometry.verticesNeedUpdate = true;
	renderer.render(scene, camera);

	initializeTieFighters();
	initializeAWing();
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

	    	//dump all objects into stateArray
	    	for(var j =0; j < fighterArray.length; j++){
	    		var ind = j* PROPERTIES_PER_AGENT;
	    		fighterArray[j].copyToStateArray(ind, stateArray);
	    	}
	    	awingFighter.copyToStateArray((fighterArray.length*PROPERTIES_PER_AGENT), stateArray);
	    	var sdot = calculateStateDynamics(stateArray, stateTime);
	    	var newStateArray = rungeKutta(stateArray, sdot, (timeStep/1000), stateTime, calculateStateDynamics);


	    	/*calculateStateDynamics(stateTime);

	    	//like, other stuff here

	    	var newStateArray = numericallyIntegrate(timeStep);

	    	//collision detect here
-*/
	    	stateArray = newStateArray; 

	    	//dump all objects into stateArray
	    	for(var j =0; j < fighterArray.length; j++){
	    		var ind = j* PROPERTIES_PER_AGENT;
	    		fighterArray[j].copyFromStateArray(ind, stateArray);
	    	}
	    	awingFighter.copyFromStateArray((fighterArray.length*PROPERTIES_PER_AGENT), stateArray);

	    	nyeah = nyeah + 1;
	    	stateTime = (timeStep/1000)*nyeah; 

		}
		if(stateTime > 13){
			scene.remove(splosion);
		}
		else if(stateTime > 12){
			if(!radded){
				scene.remove(sphere);
				var map = THREE.ImageUtils.loadTexture('e.gif');
				var material = new THREE.SpriteMaterial({map: map, color: 0xffffff, fog: true, transparent: true});
				splosion = new THREE.Sprite(material);
				splosion.scale.set(30, 30, 1);
				splosion.position.y = 100;
				scene.add(splosion);
				radded = true;
			}
			


		}
		else if(stateTime > 10){
			var flash = Math.floor(stateTime);
			var starzzz = stateTime-flash;
			if(starzzz < 0.1 || (starzzz > 0.3 && starzzz < 0.4) || (starzzz > 0.5 && starzzz < 0.6) || (starzzz > 0.7 && starzzz < 0.8) || starzzz > 0.9){
				sphere.material.color = new THREE.Color(0xFF0000);

			}else{
				sphere.material.color = new THREE.Color(0xFFFFFF);
			}

		}else if(stateTime > 6){
			var flash = Math.floor(stateTime);
			var starzzz = stateTime-flash;
			if(starzzz < .1){
				sphere.material.color = new THREE.Color(0xFF0000);

			}else{
				sphere.material.color = new THREE.Color(0xFFFFFF);
			}

		}
		for (var i = 0; i < (NUMBER_OF_AGENTS-1); i++){
			var p = fighterArray[i];
			var rend = points.geometry.vertices[p.rendering];
			rend.x = p.p.e(1);
			rend.y = p.p.e(2);
			rend.z = p.p.e(3);


		}
		awing.position.x = awingFighter.p.e(1);
		awing.position.y = awingFighter.p.e(2);
		awing.position.z = awingFighter.p.e(3);

		points.geometry.verticesNeedUpdate = true;
		points.geometry.colorsNeedUpdate = true;

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

}
