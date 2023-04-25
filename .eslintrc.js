module.exports = {
  globals: {
    fish: 'readonly',
    ht: 'readonly',
    portal: 'readonly',
    $: 'readonly',
  },
  // extends: '@whalecloud/eslint-config',
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    '@whalecloud/eslint-config',
    // 'plugin:vue/vue3-recommended',
    'plugin:vue/recommended', // Use this if you are using Vue.js 2.x.
  ],
  rules: {
    'vue/max-attributes-per-line': [
      0,
      {
        singleline: {
          max: 1,
        },
        multiline: {
          max: 1,
        },
      },
    ],
    'vue/attribute-hyphenation': [
      0,
      'never',
      {
        ignore: ['custom-prop'],
      },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'never',
          component: 'never',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'max-len': 'off',
    'vue/max-len': [
      'error',
      {
        code: 180,
        template: 1500,
        tabWidth: 2,
        comments: 180,
        ignorePattern: '',
        ignoreComments: false,
        ignoreTrailingComments: false,
        ignoreUrls: false,
        ignoreStrings: false,
        ignoreTemplateLiterals: false,
        ignoreRegExpLiterals: false,
        ignoreHTMLAttributeValues: false,
        ignoreHTMLTextContents: false,
      },
    ],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/v-slot-style': [
      'error',
      {
        atComponent: 'v-slot',
        default: 'longform',
        named: 'longform',
      },
    ],
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['vue'],
};
