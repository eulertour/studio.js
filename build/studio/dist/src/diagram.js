import * as THREE from "three/webgpu";
import { Animation } from "./animation/index.js";
import * as Geometry from "./geometry/index.js";
import * as Utils from "./utils.js";
import * as Text from "./text.js";
import Angle from "./angle.js";
import { Shape } from "./geometry/index.js";
class Indicator extends THREE.Group {
    constructor(start, end, config = {}) {
        const { tickLength = 0.4 } = config;
        super();
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: start
        });
        Object.defineProperty(this, "end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: end
        });
        Object.defineProperty(this, "startTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "endTick", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.stem = Geometry.Line.centeredLine(start, end, config);
        const tickVector = new THREE.Vector3()
            .subVectors(end, start)
            .normalize()
            .applyAxisAngle(Utils.OUT, Math.PI / 2)
            .multiplyScalar(tickLength / 2);
        const negativeTickVector = tickVector.clone().multiplyScalar(-1);
        this.startTick = Geometry.Line.centeredLine(new THREE.Vector3().addVectors(start, tickVector), new THREE.Vector3().addVectors(start, negativeTickVector), config);
        this.endTick = Geometry.Line.centeredLine(new THREE.Vector3().addVectors(end, tickVector), new THREE.Vector3().addVectors(end, negativeTickVector), config);
        const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
        for (const mesh of [this.stem, this.startTick, this.endTick]) {
            mesh.position.sub(center);
            this.add(mesh);
        }
        this.position.copy(center);
    }
    grow(config) {
        const vec = new THREE.Vector3().subVectors(this.end, this.start);
        this.startTick.position.set(0, 0, 0);
        this.endTick.position.set(0, 0, 0);
        this.stem.stroke.material.uniforms.drawRange.value.set(0.5, 0.5);
        return new Animation((elapsedTime) => {
            const halfTime = elapsedTime / 2;
            this.stem.stroke.material.uniforms.drawRange.value.set(0.5 - halfTime, 0.5 + halfTime);
            this.startTick.position.set(0, 0, 0).addScaledVector(vec, halfTime);
            this.endTick.position.set(0, 0, 0).addScaledVector(vec, -halfTime);
        }, { object: this, ...config });
    }
}
class CongruentLine extends THREE.Group {
    constructor(ticks, start, end, config = {}) {
        config = Object.assign({ tickLength: 0.25, spacing: 0.15 }, config);
        super();
        const left = -(config.spacing * (ticks - 1)) / 2;
        for (let i = 0; i < ticks; i++) {
            const pos = left + config.spacing * i;
            const tick = new Geometry.Line(new THREE.Vector3(pos, -config.tickLength / 2, 0), new THREE.Vector3(pos, config.tickLength / 2, 0), config);
            this.add(tick);
        }
        this.moveToSegment(start, end);
    }
    moveToSegment(start, end) {
        const center = new THREE.Vector3().addVectors(start, end).divideScalar(2);
        this.position.copy(center);
        const segmentVector = new THREE.Vector3().subVectors(end, start);
        this.rotation.z = Math.atan2(segmentVector.y, segmentVector.x);
    }
}
class CongruentAngle extends Shape {
    constructor(arcs, point1, point2, point3, config = {}) {
        config = {
            minRadius: 0.4,
            spacing: 0.15,
            ...config,
        };
        super();
        Object.defineProperty(this, "arcs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: arcs
        });
        Object.defineProperty(this, "point1", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point1
        });
        Object.defineProperty(this, "point2", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point2
        });
        Object.defineProperty(this, "point3", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: point3
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        this.intrinsicChildren = new THREE.Group();
        for (let i = 0; i < arcs; i++) {
            const arc = new Angle(point1, point2, point3, {
                radius: config.minRadius + i * config.spacing,
                ...config,
            });
            this.intrinsicChildren.add(arc);
        }
        this.add(this.intrinsicChildren);
    }
    getAttributes() {
        return {
            arcs: this.arcs,
            point1: this.point1,
            point2: this.point2,
            point3: this.point3,
        };
    }
}
class RightAngle extends Geometry.Polyline {
    constructor(point1, point2, point3, config = {}) {
        config = { sideLength: 0.35, ...config };
        const vector21 = new THREE.Vector3()
            .subVectors(point1, point2)
            .setLength(config.sideLength);
        const vector23 = new THREE.Vector3()
            .subVectors(point3, point2)
            .setLength(config.sideLength);
        super([
            new THREE.Vector3().addVectors(point2, vector21),
            new THREE.Vector3().add(point2).add(vector21).add(vector23),
            new THREE.Vector3().addVectors(point2, vector23),
        ], config);
    }
}
class Number extends THREE.Group {
    constructor(value = 0, config = {}) {
        const fullConfig = {
            color: config.color ?? "black",
            decimals: config.decimals ?? 2,
        };
        super();
        Object.defineProperty(this, "meshes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "material", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new THREE.MeshBasicMaterial({ color: "black" })
        });
        Object.defineProperty(this, "decimals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "centerData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                center: new THREE.Vector3(),
                box: new THREE.Box3(),
                offset: new THREE.Vector3(),
                worldPosition: new THREE.Vector3(),
            }
        });
        this.material.color = new THREE.Color(fullConfig.color);
        this.decimals = fullConfig.decimals;
        this.scale.set(0.0008, -0.0008, 0.0008);
        this.updateFromValue(value);
    }
    reshape(value, config = {}) {
        const fullConfig = {
            color: config.color ?? "black",
            decimals: config.decimals ?? 2,
        };
        this.material.color = new THREE.Color(fullConfig.color);
        this.decimals = fullConfig.decimals;
        this.clear();
        this.updateFromValue(value);
    }
    updateFromValue(value) {
        const characters = value.toFixed(this.decimals).split("");
        for (let i = 0; i < characters.length; i++) {
            const character = characters[i];
            if (character === undefined) {
                throw new Error(`No character at index ${i}`);
            }
            const geometry = Number.geometries.get(character);
            if (geometry === undefined) {
                throw new Error(`Character ${character} isn't supported in Number.`);
            }
            let mesh = this.meshes[i];
            if (mesh !== undefined) {
                mesh.geometry = geometry;
            }
            else {
                mesh = new THREE.Mesh(geometry, this.material);
                this.meshes.push(mesh);
            }
            this.add(mesh);
        }
        for (let i = 1; i < this.children.length; i++) {
            const previousChild = this.children[i - 1];
            const currentChild = this.children[i];
            currentChild.moveNextTo(previousChild, Utils.RIGHT, 0.025);
        }
        this.centerData.worldPosition.copy(this.position);
        this.localToWorld(this.centerData.worldPosition);
        this.centerData.box.setFromObject(this).getCenter(this.centerData.center);
        this.centerData.center.y *= -1;
        this.centerData.offset
            .subVectors(this.centerData.worldPosition, this.centerData.center)
            .multiplyScalar(1 / 0.0008);
        this.children.forEach((child) => child.position.add(this.centerData.offset));
    }
    static extractGeometry(textShape) {
        return textShape.children[0].children[0].children[0]
            .geometry;
    }
    static initializeGeometries() {
        const geometryMap = new Map();
        for (let i = 0; i < 10; i++) {
            const numberShape = new Text.Text(i.toString());
            const numberGeometry = Number.extractGeometry(numberShape);
            geometryMap.set(i.toString(), numberGeometry);
        }
        const decimalShape = new Text.Text(".");
        const decimalGeometry = Number.extractGeometry(decimalShape);
        geometryMap.set(".", decimalGeometry);
        return geometryMap;
    }
}
Object.defineProperty(Number, "geometries", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: Number.initializeGeometries()
});
export { Indicator, Angle, RightAngle, CongruentLine, CongruentAngle, Number };
//# sourceMappingURL=diagram.js.map