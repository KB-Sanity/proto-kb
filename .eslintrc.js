module.exports = {
  env: {
    "browser": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:prettier/recommended"
  ],
  "overrides": [
    {
      "files": ["**/*.svelte"],
      "processor": "svelte3/svelte3"
    }
  ],
  "rules": {
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-this-alias": [
      "error",
      {
        "allowDestructuring": false,
        "allowedNames": ["self"]
      }
    ],
    '@typescript-eslint/unbound-method': 'off',
    "prettier/prettier": "error",
  },
  "parserOptions": {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json",
    "extraFileExtensions": [".svelte"]
  },
  plugins: ["import", "svelte3", '@typescript-eslint', "prettier"],
  settings: {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    },
    'svelte3/typescript': require('typescript'),
    'svelte3/ignore-styles': () => true
  },
  ignorePatterns: ['node_modules', '.eslintrc.js']  
}
