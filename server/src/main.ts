import "./style.css";
import Scene from "./scene";
import { SceneController } from "@eulertour/studio";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <canvas id="canvas" style="border: 1px solid black; height: 420px"></canvas>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
if (canvas === null) {
  throw new Error("canvas is null");
}

const sceneController = new SceneController(Scene, canvas, {
  aspectRatio: 16 / 9,
  pixelHeight: 720,
  coordinateHeight: 8,
});

sceneController.play();
