
function Particle(position, velocity, acceleration, rendering, props, time){
	this.p = position;
	this.v = velocity;
	this.a = acceleration;
	this.priorV = velocity.dup();
	this.priorA = acceleration.dup();
	this.rendering = rendering;
	this.elasticity = props.elasticity;
	this.mass = props.mass;
	this.killme = props.life + time;
	this.lcol = props.lcol;

	this.colColor = props.cocl;
}


function makeSprite(p, lcol){
	var j = pointsIndex;
	if(pointsIndex >= MAX_PARTS){
		pointsIndex = 0;
		j = 0;
	}
	pointsIndex++;
	points.geometry.vertices[j].x = p.e(1); 
		points.geometry.vertices[j].y = p.e(2); 

	points.geometry.vertices[j].z = p.e(3); 
	points.geometry.colors[j] = new THREE.Color(lcol)
	return j;


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
	this.m = mean;
	this.d = dev;
	this.guass =  gaussian(mean, dev);
}
SpeedGenN.prototype.generate = function(){
	return this.guass.ppf(Math.random());
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

function DirectionGenGeyser(initDir, dev){
	this.d = initDir.toUnitVector();
	this.guass =  gaussian(0, dev/3);
	this.dev = dev;
}
DirectionGenGeyser.prototype.generate = function(){
	var a = $V([1, 0, 0]);
	var uz = this.d;
	var ux = (a.cross(uz)).toUnitVector();
	var uy = uz.cross(ux);
	//var m = $M([ux.elements, uy.elements, uz.elements]);
	var m = $M([
		[ux.e(1), uy.e(1), uz.e(1)],
		[ux.e(2), uy.e(2), uz.e(2)],
		[ux.e(3), uy.e(3), uz.e(3)]
		]
		);
	var f = Math.sqrt(Math.abs(this.guass.ppf(Math.random())));
	var ro = f * this.dev;
	var theta = getRandomArbitrary(-Math.PI, Math.PI);
	var vPrime = $V([
		(Math.cos(theta)*Math.sin(ro)),
		(Math.sin(theta)*Math.sin(ro)),
		Math.cos(ro)
		]);
	var v = m.multiply(vPrime);
	return v;
}
function ParticleGenerator(start, end, generationRate, positionGen, directionGen, speedGen, callback, props){
	this.s = start;
	this.end = end;
	this.r = generationRate;
	this.pGen = positionGen;
	this.dGen = directionGen;
	this.sGen = speedGen;
	this.rounded = 0;
	this.callback = callback;
	this.props = props;
	this.props.cocl = 0xFF0000;
}

ParticleGenerator.prototype.generate = function(time, timestep){
	
	if(time >= this.s && time < this.end){
		this.needReset = true;
		var particleNum = Math.floor((timestep/1000) * this.r);
		this.rounded += ((timestep/1000)*this.r) - particleNum;
		if(this.rounded >= 1){
			particleNum += Math.floor(this.rounded);
			this.rounded -= Math.floor(this.rounded);
		}
		for(var i = 0; i < particleNum; i++){
			var p = this.pGen.generate(time);
			var d = this.dGen.generate(time);
			var s = this.sGen.generate(time);
			var v = d.multiply(s);
			p = offset(p, v, time);



			var rendering = makeSprite(p, this.props.lcol);
			var particle = new Particle(p, v, $V([0, 0, 0]), rendering, this.props, time);
			particleList.push(particle);
		}

	}else if(this.needReset){
		this.needReset = false;
		this.callback(this, time);
	}


}



