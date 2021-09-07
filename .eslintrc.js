'use strict';

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript/base'
  ],
  'rules': {
    'no-plusplus': 'off',
    'no-continue': 'off',
    'max-len': 'off',
    'import/no-named-as-default': 'off',
    'import/prefer-default-export': 'off',
  }
};
