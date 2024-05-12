import {
  THREE,
  Geometry,
  Animation,
  Text,
  StudioScene,
  Utils,
  Diagram,
} from "@eulertour/studio";

export default class Example implements StudioScene {
  s = 4.8;
  a = 1.5;
  b = this.s - this.a;
  labelOffset = 0.5;
  labelScale = 0.7;
  triangles: Geometry.Polygon[];
  animations = [];
  indicator: Diagram.Indicator;
  indicatorOffset = 0.4;
  indicatorLabelOffset = 0.1;
  triangleLabels: Array<THREE.Group>;
  diagram = new THREE.Group();
  equations: THREE.Group;
  smallSquareShade: Geometry.Polygon;

  constructor(
    public scene,
    public camera,
    public renderer,
  ) {
    this.animateSquare();
    this.animateArea();
  }

  animateSquare() {
    this.scene.add(this.diagram);
    const bottomRight = new THREE.Vector3(this.s / 2, -this.s / 2);

    const triangle = new Geometry.Polygon([
      bottomRight,
      bottomRight.clone().addScaledVector(Utils.LEFT, this.b),
      bottomRight.clone().addScaledVector(Utils.UP, this.a),
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

    const triangleCenter = new THREE.Vector3()
      .add(triangle.points[0])
      .add(triangle.points[1])
      .add(triangle.points[2])
      .divideScalar(3);

    // Offset the first triangle for drawing.
    triangle.position.addScaledVector(triangleCenter, -1);

    this.animations.push(
      {
        animations: [
          new Animation.Draw(triangle),
          new Animation.FadeIn(this.triangleLabels[0]),
        ],
      },
      new Animation.Shift(this.triangles[0], triangleCenter),
      {
        before: () => {
          this.triangles.forEach((t) => this.diagram.add(t));
        },
        animations: [
          ...this.triangles
            .slice(1)
            .map(
              (triangle, i) =>
                new Animation.Rotate(triangle, (-(i + 1) * Math.PI) / 2),
            ),
          ...this.triangleLabels.slice(1).map(
            (labels, i) =>
              new Animation.Animation((t) => {
                labels.children.forEach((label) => {
                  label.rotation.z = t * ((i + 1) * (Math.PI / 2));
                });
              }),
          ),
        ],
      },
    );
  }

  animateArea() {
    this.indicator = new Diagram.Indicator(
      new THREE.Vector3(-this.s / 2, -this.s / 2),
      new THREE.Vector3(-this.s / 2, this.s / 2),
    );
    this.indicator.position.addScaledVector(Utils.LEFT, this.indicatorOffset);

    const indicatorLabel = new Text.Text("a + b", { batchMaterials: false });
    indicatorLabel.setScale(this.labelScale);
    Utils.moveToLeftOf(
      this.indicator,
      indicatorLabel,
      this.indicatorLabelOffset,
    );

    // this.diagram = new THREE.Group();
    // this.diagram.add(...this.triangles, this.indicator, indicatorLabel);

    let triangleB =
      this.triangleLabels[1].children[0].children[0].children[0].children[0];
    let indicatorB = indicatorLabel.children[0].children[2].children[0];

    let triangleA =
      this.triangleLabels[2].children[2].children[0].children[0].children[0];
    let indicatorA = indicatorLabel.children[0].children[0].children[0];

    let indicatorPlus = indicatorLabel.children[0].children[1].children[0];
    this.animations.push(
      {
        animations: [
          this.indicator.grow({ parent: this.diagram }),
          new Animation.MoveTo(indicatorA, triangleA, { scene: this.scene }),
          new Animation.MoveTo(indicatorB, triangleB, { scene: this.scene }),
          new Animation.FadeIn(indicatorPlus),
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
      },
      [
        new Animation.Scale(this.diagram, 0.7),
        new Animation.Shift(
          this.diagram,
          new THREE.Vector3().addScaledVector(Utils.LEFT, 3.3),
        ),
      ],
    );

    this.equations = new THREE.Group()
      .translateX(3.3)
      .translateY(1.9)
      .translateY(-1.9);
    this.equations.setScale(0.5);

    const line1 = new Text.Text(
      "(a + b)^2 = c^2 + 4\\left(\\frac{1}{2}ab\\right)",
      {
        groupColoring: [
          [6, "red"],
          [7, "black"],
          [9, "green"],
          [10, "black"],
          [12, "blue"],
        ],
      },
    );
    const line2 = new Text.Text(
      "a^2 + 2ab + b^2 = c^2 + 4\\left(\\frac{1}{2}ab\\right)",
    );
    const line3 = new Text.Text("a^2 + 2ab + b^2 = c^2 + 2ab");
    const line4 = new Text.Text("a^2 + b^2 = c^2");

    line2.moveBelow(line1);
    line3.moveBelow(line2);
    line4.moveBelow(line3, 1.3);
    this.equations.add(line1, line2, line3, line4);

    const largeSquareShade = new Geometry.Polygon(
      [
        new THREE.Vector3(this.s / 2, this.s / 2),
        new THREE.Vector3(this.s / 2, -this.s / 2),
        new THREE.Vector3(-this.s / 2, -this.s / 2),
        new THREE.Vector3(-this.s / 2, this.s / 2),
        new THREE.Vector3(this.s / 2, this.s / 2),
      ],
      {
        fillColor: new THREE.Color("red"),
        fillOpacity: 0.4,
        strokeColor: new THREE.Color("red"),
      },
    );
    largeSquareShade.position.z += 1;

    this.animations.push(
      {
        animations: [
          new Animation.FadeIn(line1.children[0].children[0], {
            before: () => {
              this.equations.add(line1, line2, line3, line4);
              this.equations.setInvisible();
              line1.children[0].children[0].setVisible();
            },
          }),
          new Animation.FadeIn(largeSquareShade, {
            before: () => {
              this.diagram.add(largeSquareShade);
            },
          }),
        ],
        before: () => {
          this.scene.add(this.equations);
        },
      },
      new Animation.FadeOut(largeSquareShade.fill),
      [
        new Animation.FadeIn(line1.children[0].children[1], {
          before: () => {
            line1.children[0].children[1].setVisible();
          },
        }),
        new Animation.FadeIn(line1.children[0].children[2], {
          before: () => {
            line1.children[0].children[2].setVisible();
          },
        }),
        new Animation.FadeIn(() => {
          const smallSquareShade = new Geometry.Polygon(
            [
              Utils.transformBetweenSpaces(
                this.triangles[0],
                this.diagram,
                this.triangles[0].points[1].clone(),
              ),
              Utils.transformBetweenSpaces(
                this.triangles[1],
                this.diagram,
                this.triangles[1].points[1].clone(),
              ),
              Utils.transformBetweenSpaces(
                this.triangles[2],
                this.diagram,
                this.triangles[2].points[1].clone(),
              ),
              Utils.transformBetweenSpaces(
                this.triangles[3],
                this.diagram,
                this.triangles[3].points[1].clone(),
              ),
              Utils.transformBetweenSpaces(
                this.triangles[0],
                this.diagram,
                this.triangles[0].points[1].clone(),
              ),
            ],
            {
              fillColor: new THREE.Color("green"),
              fillOpacity: 0.5,
              strokeOpacity: 0,
            },
          );
          this.diagram.add(smallSquareShade);
          return smallSquareShade;
        }),
      ],
      [
        new Animation.FadeIn(line1.children[0].children[3], {
          before: () => {
            line1.children[0].children[3].setVisible();
          },
        }),
        new Animation.FadeIn(line1.children[0].children[4], {
          before: () => {
            line1.children[0].children[4].setVisible();
          },
        }),
        new Animation.FadeIn(() => {
          const triangleShades = new THREE.Group();
          this.triangles.forEach((triangle) => {
            const shade = new Geometry.Polygon(
              triangle.points.map((p) =>
                this.diagram.worldToLocal(triangle.localToWorld(p.clone())),
              ),
              {
                fillColor: new THREE.Color("blue"),
                fillOpacity: 0.5,
                strokeOpacity: 0,
              },
            );
            triangleShades.add(shade);
          });
          this.diagram.add(triangleShades);
          return triangleShades;
        }),
      ],
      // new Animation.FadeIn(line2, {
      //   before: () => {
      //     line2.setVisible();
      //   },
      // }),
      // new Animation.FadeIn(line3, {
      //   before: () => {
      //     line3.setVisible();
      //   },
      // }),
      // new Animation.FadeIn(line4, {
      //   before: () => {
      //     line4.setVisible();
      //   },
      // }),
    );
  }

  getLabels(triangle: Geometry.Polygon): THREE.Group {
    const labelGroup = new THREE.Group();
    const sideVectors: Array<THREE.Vector3> = [];
    for (let i = 0; i < 3; i++) {
      sideVectors.push(
        new THREE.Vector3().subVectors(
          triangle.points[i + 1],
          triangle.points[i],
        ),
      );
    }

    const midpoints: Array<THREE.Vector3> = [];
    for (let i = 0; i < 3; i++) {
      midpoints.push(
        triangle.points[i].clone().addScaledVector(sideVectors[i], 0.5),
      );
    }

    const normals: Array<THREE.Vector3> = [];
    for (let i = 0; i < 3; i++) {
      normals.push(
        sideVectors[i]
          .clone()
          .normalize()
          .applyAxisAngle(Utils.OUT, Math.PI / 2),
      );
    }

    ["b", "c", "a"].forEach((letter) => {
      const label = new Text.Text(letter);
      label.scale.set(this.labelScale, this.labelScale, this.labelScale);
      labelGroup.add(label);
    });

    labelGroup.children.forEach((letter, i) =>
      letter.position
        .copy(midpoints[i])
        .addScaledVector(normals[i], this.labelOffset),
    );

    return labelGroup;
  }
}
