import { Animation } from "./Animation.js";


export default class Wait extends Animation {
    constructor(config?: any) {
      super(() => {}, config);
    }
  }