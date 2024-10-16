import * as THREE from 'three';
import { clamp, getBoundingBoxCenter } from './utils';

const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const smooth = (t) => {
	const error = sigmoid(-10 / 2);
	return clamp((sigmoid(10 * (t - 0.5)) - error) / (1 - 2 * error), 0, 1);
};

const modulate = (t, dt): [number, number] => {
	const tSeconds = t;
	const modulatedDelta = smooth(tSeconds) - smooth(t - dt);
	const modulatedTime = smooth(tSeconds);
	return [modulatedTime, modulatedDelta];
};

interface IAnimation {
	constructor(func: (elapsedTime: number, deltaTime: number) => void, config?: any): Animation;
}

interface INoConfigAnimation {
	constructor(func: (elapsedTime: number, deltaTime: number) => void, config?: any): Animation;
}

class Animation {
	public scene;
	public startTime: number;
	public endTime: number;
	public prevUpdateTime: number;
	public beforeFunc: () => void;
	public afterFunc: () => void;
	public parent;
	public object;
	public before;
	public after;
	public family;
	public reveal;
	public hide;
	public scale = 1;
	public runTime = 1;
	public finished = false;
	public elapsedSinceStart = 0;

	// family: whether or not the animation will affect the entire family
	// add: whether or not affected shapes will be added to their parents
	constructor(
		public func: (elapsedTime: number, deltaTime: number) => void,
		{
			object = undefined,
			parent = undefined,
			before = undefined,
			after = undefined,
			family = undefined,
			reveal = undefined,
			hide = undefined,
		} = {},
	) {
		this.object = object;
		this.parent = parent;
		this.before = before;
		this.after = after;
		this.family = family;
		this.reveal = reveal;
		this.hide = hide;
	}

	setUp() {
		if (this?.object?.parentComponent) {
			this.object.revealAncestors({ includeSelf: true });
		}
	}

	tearDown() {
		if (this.hide && this?.object?.parentComponent) {
			this.object.hide();
		}
	}

	update(worldTime) {
		if (worldTime <= this.startTime || this.finished) {
			return;
		}

		let deltaTime;
		if (this.prevUpdateTime === undefined) {
			if (this.object instanceof Function) {
				this.object = this.object();
			}
			if (this.object !== undefined && this.object.parent === null) {
				const parent = this.parent;
				!parent.children.includes(this.object) && parent.add(this.object);
			}
			this.beforeFunc && this.beforeFunc();
			this.setUp();
			deltaTime = worldTime - this.startTime;
		} else if (worldTime > this.endTime) {
			deltaTime = this.endTime - this.prevUpdateTime;
		} else {
			deltaTime = worldTime - this.prevUpdateTime;
		}
		this.prevUpdateTime = worldTime;
		this.elapsedSinceStart += deltaTime;

		this.func(...modulate(this.elapsedSinceStart, deltaTime));

		if (worldTime >= this.endTime) {
			this.finished = true;
			this.tearDown();
			this.afterFunc && this.afterFunc();
		}
	}

	addBefore(before) {
		if (this.beforeFunc) {
			const oldBeforeFunc = this.beforeFunc;
			this.beforeFunc = () => {
				before();
				oldBeforeFunc();
			};
		} else {
			this.beforeFunc = before;
		}
	}

	addAfter(after) {
		if (this.afterFunc) {
			const oldAfterFunc = this.afterFunc;
			this.afterFunc = () => {
				oldAfterFunc();
				after();
			};
		} else {
			this.afterFunc = after;
		}
	}
}

class Shift extends Animation {
	constructor(object, offset, config?) {
		super(
			(_elapsedTime, deltaTime) => {
				object.position.add(offset.clone().multiplyScalar(deltaTime));
			},
			{
				object,
				reveal: true,
				...config,
			},
		);
	}
}

class MoveTo extends Animation {
	public start;
	public displacement;

	constructor(
		public target: THREE.Object3D,
		public obj: THREE.Object3D,
		config?,
	) {
		super(
			(elapsedTime) => {
				obj.position.copy(this.start).addScaledVector(this.displacement, elapsedTime);
			},
			{ obj, reveal: true, ...config },
		);
	}

	setUp() {
		super.setUp();
		this.start = this.obj.position.clone();

		const final = new THREE.Vector3();
		const initial = new THREE.Vector3();
		this.obj.parent.worldToLocal(getBoundingBoxCenter(this.target, final));
		this.obj.parent.worldToLocal(getBoundingBoxCenter(this.obj, initial));
		this.displacement = new THREE.Vector3().subVectors(final, initial);
	}
}

class Rotate extends Animation {
	constructor(object, angle, config?) {
		super(
			(_elapsedTime, deltaTime) => {
				object.rotation.z += angle * deltaTime;
			},
			{ object, reveal: true, ...config },
		);
	}
}

class SetScale extends Animation {
	initialScale: number;

	constructor(object, factor, config?) {
		super(
			(elapsedTime, deltaTime) => {
				const scale = THREE.MathUtils.lerp(this.initialScale, factor, elapsedTime);
				object.scale.set(scale, scale, scale);
			},
			{ object, reveal: true, ...config },
		);
	}

