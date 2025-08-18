import { Shape, type Style } from "../geometry/index.js";
import * as THREE from "three/webgpu";
import { Utils } from "../index.js";
import { getArcPoints } from "../geometry/geometryUtils.js";
import * as Geometry from "../geometry/index.js";

// TODO: This should be radius, angle, and rotation.
export type AngleAttributes = {
  point1: THREE.Vector3;
  point2: THREE.Vector3;
  point3: THREE.Vector3;
};

// TODO: Handle reflex angles.
export default class Angle extends Shape {
  public congruentTicks: THREE.Group;
  private radius: number;

  constructor(
    public point1: THREE.Vector3,
    public point2: THREE.Vector3,
    public point3: THREE.Vector3,
    config: Style & { 
      radius?: number; 
      reflex?: boolean;
      ticks?: number | boolean;
      tickLength?: number;
      tickSpacing?: number;
      tickColor?: THREE.Color;
      tickWidth?: number;
    } = {},
  ) {
    config = { 
      radius: 0.4, 
      reflex: false, 
      ticks: false, 
      tickLength: 0.35,
      tickSpacing: 0.05,
      tickColor: new THREE.Color(0x000000),
      tickWidth: 2,
      ...config 
    };
    
    const vector21 = new THREE.Vector3().subVectors(point1, point2);
    const vector23 = new THREE.Vector3().subVectors(point3, point2);

    const arcAngle = vector21.angleTo(vector23);
    let arcRotation: number;
    // TODO: Handle 180 degree angles
    if (Utils.positiveAngleTo(vector21, vector23) < Math.PI) {
      arcRotation = Utils.positiveAngleTo(Utils.RIGHT, vector21);
    } else {
      arcRotation = Utils.positiveAngleTo(Utils.RIGHT, vector23);
    }

    const points = getArcPoints(config.radius, arcAngle);
    config.fillPoints = [...points, new THREE.Vector3(0, 0, 0)];

    super(points, config);

    this.radius = config.radius;
    this.position.copy(point2);
    this.rotateZ(arcRotation);
    
    // Add congruent tick marks if requested
    this.congruentTicks = new THREE.Group();
    this.add(this.congruentTicks);
    
    if (config.ticks) {
      // Ensure we don't exceed the maximum of 2 ticks
      let numTicks = config.ticks === true ? 1 : Math.min(2, config.ticks);
      this.addCongruentTicks(numTicks, config);
    }
  }
  
  /**
   * Add congruent tick marks to the angle
   * @param count Number of tick marks (max 2)
   * @param config Configuration for the tick marks
   */
  addCongruentTicks(count: number, config: any = {}) {
    // Enforce maximum of 2 ticks
    count = Math.min(2, count);
    
    // Clear any existing ticks
    while (this.congruentTicks.children.length > 0) {
      this.congruentTicks.remove(this.congruentTicks.children[0]);
    }
    
    if (count <= 0) return;
    
    // Extract configuration values with defaults
    const tickLength = config.tickLength || 0.1;
    const spacing = config.tickSpacing || 0.05;
    const tickColor = config.tickColor || new THREE.Color(0xff0000);
    const strokeWidth = config.tickWidth || 2;
    const radius = config.radius || this.radius || 0.4;
    
    // Calculate vectors in local space (after angle rotation)
    // We need to convert the original world-space points to the angle's local space
    const center = new THREE.Vector3(0, 0, 0); // Local origin
    
    // Calculate the vectors in local space
    // We're working in the angle's local space where:
    // - The center (point2) is at the origin
    // - The angle has been rotated so that the first side is along a reference direction
    
    // Create local vectors of the angle sides
    // In local space, one side is along the x-axis and the other is at the angle value
    const localVector1 = new THREE.Vector3(1, 0, 0); // Local representation of first side
    const localAngle = new THREE.Vector3().subVectors(this.point3, this.point2)
                                         .angleTo(new THREE.Vector3().subVectors(this.point1, this.point2));
    
    const localVector2 = new THREE.Vector3(
      Math.cos(localAngle),
      Math.sin(localAngle),
      0
    );
    
    // Calculate the angle bisector directly by adding normalized vectors
    const bisector = new THREE.Vector3()
      .addVectors(localVector1, localVector2)
      .normalize();
    
    if (count === 1) {
      // For a single tick, place it at the bisector
      
      // Normalize the bisector
      const perpendicular = bisector.clone().normalize();
      
      // Position the tick mark on the arc
      const arcPoint = new THREE.Vector3().copy(bisector).multiplyScalar(radius);
      
      // Create a straight line for the tick
      const tickStart = new THREE.Vector3().copy(arcPoint)
        .add(perpendicular.clone().multiplyScalar(-tickLength/2));
      const tickEnd = new THREE.Vector3().copy(arcPoint)
        .add(perpendicular.clone().multiplyScalar(tickLength/2));
      
      // Create the tick mark as a straight line
      const tick = new Geometry.Line(tickStart, tickEnd, {
        strokeColor: tickColor,
        strokeWidth: strokeWidth
      });
      
      this.congruentTicks.add(tick);
    } 
    else if (count === 2) {
      // For two ticks, place them on either side of the bisector
      
      // Calculate the offset angle
      const offsetAngle = spacing / radius; // Convert arc distance to angle
      
      // Create left tick
      const leftVector = new THREE.Vector3().copy(bisector)
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), -offsetAngle);
      const leftPoint = new THREE.Vector3().copy(leftVector).multiplyScalar(radius);
      
