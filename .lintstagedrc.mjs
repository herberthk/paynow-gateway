/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
/**
 * lint-staged config.
 *
 * Notes:
 * - tsc: wrapping in a function ensures staged file paths are NOT appended
 *   to the command. `tsc --noEmit <files>` ignores tsconfig.json, which
 *   defeats the purpose. The function receives the file list but returns
 *   a fixed command so tsc always uses tsconfig.json.
 * - eslint: lint-staged appends each staged file path, so eslint runs only
 *   on changed files and auto-fixes them before the commit lands.
 */
const config = {
  "**/*.{js,ts,tsx}": [
    // Full type-check against tsconfig.json (file list ignored intentionally)
    () => "node_modules\\.bin\\tsc.exe --noEmit",
    // Lint + auto-fix only staged files
    "eslint --fix",
  ],
};

export default config;
