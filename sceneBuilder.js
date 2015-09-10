var renderer, cube, sphere, scene, camere;

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
	var sphere = new THREE.Mesh( geometry, material );
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
	function render() {
	    renderer.render(scene, camera);



	 
	    requestAnimationFrame(render);
	}
	 
	render();
}


