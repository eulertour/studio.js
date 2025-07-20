import {
  THREE,                    // The three.js library
  StudioScene,              // An interface that all scenes must implement
  Geometry,                 // EulerStudio Shapes
  Animation,                // EulerStudio Animations
  AnimationRepresentation,  // A union of animation formats that can be added to this.animations
  Text,                     // EulerStudio Text
  Frame,
  component,
} from '@eulertour/studio';

import Diagram from "./diagram";
import LoadingIcon from "./loadingIcon"

export const FrameConfig = Frame.horizontal.fhd
// for HD exporting

export interface IFormula extends THREE.Group {
  aspectRatio: Geometry.Rectangle;
  question: Text.Text 
  one: Text.Text;
  formula: Text.Text;
  verticalAngles: Text.Text;

  }

class Formula extends THREE.Group implements IFormula {
  @component accessor aspectRatio: IFormula["aspectRatio"];
  @component accessor question: IFormula["question"];
  @component accessor one: IFormula["one"];
  @component accessor formula: IFormula["formula"];
  @component accessor verticalAngles: IFormula["verticalAngles"];


  constructor() {
    super();

//aspect ratio
    this.aspectRatio = new Geometry.Rectangle(9, 8);

    this.question = new Text.Text(`\\begin{align*}
      &\\, \\, \\, \\, \\textsf{What's the area of the rectangle?} \\\\
      \\end{align*}`,
      {
        // fillColor: darkPurple
      });
    this.question.position.set(0, 2.9, 0)
    this.question.setScale(.6)

  }
}

//Flash and items stay: 
//   class Flash extends Animation.Animation {
//     constructor(object, startTime, endTime) {
//       super(
//         (t) => {
//           const midpoint = (startTime + endTime) / 2;
//           let alpha;
//           if (t < startTime) {
//             alpha = 0;
//           } else if (t < midpoint) {
//             const t0 = (t - startTime) / (midpoint - startTime);
//             alpha = t0;
//           } else {
//             alpha = 1;
//           }

//           const fillOpacity = alpha;
//           const strokeOpacity = alpha;
//           object.restyle({
//             fillOpacity,
//             strokeOpacity,
//           });
//         },
//         { object, reveal: true },
//       );
//     }
//   }

// //flash and objects fade out
//   class Flash extends Animation.Animation {
//     constructor(object, startTime, endTime) {
//       super(
//         (t) => {
//           const midpoint = (startTime + endTime) / 2;
//           let alpha;
//           if (t < startTime) {
//             alpha = 0;
//           } else if (t < midpoint) {
//             const t0 = (t - startTime) / (midpoint - startTime);
//             alpha = t0;
//           } else if (t < endTime) {
//             const t1 = (t - midpoint) / (endTime - midpoint);
//             alpha = 1 - t1;
//           } else {
//             alpha = 0;
//           }

//           const fillOpacity = alpha;
//           const strokeOpacity = alpha;
//           object.restyle({
//             fillOpacity,
//             strokeOpacity,
//           });
//         },
//         { object, reveal: true },
//       );
//     }
//   }

export default class Example implements StudioScene {
  animations: Array<AnimationRepresentation>;
  line: Geometry.Line;

