
function Particle(position, velocity, acceleration, rendering){
	this.p = position;
	this.v = velocity;
	this.a = acceleration;
	this.rendering = rendering;
}

function makeSprite(p){
	var material = new THREE.SpriteMaterial({color: 0x00ff00, fog: false});
	var sprite = new THREE.Sprite(material);
	sprite.position.x = p.e(1);
	sprite.position.y = p.e(2);
	sprite.position.z = p.e(3);
	scene.add(sprite)
	return sprite;
}

function UniformDist(min, max){
	this.min = min;
	this.max = max;
}

//taken from MDNS
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function DirectionGenSphere(){

}
function SpeedGenN(mean, dev){
	this.m = m;
	this.d = dev;
	this.guass =  gaussian(mean, dev);
}
SpeedGenN.prototype.generate = function(){
	return this.distribution.ppf(Math.random());
}
DirectionGenSphere.prototype.generate = function(){
	var theta = getRandomArbitrary(-Math.PI, Math.PI);
	var height = getRandomArbitrary(-1, 1);
	var r = Math.sqrt((1-(height * height)));
	var x = r * Math.cos(theta);
	var y = height;
	var z = -r*Math.sin(theta);

	var vInit = $V([x, y, z]).toUnitVector();
	return vInit;
}

function ConstantPosition(p){
	this.p = p;
}
ConstantPosition.prototype.generate = function(){
	return this.p;
}
function offset(p, v, time){
	var u = Math.random();
	var off = v.multiply(u);
	var newP = p.add(off);
	return newP;

}
function ParticleGenerater(start, end, generationRate, positionGen, directionGen, speedGen, callback){
	this.s = start;
	this.end = end;
	this.r = generationRate;
	this.pGen = positionGen;
	this.dGen = directionGen;
	this.sGen = speedGen;
	this.callback = callback;
}

ParticleGenerator.prototype.generate = function(time, timestep){
	var particleNum = Math.floor(timestep * this.r);
	for(var i = 0; i < particleNum; i++){
		var p = this.pGen(time);
		var d = this.dGen(time);
		var s = this.speedGen(time);
		var v = d.multiply(s);
		p = offset(p, v, time);



		var rendering = makeSprite(p);
		var particle = new Particle(p, v, $V([0, 0, 0]));
		particleList.push(particle);
	}


}



