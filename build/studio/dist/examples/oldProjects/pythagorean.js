"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const studio_1 = require("@eulertour/studio");
class Example {
    constructor(scene, camera, renderer) {
        Object.defineProperty(this, "scene", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: scene
        });
        Object.defineProperty(this, "camera", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: camera
        });
        Object.defineProperty(this, "renderer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: renderer
        });
        Object.defineProperty(this, "s", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 4.8
        });
        Object.defineProperty(this, "a", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1.5
        });
        Object.defineProperty(this, "b", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.s - this.a
        });
        Object.defineProperty(this, "labelOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.5
        });
        Object.defineProperty(this, "labelScale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.7
        });
        Object.defineProperty(this, "triangles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "animations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "indicator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "indicatorOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.4
        });
        Object.defineProperty(this, "indicatorLabelOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.1
        });
        Object.defineProperty(this, "triangleLabels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "diagram", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new studio_1.THREE.Group()
        });
        Object.defineProperty(this, "equations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "smallSquareShade", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.animateSquare();
        this.animateArea();
    }
    animateSquare() {
        this.scene.add(this.diagram);
        const bottomRight = new studio_1.THREE.Vector3(this.s / 2, -this.s / 2);
        const triangle = new studio_1.Geometry.Polygon([
            bottomRight,
            bottomRight.clone().addScaledVector(studio_1.Utils.LEFT, this.b),
            bottomRight.clone().addScaledVector(studio_1.Utils.UP, this.a),
            bottomRight,
        ]);
        this.triangles = [triangle];
        for (let i = 0; i < 3; i++) {
            this.triangles.push(triangle.clone());
        }
        this.triangleLabels = [];
        for (const triangle of this.triangles) {
            const labels = this.getLabels(triangle);
            this.triangleLabels.push(labels);
            triangle.add(labels);
        }
        const triangleCenter = new studio_1.THREE.Vector3()
            .add(triangle.points[0])
            .add(triangle.points[1])
            .add(triangle.points[2])
            .divideScalar(3);
        // Offset the first triangle for drawing.
        triangle.position.addScaledVector(triangleCenter, -1);
        this.animations.push({
            animations: [new studio_1.Animation.Draw(triangle), new studio_1.Animation.FadeIn(this.triangleLabels[0])],
        }, new studio_1.Animation.Shift(this.triangles[0], triangleCenter), {
            before: () => {
                this.triangles.forEach((t) => this.diagram.add(t));
            },
            animations: [
                ...this.triangles
                    .slice(1)
                    .map((triangle, i) => new studio_1.Animation.Rotate(triangle, (-(i + 1) * Math.PI) / 2)),
                ...this.triangleLabels.slice(1).map((labels, i) => new studio_1.Animation.Animation((t) => {
                    labels.children.forEach((label) => {
                        label.rotation.z = t * ((i + 1) * (Math.PI / 2));
                    });
                })),
            ],
        });
    }
    animateArea() {
        this.indicator = new studio_1.Diagram.Indicator(new studio_1.THREE.Vector3(-this.s / 2, -this.s / 2), new studio_1.THREE.Vector3(-this.s / 2, this.s / 2));
        this.indicator.position.addScaledVector(studio_1.Utils.LEFT, this.indicatorOffset);
        const indicatorLabel = new studio_1.Text.Text('a + b', { batchMaterials: false });
        indicatorLabel.setScale(this.labelScale);
        studio_1.Utils.moveToLeftOf(this.indicator, indicatorLabel, this.indicatorLabelOffset);
        // this.diagram = new THREE.Group();
        // this.diagram.add(...this.triangles, this.indicator, indicatorLabel);
        const triangleB = this.triangleLabels[1].children[0].children[0].children[0].children[0];
        const indicatorB = indicatorLabel.children[0].children[2].children[0];
        const triangleA = this.triangleLabels[2].children[2].children[0].children[0].children[0];
        const indicatorA = indicatorLabel.children[0].children[0].children[0];
        const indicatorPlus = indicatorLabel.children[0].children[1].children[0];
        this.animations.push({
            animations: [
                this.indicator.grow({ parent: this.diagram }),
                new studio_1.Animation.MoveTo(indicatorA, triangleA, { scene: this.scene }),
                new studio_1.Animation.MoveTo(indicatorB, triangleB, { scene: this.scene }),
                new studio_1.Animation.FadeIn(indicatorPlus),
            ],
            before: () => {
                this.diagram.add(indicatorLabel);
                indicatorLabel.setInvisible();
                indicatorPlus.setVisible();
            },
            after: () => {
                this.diagram.remove(triangleA, triangleB);
                indicatorLabel.setVisible();
            },
        }, [
            new studio_1.Animation.Scale(this.diagram, 0.7),
            new studio_1.Animation.Shift(this.diagram, new studio_1.THREE.Vector3().addScaledVector(studio_1.Utils.LEFT, 3.3)),
        ]);
        this.equations = new studio_1.THREE.Group().translateX(3.3).translateY(1.9).translateY(-1.9);
        this.equations.setScale(0.5);
        const line1 = new studio_1.Text.Text('(a + b)^2 = c^2 + 4\\left(\\frac{1}{2}ab\\right)', {
            groupColoring: [
                [6, 'red'],
                [7, 'black'],
                [9, 'green'],
                [10, 'black'],
                [12, 'blue'],
            ],
        });
        const line2 = new studio_1.Text.Text('a^2 + 2ab + b^2 = c^2 + 4\\left(\\frac{1}{2}ab\\right)');
        const line3 = new studio_1.Text.Text('a^2 + 2ab + b^2 = c^2 + 2ab');
        const line4 = new studio_1.Text.Text('a^2 + b^2 = c^2');
        line2.moveBelow(line1);
        line3.moveBelow(line2);
        line4.moveBelow(line3, 1.3);
        this.equations.add(line1, line2, line3, line4);
        const largeSquareShade = new studio_1.Geometry.Polygon([
            new studio_1.THREE.Vector3(this.s / 2, this.s / 2),
            new studio_1.THREE.Vector3(this.s / 2, -this.s / 2),
            new studio_1.THREE.Vector3(-this.s / 2, -this.s / 2),
            new studio_1.THREE.Vector3(-this.s / 2, this.s / 2),
            new studio_1.THREE.Vector3(this.s / 2, this.s / 2),
        ], {
            fillColor: new studio_1.THREE.Color('red'),
            fillOpacity: 0.4,
            strokeColor: new studio_1.THREE.Color('red'),
        });
        largeSquareShade.position.z += 1;
        this.animations.push({
            animations: [
                new studio_1.Animation.FadeIn(line1.children[0].children[0], {
                    before: () => {
                        this.equations.add(line1, line2, line3, line4);
                        this.equations.setInvisible();
                        line1.children[0].children[0].setVisible();
                    },
                }),
                new studio_1.Animation.FadeIn(largeSquareShade, {
                    before: () => {
                        this.diagram.add(largeSquareShade);
                    },
                }),
            ],
            before: () => {
                this.scene.add(this.equations);
            },
        }, new studio_1.Animation.FadeOut(largeSquareShade.fill), [
            new studio_1.Animation.FadeIn(line1.children[0].children[1], {
                before: () => {
                    line1.children[0].children[1].setVisible();
                },
            }),
            new studio_1.Animation.FadeIn(line1.children[0].children[2], {
                before: () => {
                    line1.children[0].children[2].setVisible();
                },
            }),
            new studio_1.Animation.FadeIn(() => {
                const smallSquareShade = new studio_1.Geometry.Polygon([
                    studio_1.Utils.transformBetweenSpaces(this.triangles[0], this.diagram, this.triangles[0].points[1].clone()),
                    studio_1.Utils.transformBetweenSpaces(this.triangles[1], this.diagram, this.triangles[1].points[1].clone()),
                    studio_1.Utils.transformBetweenSpaces(this.triangles[2], this.diagram, this.triangles[2].points[1].clone()),
                    studio_1.Utils.transformBetweenSpaces(this.triangles[3], this.diagram, this.triangles[3].points[1].clone()),
                    studio_1.Utils.transformBetweenSpaces(this.triangles[0], this.diagram, this.triangles[0].points[1].clone()),
                ], {
                    fillColor: new studio_1.THREE.Color('green'),
                    fillOpacity: 0.5,
                    strokeOpacity: 0,
                });
                this.diagram.add(smallSquareShade);
                return smallSquareShade;
            }),
        ], [
            new studio_1.Animation.FadeIn(line1.children[0].children[3], {
                before: () => {
                    line1.children[0].children[3].setVisible();
                },
            }),
            new studio_1.Animation.FadeIn(line1.children[0].children[4], {
                before: () => {
                    line1.children[0].children[4].setVisible();
                },
            }),
            new studio_1.Animation.FadeIn(() => {
                const triangleShades = new studio_1.THREE.Group();
                this.triangles.forEach((triangle) => {
                    const shade = new studio_1.Geometry.Polygon(triangle.points.map((p) => this.diagram.worldToLocal(triangle.localToWorld(p.clone()))), {
                        fillColor: new studio_1.THREE.Color('blue'),
                        fillOpacity: 0.5,
                        strokeOpacity: 0,
                    });
                    triangleShades.add(shade);
                });
                this.diagram.add(triangleShades);
                return triangleShades;
            }),
        ]);
    }
    getLabels(triangle) {
        const labelGroup = new studio_1.THREE.Group();
        const sideVectors = [];
        for (let i = 0; i < 3; i++) {
            sideVectors.push(new studio_1.THREE.Vector3().subVectors(triangle.points[i + 1], triangle.points[i]));
        }
        const midpoints = [];
        for (let i = 0; i < 3; i++) {
            midpoints.push(triangle.points[i].clone().addScaledVector(sideVectors[i], 0.5));
        }
        const normals = [];
        for (let i = 0; i < 3; i++) {
            normals.push(sideVectors[i]
                .clone()
                .normalize()
                .applyAxisAngle(studio_1.Utils.OUT, Math.PI / 2));
        }
        ['b', 'c', 'a'].forEach((letter) => {
            const label = new studio_1.Text.Text(letter);
            label.scale.set(this.labelScale, this.labelScale, this.labelScale);
            labelGroup.add(label);
        });
        labelGroup.children.forEach((letter, i) => letter.position.copy(midpoints[i]).addScaledVector(normals[i], this.labelOffset));
        return labelGroup;
    }
}
exports.default = Example;
//# sourceMappingURL=pythagorean.js.map