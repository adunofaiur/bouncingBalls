var renderer, cube, sphere, scene, camere;
var timeStep = 1000;
var particleList = [];

 
function makeScene(){
	var width = 700;
	var height = 700;

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);
	 
	scene = new THREE.Scene;


	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

	camera.position.y = 350;
	camera.position.x = 350;

	camera.position.z = 2000;

	scene.add(camera);
	camera.lookAt(cube.position);

	var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
	var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.BackSide });
	var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
	 
	scene.add(skybox);
	var pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0, 300, 200);
	 
	scene.add(pointLight);
}



function mainLoop(){
	makeScene();
	var clock = new THREE.Clock;
	var preFrameTime = d.getTime();
	var fragmentsOfTime = 0;
	function render() {
	    var frameTime = d.getTime();
	    var timePassed = frameTime - preFrameTime;
	    //how many time steps to emulate
	    var stepsGoneThrough = (timePassed + fragmentsOfTime) % timeStep;
	    fragmentsOfTime = timePassed - (stepsGoneThrough * timeStep);
	    renderer.render(scene, camera);
	    console.log('frame');
	    if(stepsGoneThrough > 0){
	    	console.log(('steps: ' + stepsGoneThrough.toString())

	    }



	 
	    requestAnimationFrame(render);
	}
	 
	render();
}


