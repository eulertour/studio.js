import { describe, test, expect } from "bun:test";
import { Animation } from "../src/animation/Animation.js";
import * as THREE from "three";
import { Text } from "../text.js";
import { moveNextTo } from "../utils.js";

describe("Animation", () => {
  test("should handle function animation", () => {
    let updateCalled = false;
    const testFn = (t: number, dt: number) => {
      updateCalled = true;
    };

    // Create animation instance
    const animation = new Animation(testFn, {
      duration: 1,
      delay: 0
    });

    // Set required time properties
    animation.startTime = 0;
    animation.endTime = 1;

    // Execute animation update
    animation.update(0.5, 0.1);  // Need to pass both worldTime and deltaTime

    // Verify function was called
    expect(updateCalled).toBe(true);
  });

  test("should respect animation timing", () => {
    let callCount = 0;
    const animation = new Animation((t, dt) => { 
      callCount++; 
    });

    animation.startTime = 0;
    animation.endTime = 1;

    // Test behavior at different time points
    animation.update(0.5, 0.1);  // Should execute
    expect(callCount).toBe(1);

    animation.update(1.5, 0.1);  // Should not execute after end time
    expect(callCount).toBe(1);
    expect(animation.finished).toBe(true);
  });

  test("should create Animation from function", () => {
    let called = false;
    const testFn = (t: number, dt: number) => {
      called = true;
    };

    const animation = new Animation(testFn);
    animation.startTime = 0;
    animation.endTime = 1;
    animation.update(0.5, 0.1);
    
    expect(called).toBe(true);
  });
});