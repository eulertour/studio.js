import {
  THREE,
  Geometry,
  StudioScene,
  Text,
  component,
} from "@eulertour/studio";

class LabeledSquare extends Geometry.Square {
  labelScale = 0.65;

  @component accessor label: Text.Text;

  constructor(sideLength: number) {
    super(sideLength);
    this.label = new Text.Text(
      "\\substack{\\text{This label is a component} \\\\ \\text{added with a decorator}}",
    );
    this.label.setScale(this.labelScale);
    this.label.moveAbove(this);
  }
}

export default class Example implements StudioScene {
  public square: LabeledSquare;
  public revealInterval = 1;
  public lastRevealTime = 0;

  constructor(
    public scene: THREE.Scene,
    public camera: THREE.OrthographicCamera,
    public renderer: THREE.WebGLRenderer,
  ) {
    this.square = new LabeledSquare(2);
    this.scene.add(this.square);
  }

  loop(t: number) {
    if (t - this.lastRevealTime >= this.revealInterval) {
      if (this.square.label.isHidden()) {
        this.square.label.reveal();
      } else {
        this.square.label.hide();
      }
      this.lastRevealTime = t;
    }
  }
}
