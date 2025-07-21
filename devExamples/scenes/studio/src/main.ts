import { Geometry, Utils, THREE, component } from "@eulertour/studio";

export default class Example {
  solarSystemConfig = {
    sun: {
      radius: 1.25,
      fillColor: new THREE.Color("#F7C948"),
      fillOpacity: 0.75,
      strokeColor: new THREE.Color("#DE911D"),
      earth: {
        radius: 0.55,
        orbitRadius: 3.6,
        revolutionsPerSecond: 0.15,
        fillColor: new THREE.Color("#2186EB"),
        fillOpacity: 0.75,
        strokeColor: new THREE.Color("#0967D2"),
        moon: {
          radius: 0.25,
          orbitRadius: 1.3,
          revolutionsPerSecond: 0.6,
          fillColor: new THREE.Color("#7B8794"),
          fillOpacity: 0.75,
          strokeColor: new THREE.Color("#616E7C"),
        },
      },
    },
  };
  solarSystem: SolarSystem;

  constructor(
    public scene,
    public camera,
    public renderer,
  ) {
    this.solarSystem = new SolarSystem(this.solarSystemConfig);
    this.scene.add(this.solarSystem);
  }

  update(_, t) {
    this.solarSystem.update(t);
  }
}

class SolarSystem extends THREE.Group {
  @component accessor sun: Sun;
  @component accessor arrow: Geometry.Arrow;

  constructor(config) {
    super();
    this.sun = new Sun(config.sun);
    this.arrow = new Geometry.Arrow(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
    );
  }

  get earth() {
    return this.sun.earth;
  }
  get moon() {
    return this.sun.earth.moon;
  }

  update(t) {
    this.earth.update(t);
    this.moon.update(t);
    this.arrow.reshape(
      Utils.ORIGIN,
      this.moon.localToWorld(Utils.ORIGIN.clone()),
    );
  }
}

class Sun extends Geometry.Circle {
  @component accessor earth: Earth;

  constructor(config) {
    super(config.radius, {
      fillColor: config.fillColor,
      fillOpacity: config.fillOpacity,
      strokeColor: config.strokeColor,
    });

    this.earth = new Earth(config.earth);
  }
}

class Earth extends Geometry.Circle {
  @component accessor moon: Moon;
  orbitRadius: number;
  revolutionsPerSecond: number;

  constructor(config) {
    super(config.radius, {
      fillColor: config.fillColor,
      fillOpacity: config.fillOpacity,
      strokeColor: config.strokeColor,
    });

    this.revolutionsPerSecond = config.revolutionsPerSecond;
    this.orbitRadius = config.orbitRadius;
    this.moon = new Moon(config.moon);
  }

  update(t) {
    const angle = 2 * Math.PI * t * this.revolutionsPerSecond;
    this.position.set(
      this.orbitRadius * Math.cos(angle),
      this.orbitRadius * Math.sin(angle),
      0,
    );
  }
}

class Moon extends Geometry.Circle {
  orbitRadius: number;
  revolutionsPerSecond: number;

  constructor(config) {
    super(config.radius, {
      fillColor: config.fillColor,
      fillOpacity: config.fillOpacity,
      strokeColor: config.strokeColor,
    });

    this.revolutionsPerSecond = config.revolutionsPerSecond;
    this.orbitRadius = config.orbitRadius;
  }

  update(t) {
    const angle = 2 * Math.PI * t * this.revolutionsPerSecond;
    this.position.set(
      this.orbitRadius * Math.cos(angle),
      this.orbitRadius * Math.sin(angle),
      0,
    );
  }
}
