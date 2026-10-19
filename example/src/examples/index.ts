import { variants } from './01-variants';
import { patterns } from './02-patterns';
import { promise } from './03-promise';
import { custom } from './04-custom';
import { presets, springs } from './05-animation';
import { positions, shape } from './06-shape-position';
import { stackMotion, stackPush } from './07-stack';
import { features } from './08-features';

export type { DemoItem, DemoSection } from './types';

/** Shown with <ToastProvider mode="morph"> */
export const MORPH_SECTIONS = [variants, patterns, promise, custom, presets, springs, shape, positions, features];

/** Shown with <ToastProvider mode="stack"> */
export const STACK_SECTIONS = [stackPush, stackMotion];