	setUp() {
		super.setUp();
		this.initialScale = this.object.scale.x;
	}
}

class Draw extends Animation {
	constructor(object, config?) {
		super(
			(elapsedTime) => {
				this.object.traverse((child) => {
					if (child.stroke) {
						child.stroke.material.uniforms.drawRange.value.y = elapsedTime;
					}
				});
			},
			{ object, reveal: true, ...config },
		);
	}
}

class Erase extends Animation {
	constructor(
		public object,
		public config?,
	) {
		super(
			(elapsedTime) => {
				object.stroke.material.uniforms.drawRange.value.y = 1 - elapsedTime;
			},
			{ object, hide: true, ...config },
		);
	}

	tearDown() {
		if (this.config?.remove) {
			this.object.parent.remove(this.object);
		}
		if (this.config?.restore) {
			this.object.stroke.material.uniforms.drawRange.value.y = 1;
		}
		super.tearDown();
	}
}

class FadeIn extends Animation {
	public initialOpacity = new Map();

	constructor(object, config?) {
		let family = true;
		if (config && config.family === false) {
			family = false;
		}

		super(
			(elapsedTime, _deltaTime) => {
				if (family) {
					this.object.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							child.material.opacity = THREE.MathUtils.lerp(
								0,
								config?.preserveOpacity ? this.initialOpacity.get(child) : 1,
								elapsedTime,
							);
						}
					});
				} else {
					[this.object.stroke, this.object.fill].forEach((mesh) => {
						if (!mesh) return;
						mesh.material.opacity = THREE.MathUtils.lerp(
							0,
							config?.preserveOpacity ? this.initialOpacity.get(mesh) : 1,
							elapsedTime,
						);
					});
				}
			},
			{ object, reveal: true, ...config },
		);
	}

	setUp() {
		super.setUp();
		this.object.traverse((child: THREE.Object3D) => {
			if (child instanceof THREE.Mesh) {
				this.initialOpacity.set(child, child.material.opacity);
			}
		});
	}
}

class FadeOut extends Animation {
	initialOpacity = new Map();

	constructor(
		objectOrFunc,
		public config?,
	) {
		let family = true;
		if (config && config.family === false) {
			family = false;
		}

		super(
			(elapsedTime, _deltaTime) => {
				if (family) {
					this.object.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							if (!this.initialOpacity.has(child)) {
								console.error('Unknown child');
							}
							child.material.opacity = THREE.MathUtils.lerp(
								this.initialOpacity.get(child),
								0,
								elapsedTime,
							);
						}
					});
				} else {
					[this.object.stroke, this.object.fill].forEach((mesh) => {
						if (!mesh) return;
						mesh.material.opacity = THREE.MathUtils.lerp(
							this.initialOpacity.get(mesh),
							0,
							elapsedTime,
						);
					});
				}
			},
			{ object: objectOrFunc, hide: true, ...config },
		);
	}

	setUp() {
		super.setUp();
		this.object.traverse((child: THREE.Object3D) => {
			if (child instanceof THREE.Mesh) {
				this.initialOpacity.set(child, child.material.opacity);
			}
		});
	}

	tearDown() {
		if (this.config?.remove) {
			this.object.parent.remove(this.object);
		}
		if (this.config?.restore) {
			this.object.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					if (!this.initialOpacity.has(child)) {
						console.error('Unknown child');
					}
					child.material.opacity = this.initialOpacity.get(child);
				}
			});
		}
		super.tearDown();
	}
}

class SetOpacity extends Animation {
	initialOpacity = new Map();

	constructor(
		objectOrFunc,
		public targetOpacity,
		public config?,
	) {
		let family = true;
		if (config && config.family === false) {
			family = false;
		}

		super(
			(elapsedTime, _deltaTime) => {
				if (family) {
					this.object.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							if (!this.initialOpacity.has(child)) {
								console.error('Unknown child');
							}
							child.material.opacity = THREE.MathUtils.lerp(
								this.initialOpacity.get(child),
								this.targetOpacity,
								elapsedTime,
							);
						}
					});
				} else {
					[this.object.stroke, this.object.fill].forEach((mesh) => {
						if (!mesh) return;
						mesh.material.opacity = THREE.MathUtils.lerp(
							this.initialOpacity.get(mesh),
							this.targetOpacity,
							elapsedTime,
						);
					});
				}
			},
			{ object: objectOrFunc, ...config },
		);
	}

	setUp() {
		super.setUp();
		this.object.traverse((child: THREE.Object3D) => {
			if (child instanceof THREE.Mesh) {
				this.initialOpacity.set(child, child.material.opacity);
			}
		});
	}
}

class Wait extends Animation {
	constructor(config?) {
		super(() => {}, config);
	}
}

export {
	Animation,
	Shift,
	MoveTo,
	Rotate,
	SetScale,
	Draw,
	Erase,
	FadeIn,
	FadeOut,
	SetOpacity,
	Wait,
};
