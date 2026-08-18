import LottieDefaultImport from 'lottie-react';

type MaybeNamespaced<T> = T & { default?: T };

/**
 * lottie-react ships both a UMD build (`main`) and an ESM one (`module`). In
 * dev, Vite pre-bundles it from the UMD build with `needsInterop`, and the
 * resulting chunk ends in `export default require_index_umd()` — so the default
 * export is the whole module object, `{ default, useLottie, ... }`, rather than
 * the component. Rendering it throws "Element type is invalid: expected a
 * string ... but got: object".
 *
 * Production builds go through Rollup, which resolves the ESM build and gives
 * the component directly. Unwrapping a nested `default` covers both.
 */
const Lottie =
    (LottieDefaultImport as MaybeNamespaced<typeof LottieDefaultImport>).default ??
    LottieDefaultImport;

export default Lottie;
