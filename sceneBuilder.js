var renderer, cube, sphere, scene, camere;
var timeStep = 100;
function makeScene(){
	var width = 700;
	var height = 700;

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);
	 
	scene = new THREE.Scene;

	var cubeGeometry = new THREE.CubeGeometry(500, 500, 500);
	var cubeMaterial = new THREE.MeshBasicMaterial({ transparent: true ,color: 0x1ec876, opacity: 0 });

	cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

	var egh = new THREE.EdgesHelper( cube, 0x00ffff );
	egh.material.linewidth = 2;
	scene.add( egh );

	cube.rotation.y = Math.PI * 45 / 180;

	scene.add(cube);

	var geometry = new THREE.SphereGeometry( 50, 32, 32 );
	var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
	sphere = new THREE.Mesh( geometry, material );
	scene.add( sphere );


	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	camera.position.y = 350;
	camera.position.x = 350;

	camera.position.z = 2000;

	scene.add(camera);
	camera.lookAt(cube.position);

	var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
	var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
	var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
	 
	scene.add(skybox);
	var pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0, 300, 200);
	 
	scene.add(pointLight);
}




function mainLoop(){
	makeScene();
	var clock = new THREE.Clock;
	var d = new Date();

	var preFrameTime = d.getTime();
	console.log(preFrameTime);
	var fragmentsOfTime = 0;
	var priorState = new State(GRAVITY);
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
	    	priorState = eulerStep(priorState, sphere);
	    }


	 
	    requestAnimationFrame(render);
	}
	render();
}


