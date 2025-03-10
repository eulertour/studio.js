import { Animation } from "./Animation.js";
import * as THREE from "three";
import Shape, { Style } from "../geometry/Shape.js";

export default class SetStyle extends Animation {
  private initialStyle: Style = {};
  private targetStyle: Style = {};

  constructor(
    public shape: Shape,
    public style: Style,
    config?: any,
  ) {
    super(
      (elapsedTime) => {
        const currentStyle: Style = {};

        if (this.initialStyle.fillColor && style.fillColor) {
          currentStyle.fillColor = this.initialStyle.fillColor.clone();
          currentStyle.fillColor.lerp(style.fillColor, elapsedTime);
        }

        if (this.initialStyle.strokeColor && style.strokeColor) {
          currentStyle.strokeColor = this.initialStyle.strokeColor.clone();
          currentStyle.strokeColor.lerp(style.strokeColor, elapsedTime);
        }

        if (this.initialStyle.fillOpacity !== undefined && style.fillOpacity !== undefined) {
          currentStyle.fillOpacity = THREE.MathUtils.lerp(
            this.initialStyle.fillOpacity,
            style.fillOpacity,
            elapsedTime
          );
        }

        if (this.initialStyle.strokeOpacity !== undefined && style.strokeOpacity !== undefined) {
          currentStyle.strokeOpacity = THREE.MathUtils.lerp(
            this.initialStyle.strokeOpacity,
            style.strokeOpacity,
            elapsedTime
          );
        }

        if (this.initialStyle.strokeWidth !== undefined && style.strokeWidth !== undefined) {
          currentStyle.strokeWidth = THREE.MathUtils.lerp(
            this.initialStyle.strokeWidth,
            style.strokeWidth,
            elapsedTime
          );
        }

        shape.restyle(currentStyle);
      },
      { object: shape, ...config }
    );
  }

  setUp() {
    super.setUp();
    this.initialStyle = { 
      ...this.shape.getStyle(),
      fillColor: this.shape.getStyle().fillColor?.clone(),
      strokeColor: this.shape.getStyle().strokeColor?.clone()
    };
    this.targetStyle = this.style;
  }
} 