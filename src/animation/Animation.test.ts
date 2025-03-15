import { Animation } from './Animation.js';


class TestAnimation extends Animation {
  public setUpCalled = false;
  public tearDownCalled = false;
  public animationCalls: Array<[number, number]> = [];
  public beforeCalled = false;
  public afterCalled = false;
  
  constructor() {
    super(
      (elapsedTime: number, deltaTime: number) => {
        this.animationCalls.push([elapsedTime, deltaTime]);
      },
      { 
        before: (() => { this.beforeCalled = true; }) as any,
        after: (() => { this.afterCalled = true; }) as any
      }
    );
  }

  setUp(): void {
    super.setUp();
    this.setUpCalled = true;
  }

  tearDown(): void {
    super.tearDown();
    this.tearDownCalled = true;
  }
}

// Test suite
describe('Animation', () => {
  let animation: TestAnimation;

  beforeEach(() => {
    animation = new TestAnimation();
    animation.startTime = 1000;  // 1 second
    animation.endTime = 2000;    // 2 seconds
    
    // Reset test state
    animation.setUpCalled = false;
    animation.tearDownCalled = false;
    animation.beforeCalled = false;
    animation.afterCalled = false;
    animation.animationCalls = [];
  });

  test('should do nothing when time < startTime', () => {
    animation.update(500);  // 500ms < startTime(1000ms)
    
    expect(animation.setUpCalled).toBe(false);
    expect(animation.beforeCalled).toBe(false);
    expect(animation.animationCalls.length).toBe(0);
  });

  test('should call setUp and before when time = startTime', () => {
    animation.update(1000);  // 1000ms = startTime
    
    expect(animation.setUpCalled).toBe(true);
    expect(animation.beforeCalled).toBe(true);
  });

  test('should run animation function with correct deltas', () => {
    animation.update(1300);  // startTime + 300ms
    animation.update(1700);  // startTime + 700ms (400ms after first call)
    
    expect(animation.animationCalls.length).toBe(2);
    expect(animation.animationCalls[0]![1]).toBeCloseTo(0.3, 1);  // 300ms/1000ms = 0.3
    expect(animation.animationCalls[1]![1]).toBeCloseTo(0.4, 1);  // 400ms difference = 0.4
  });

  test('should call tearDown and after when time > endTime', () => {
    animation.update(2500);  // 2500ms > endTime(2000ms)
    
    expect(animation.tearDownCalled).toBe(true);
    expect(animation.afterCalled).toBe(true);
  });
}); 