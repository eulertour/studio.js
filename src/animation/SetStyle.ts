import { Animation } from "./Animation.js";
import * as THREE from "three";
import { Shape, Style } from "../geometry/index.js";

export default class SetStyle extends Animation {
  private initialStyle!: Style;
  private targetStyle!: Style;
  private currentStyle: Style = {};

  constructor(
    public shape: Shape,
    public style: Style,
    config?: any,
  ) {
    super(
      (elapsedTime) => {
        if (this.initialStyle.fillColor && this.targetStyle.fillColor) {
          this.currentStyle.fillColor ||= new THREE.Color();
          this.currentStyle.fillColor.copy(this.initialStyle.fillColor);
          this.currentStyle.fillColor.lerp(this.targetStyle.fillColor, elapsedTime);
        }

        if (this.initialStyle.strokeColor && style.strokeColor) {
          this.currentStyle.strokeColor = this.initialStyle.strokeColor.clone();
          this.currentStyle.strokeColor.lerp(style.strokeColor, elapsedTime);
        }

        if (this.initialStyle.fillOpacity !== undefined && style.fillOpacity !== undefined) {
          this.currentStyle.fillOpacity = THREE.MathUtils.lerp(
            this.initialStyle.fillOpacity,
            style.fillOpacity,
            elapsedTime
          );
        }

        if (this.initialStyle.strokeOpacity !== undefined && style.strokeOpacity !== undefined) {
          this.currentStyle.strokeOpacity = THREE.MathUtils.lerp(
            this.initialStyle.strokeOpacity,
            style.strokeOpacity,
            elapsedTime
          );
        }

        if (typeof this.targetStyle.strokeWidth !== 'undefined' && 
            typeof this.initialStyle.strokeWidth !== 'undefined') {
          this.currentStyle.strokeWidth = THREE.MathUtils.lerp(
            this.initialStyle.strokeWidth,
            this.targetStyle.strokeWidth,
            elapsedTime
          );
        }

        shape.restyle(this.currentStyle);
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
    this.targetStyle = {
      ...this.style,
      fillColor: this.style.fillColor?.clone(),
      strokeColor: this.style.strokeColor?.clone()
    };
  }
} 