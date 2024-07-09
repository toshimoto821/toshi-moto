# scripts

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build scripts` to build the library.

## Running unit tests

Run `nx test scripts` to execute the unit tests via [Vitest](https://vitest.dev/).

# Todo

eslint plugin node has issues
had to remove missing dependency check from .eslintrc.json

```json
{
  "files": ["*.json"],
  "parser": "jsonc-eslint-parser",
  "rules": {
    "@nx/dependency-checks": [
      "error",
      {
        "ignoredFiles": ["{projectRoot}/vite.config.{js,ts,mjs,mts}"]
      }
    ]
  }
}
```
