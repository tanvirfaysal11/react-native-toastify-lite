// Minimal Reanimated mock: pure-JS hooks that just evaluate their worklets
// once. Enough for a smoke test — no worklets/native, no babel plugin needed.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  const create = (Comp) => React.forwardRef((props, ref) => React.createElement(Comp, { ...props, ref }));

  const Animated = {
    View: create(View),
    Text: create(Text),
    createAnimatedComponent: (Comp) => create(Comp),
  };

  const Easing = {
    out: (f) => f,
    in: (f) => f,
    inOut: (f) => f,
    bezier: () => () => {},
    linear: () => {},
    cubic: () => {},
    quad: () => {},
  };

  return {
    __esModule: true,
    default: Animated,
    Animated,
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: (fn) => (typeof fn === 'function' ? fn() : fn),
    useAnimatedProps: (fn) => (typeof fn === 'function' ? fn() : fn),
    cancelAnimation: () => {},
    Easing,
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    interpolate: (v, input, output) => output[0],
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    withDelay: (_ms, v) => v,
    withSequence: (...args) => args[args.length - 1],
    withSpring: (v) => v,
    withTiming: (v) => v,
    withRepeat: (v) => v,
  };
});

// react-native-svg renders native views; mock to plain Views in Jest.
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const mock = (name) => {
    const C = (props) => React.createElement(View, props);
    C.displayName = name;
    return C;
  };
  const Svg = mock('Svg');
  return {
    __esModule: true,
    default: Svg,
    Svg,
    Path: mock('Path'),
    Circle: mock('Circle'),
    Line: mock('Line'),
    Rect: mock('Rect'),
    G: mock('G'),
    Defs: mock('Defs'),
    LinearGradient: mock('LinearGradient'),
    Stop: mock('Stop'),
  };
});
