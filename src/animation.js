const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
let sigmoid = (x) => 1 / (1 + Math.exp(-x));
let smooth = (t) => {
	let error = sigmoid(-10 / 2);
	return clamp((sigmoid(10 * (t - 0.5)) - error) / (1 - 2 * error), 0, 1);
};

const modulate = (t, dt) => {
	let tSeconds = t / 1000;
	let modulatedDelta = 1000 * (smooth(tSeconds) - smooth((t - dt) / 1000));
	let modulatedTime = 1000 * smooth(tSeconds);
	return [modulatedTime, modulatedDelta];
};

class Animation {
	constructor(func) {
		this.func = func;
		this.elapsedTime = 0;
		this.runtime = 1000;
		this.finished = false;
		this.excessTime = null;
	}

	update(deltaTime) {
		if (this.elapsedTime + deltaTime >= this.runtime) {
			this.finish(deltaTime);
			return;
		}
		this.elapsedTime += deltaTime;
		this.func(...modulate(this.elapsedTime, deltaTime));
	}

	finish(deltaTime) {
		this.finished = true;
		let finishDeltaTime = this.runtime - this.elapsedTime;
		this.excessTime = this.elapsedTime + deltaTime - this.runtime;
		this.elapsedTime = this.runtime;
		this.func(...modulate(this.runtime, finishDeltaTime));
	}
}

const Shift = (object, direction) => {
	return new Animation((elapsedTime, deltaTime) => {
		object.position.add(direction.clone().multiplyScalar(deltaTime / 1000));
	});
};

export { Animation, Shift };
