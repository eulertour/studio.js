import { describe, it, expect, beforeEach } from 'vitest';
import { Animation } from '../src/index.js';


class TestAnimation extends Animation.Animation {
  setUpCalled = false;
  tearDownCalled = false;
  animationCalls: [number, number][] = [];
  beforeCalled = false;
  afterCalled = false;

  declare startTime: number;
  declare endTime: number;

  constructor() {
    super(
      (elapsed, delta) => {
        this.animationCalls.push([elapsed, delta]);
      },
      {
        before: () => { this.beforeCalled = true; },
        after: () => { this.afterCalled = true; }
      }
    );
  }

  
  update(time: number): boolean {
    return super.update(time);
  }

  setUp() {
    super.setUp();
    this.setUpCalled = true;
  }

  tearDown() {
    super.tearDown();
    this.tearDownCalled = true;
  }
}

describe('Animation', () => {
  const START_TIME = 1;
  const END_TIME = 2;
  let animation: TestAnimation;

  beforeEach(() => {
    animation = new TestAnimation();
    animation.startTime = START_TIME;
    animation.endTime = END_TIME;
    
    animation.setUpCalled = false;
    animation.tearDownCalled = false;
    animation.beforeCalled = false;
    animation.afterCalled = false;
    animation.animationCalls = [];
  });

  it('handles time before start', () => {
    animation.update(START_TIME - 0.5);
    expect(animation.setUpCalled).toBe(false);
    expect(animation.beforeCalled).toBe(false);
    expect(animation.animationCalls).toHaveLength(0);
  });

  it.skip('initializes at start time', () => {
    animation.update(START_TIME);
    expect(animation.setUpCalled).toBe(true);
    expect(animation.beforeCalled).toBe(true);
    expect(animation.animationCalls).toEqual([[0, 0]]);
  });

  it.skip('calculates fractional deltas correctly', () => {
    animation.update(START_TIME + 0.3);
    animation.update(START_TIME + 0.7);
    
    expect(animation.animationCalls).toEqual([
      [0.3, 0.3],
      [0.7, 0.4]
    ]);
  });

  it.skip('handles exact end time', () => {
    animation.update(END_TIME);
    expect(animation.tearDownCalled).toBe(true);
    expect(animation.afterCalled).toBe(true);
    expect(animation.animationCalls).toEqual([[1, 1]]);
  });

  it('finalizes after end time', () => {
    animation.update(END_TIME + 0.5);
    animation.update(END_TIME + 1);
    expect(animation.animationCalls).toHaveLength(1);
  });
}); 