      // Calculate perpendicular at this point
      const leftPerp = new THREE.Vector3(-leftVector.y, leftVector.x, 0).normalize();
      
      // Create the left tick
      const leftTickStart = new THREE.Vector3().copy(leftPoint)
        .add(leftPerp.clone().multiplyScalar(-tickLength/2));
      const leftTickEnd = new THREE.Vector3().copy(leftPoint)
        .add(leftPerp.clone().multiplyScalar(tickLength/2));
      
      const leftTick = new Geometry.Line(leftTickStart, leftTickEnd, {
        strokeColor: tickColor,
        strokeWidth: strokeWidth
      });
      
      // Create right tick
      const rightVector = new THREE.Vector3().copy(bisector)
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), offsetAngle);
      const rightPoint = new THREE.Vector3().copy(rightVector).multiplyScalar(radius);
      
      // Calculate perpendicular at this point
      const rightPerp = new THREE.Vector3(-rightVector.y, rightVector.x, 0).normalize();
      
      // Create the right tick
      const rightTickStart = new THREE.Vector3().copy(rightPoint)
        .add(rightPerp.clone().multiplyScalar(-tickLength/2));
      const rightTickEnd = new THREE.Vector3().copy(rightPoint)
        .add(rightPerp.clone().multiplyScalar(tickLength/2));
      
      const rightTick = new Geometry.Line(rightTickStart, rightTickEnd, {
        strokeColor: tickColor,
        strokeWidth: strokeWidth
      });
      
      this.congruentTicks.add(leftTick);
      this.congruentTicks.add(rightTick);
    }
  }
  
  /**
   * Show or hide the congruent tick marks
   */
  showCongruentTicks(visible: boolean) {
    this.congruentTicks.visible = visible;
  }
  
  /**
   * Set the number of congruent tick marks (max 2)
   */
  setCongruentTicks(count: number, config: any = {}) {
    // Enforce maximum of 2 ticks
    count = Math.min(2, count);
    this.addCongruentTicks(count, config);
  }

  getAttributes() {
    return {
      point1: this.point1,
      point2: this.point2,
      point3: this.point3,
    };
  }
}

/*
Example tick usage:

    const angle = new StudioDiagram.Angle(
      triangle.points[0],
      triangle.points[1],
      triangle.points[2],
      {
        ticks: true,
        tickLength: 0.5,
        tickSpacing: 0.1,
        tickColor: new THREE.Color("blue"),
        tickWidth: 4,
      }
    );
*/