  constructor(
    public scene,
    public camera,
    public renderer,
  ) {

    const formula = new Formula();
    scene.add(formula);
    formula.question.hide()
    formula.aspectRatio.hide()

    const diagram = new Diagram();
    scene.add(diagram);
    diagram.setScale(.7)
    diagram.rectangle.hideComponents();

    const loadingIcon = new LoadingIcon();
    scene.add(loadingIcon)
    loadingIcon.innerCircle.hide();
    loadingIcon.outerCircle.hide();
    loadingIcon.position.set(4.35, -2.8, -.1)
    loadingIcon.setScale(1.4)
    loadingIcon.polygons.hide()

//colors 
    const blue = new THREE.Color(0x4287f5)
    const green = new THREE.Color(0x238c2e)
    const brightGreen = new THREE.Color('#43E033')
    const orange = new THREE.Color('#FFA24A')
    const yellow = new THREE.Color('#F3EB7E')
    const brightPink = new THREE.Color('#E03373')
    const purple = new THREE.Color('#9E53E6')
    const lightPurple = new THREE.Color('#ccace8') 
    const lightBlue = new THREE.Color('#ACC5E8')
    const pink = new THREE.Color('#BD41B7')
    const red = new THREE.Color('#CE2D2B')

    const d = diagram.rectangle
    this.animations = [

      new Animation.Draw(diagram.rectangle),
      [
        new Animation.Draw(diagram.rectangle.quarterCircle),
      ],
        new Animation.FadeIn(diagram.rectangle.quarterCircleRadiusHighlight),
        new Animation.FadeOut(diagram.rectangle.quarterCircleRadiusHighlight),
      [
        new Animation.Draw(diagram.rectangle.semiCircle),
      ],
      [
        new Animation.Draw(diagram.rectangle.tangentLine),
        new Animation.Draw(diagram.rectangle.tangentLineLabel),
      ],
      [
        new Animation.FadeIn(diagram.rectangle.rectangleWithFill),
        new Animation.FadeIn(diagram.rectangle.questionMark),
        new Animation.FadeIn(formula.question)
      ],

//loading icon
      new Animation.FadeIn(loadingIcon.polygons),
      [
        new Animation.Animation(() => {
        loadingIcon.polygons.segment0.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment0.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment8.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment8.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment7.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment7.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment6.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment6.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment5.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment5.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment4.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment4.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment3.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment3.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment2.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment2.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment1.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment1.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment0.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
  //second revolution
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment0.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment8.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment8.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment7.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment7.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment6.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment6.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment5.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment5.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment4.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment4.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment3.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment3.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment2.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment2.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment1.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment1.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment0.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
  //last revoluton
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment0.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment8.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment8.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment7.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment7.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment6.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment6.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment5.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment5.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment4.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment4.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment3.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],
      [
      new Animation.Animation(() => {
        loadingIcon.polygons.segment3.restyle({
          fillOpacity: .6,
          strokeOpacity: .8
        })
      }),
      new Animation.Animation(() => {
        loadingIcon.polygons.segment2.restyle({
          fillOpacity: .2,
          strokeOpacity: .45
        })
      }),
      ],

      [
        new Animation.FadeOut(loadingIcon.polygons),
        new Animation.FadeOut(diagram.rectangle.rectangleWithFill),
        new Animation.FadeOut(diagram.rectangle.questionMark),
        new Animation.FadeOut(formula.question),
      ],
        new Animation.FadeIn(diagram.rectangle.base),
        new Animation.FadeIn(diagram.rectangle.height),
      [
        new Animation.FadeIn(diagram.rectangle.formula),
        new Animation.FadeIn(diagram.rectangle.formula1),
      ],
      [
        new Animation.FadeIn(diagram.rectangle.quarterCircleRadiusLabel),
        new Animation.FadeIn(diagram.rectangle.quarterCircleRadiusLabelEquals),       
      ],
//r slides over
      [
        new Animation.FadeOut(diagram.rectangle.quarterCircleRadiusLabelEquals),       
        new Animation.FadeOut(diagram.rectangle.height),       

        new Animation.Shift(d.quarterCircleRadiusLabel,
          new THREE.Vector3(1,0,0))
      ],
      [
        new Animation.Draw(d.quarterCircleRadiusHighlightBottom),
        new Animation.FadeIn(d.quarterCircleRadiusLabelBottom),
        new Animation.Shift(d.quarterCircleRadiusLabelBottom,
          new THREE.Vector3(2.2, -1, 0))
      ],
//semicircle
        new Animation.FadeOut(d.quarterCircleRadiusHighlightBottom),
      [
        new Animation.FadeIn(d.point),
        new Animation.FadeIn(d.semicircleRadius),
      ],
      [
        new Animation.FadeIn(d.semicircleRadius1),
        new Animation.Shift(d.semicircleRadius1,
          new THREE.Vector3(2.3, 0, 0))  
      ],
      new Animation.Draw(d.baseHighlight),
      [
        new Animation.FadeOut(d.baseHighlight),
        new Animation.FadeOut(d.base),
        new Animation.FadeIn(d.formula2),

        new Animation.Shift(d.formula,
          new THREE.Vector3(-1.6, 0, 0)),  
        new Animation.Shift(d.formula1,
          new THREE.Vector3(-1.6, 0, 0))  
      ],
      new Animation.FadeIn(d.formula3),
      [
        new Animation.Shift(d.formula,
          new THREE.Vector3(-1.2, 0, 0)),  
        new Animation.Shift(d.formula2,
          new THREE.Vector3(-3.1, 0, 0)),  
        new Animation.Shift(d.formula3,
          new THREE.Vector3(-3.1, 0, 0)),

        new Animation.FadeOut(d.formula1),  
      ],
      new Animation.FadeIn(d.formula4),
      [
        new Animation.FadeOut(d.formula2),
        new Animation.FadeOut(d.formula3),

        new Animation.Shift(d.formula,
          new THREE.Vector3(2, 0, 0)),  
        new Animation.Shift(d.formula4,
          new THREE.Vector3(-2.4, 0, 0)),  
      ],
      new Animation.Draw(d.tangentRadius),
      [
        new Animation.FadeIn(d.semicircleRadius2),
        new Animation.Shift(d.semicircleRadius2,
          new THREE.Vector3(.9, -1.7, 0))  
      ],
      new Animation.FadeIn(d.rightAngle),
      new Animation.FadeIn(d.rightTriangle),
      [
        new Animation.Emphasize(d.tangentLineLabel, 1.4),
        new Animation.Emphasize(d.semicircleRadius2, 1.4),
      ],
      [
        new Animation.Emphasize(d.quarterCircleRadiusLabelBottom, 1.4),
        new Animation.Emphasize(d.semicircleRadius, 1.4),
      ],
//formula shifts
      [
        new Animation.Shift(d.formula,
          new THREE.Vector3(2.1, -2.6, 0)),  
        new Animation.Shift(d.formula4,
          new THREE.Vector3(1.3, -2.6, 0)),

        new Animation.SetScale(d.formula, .7),
        new Animation.SetScale(d.formula4, .7),
      ],
//pythagorean theorem
      new Animation.FadeIn(d.pythagorean),
      new Animation.FadeIn(d.pythagorean1),
      new Animation.FadeIn(d.pythagorean2),
      [
        new Animation.Draw(d.diagonalLine),
        new Animation.Draw(d.diagonalLine1)
      ],
      new Animation.FadeIn(d.pythagorean3),
      [
        new Animation.SetScale(d.pythagorean3, .9),
        new Animation.SetScale(d.formula4, .8),
        new Animation.SetScale(d.formula, .8),
      ],
      [
        new Animation.SetScale(d.pythagorean3, .8),
        new Animation.SetScale(d.formula4, .7),
        new Animation.SetScale(d.formula, .7),
        new Animation.Draw(d.circle),
      ],

// grow indicators
// diagram.square27Indicator.grow(),
//lerp line
// new Animation.Animation((t) => {
//         let currentPoints: [THREE.Vector3, THREE.Vector3] = [
//           new THREE.Vector3(),
//           new THREE.Vector3(),
//         ];
//         for (let i = 0; i < 2; i++) {
//           currentPoints[i].copy(
//             this.startPoints[i].clone().lerp(this.endPoints[i], t)
//           );
//         }
//         this.diagram.zheightCopy.reshape(...currentPoints,
//           {
//           strokeColor: triangleAPBColor
//           }
//         );
//       },
//           {
//             before: () => {
//               this.startPoints = [
//                 this.diagram.zheightCopy.points[0].clone(),
//                 this.diagram.zheightCopy.points[1].clone(),
//               ];
//               this.endPoints = [
//                 this.diagram.zaltitude.points[1].clone(),
//                 this.diagram.zaltitude.points[0].clone(),
//               ];
//             }
//           },
//         ),
// lerp polygon
      //     new Animation.Animation((t) => {
      //       const currentPoints = [];
      //       for (let i = 0; i < 3; i++) {
      //         currentPoints.push(
      //           this.startPoints[i].clone().lerp(this.endPoints[i], t)
      //         );
      //       }
      //   this.oldTriangle.triangle.reshape(currentPoints,
      //     {
      //     strokeColor: darkPurple
      //   });
      //     },
      //     {
      //       before: () => {
      //         this.startPoints = [...this.oldTriangle.triangle.points];
      //         this.endPoints = [
      //           this.oldTriangle.triangle.points[0],
      //           this.oldTriangle.triangle.points[1].clone().setX(this.oldTriangle.triangle.points[1].x + 1),
      //           this.oldTriangle.triangle.points[2],
      //         ];
      //       }
      //     }

      // new Animation.Rotate(diagram.rectangle, Math.PI / 2),
      // new Animation.SetOpacity(diagram.line.angle, .2, {
      //   before: () => {
      //     diagram.line.angle.setStyle({
      //       strokeOpacity: 0.2,
      //     })
      //   }
      // })
//  new Animation.Animation((t, dt) => {
//           diagram.bigSquarePolygon.whiteTriangleTop.setStyle({
//             strokeOpacity: t,
//           })
//         }),
//emphasize
        // new Animation.Animation(t => {
        //   const smallScale = 1.4;
        //   const largeScale = 1.8;
        //   const keyframe = 0.9;
        //   let scale;
        //   if (t <= keyframe) {
        //     const t0 = t / keyframe;
        //     scale = (1 - t0) * smallScale + t0 * largeScale;
        //   } else {
        //     const t0 = (t - keyframe) / (1 - keyframe);
        //     scale = (1 - t0) * largeScale + t0 * smallScale;
        //   }
        //   diagram.redTriangle.x.setScale(scale);
        // }),
//shake
      // new Animation.Animation(
      //   t => {
      //     const sine = .05 * Math.sin(4 * Math.PI * t);
      //     diagram.emphasizeTriangleBase.rotation.z = sine;
      //   }),
// angle grow
      // [
      //   new Animation.FadeIn(diagram.largeCircle.angleIndicatorHightlight,
      //             {
      //               before: () => {
      //                 diagram.largeCircle.angleIndicatorHightlight.setScale(0)
      //             }}),
      //   new Animation.FadeIn(diagram.isoscelesAngleIndicatorHightlight,
      //             {
      //               before: () => {
      //                 diagram.isoscelesAngleIndicatorHightlight.setScale(0)
      //             }}),
      //   new Animation.SetScale(diagram.largeCircle.angleIndicatorHightlight, 1),
      //   new Animation.SetScale(diagram.isoscelesAngleIndicatorHightlight, 1),
      // ],
//Flash
// class Flash extends Animation.Animation {
//   constructor(object, startTime, endTime) {
//     super(
//       (t) => {
//         const midpoint = (startTime + endTime) / 2;
//         let alpha;
//         if (t < startTime) {
//           alpha = 0;
//         } else if (t < midpoint) {
//           const t0 = (t - startTime) / (midpoint - startTime);
//           alpha = t0;
//         } else if (t < endTime) {
//           const t1 = (t - midpoint) / (endTime - midpoint);
//           alpha = 1 - t1;
//         } else {
//           alpha = 0;
//         }

//         const fillOpacity = alpha;
//         const strokeOpacity = alpha;
//         object.restyle({
//           fillOpacity,
//           strokeOpacity,
//         });
//       },
//       { object, reveal: true },
//     );
//   }
// }

//before

  //     {
  // animations:
  //     [
  //     new Animation.Emphasize(this.diagram.parallelogram),
  //     new Animation.Shake(this.diagram.parallelogram),
  //     ],
  //     before: () => {
  //     this.diagram.parallelogram.reveal
  //     },
  //     },
    ];
  }
}
