module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended"
  ],
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    }
  ],
  rules: {
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
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    project: "./tsconfig.json",
    extraFileExtensions: [".svelte"]
  },
  plugins: ["import", '@typescript-eslint', "prettier"],
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    },  
  },
  ignorePatterns: ['**/node_modules/**', '.eslintrc.js']  
}
