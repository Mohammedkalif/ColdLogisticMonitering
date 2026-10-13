/**
 * Flat components barrel.
 *
 * Sub-modules keep their own barrels (`ui`, `cards`, `charts`, `tables`,
 * `forms`, `layout`). This re-export lets feature code import shared
 * components from `@/components` without deep paths, matching the flat
 * `@/hooks` / `@/services` / `@/types` barrels. No component logic changed.
 */
export * from './cards';
export * from './charts';
export * from './forms';
export * from './layout';
export * from './tables';
export * from './ui';
