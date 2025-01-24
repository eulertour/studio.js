import { Animation } from "./animation.js";


export default class Wait extends Animation {
    constructor(config?) {
      super(() => {}, config);
    }
  }