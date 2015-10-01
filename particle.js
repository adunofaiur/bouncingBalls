
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
}


function makeSprite(p){
	var j = pointsIndex;
	if(pointsIndex > 2500){
		pointsIndex = 0;
		j = 0;
	}
	pointsIndex++;
	points.geometry.vertices[j].x = p.e(1); 
		points.geometry.vertices[j].y = p.e(2); 

	points.geometry.vertices[j].z = p.e(3); 

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
}

ParticleGenerator.prototype.generate = function(time, timestep){
	
	if(time >= this.s && time < this.end){
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



			var rendering = makeSprite(p);
			var particle = new Particle(p, v, $V([0, 0, 0]), rendering, this.props, time);
			particleList.push(particle);
		}

	}


}



