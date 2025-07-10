export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        process: "readonly",
        __dirname: "readonly"
      }
    },
    rules: {
      "react/prop-types": "off"
    }
  }
];
