// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'dist/',
      'build/',
      'coverage/',
      'node_modules/',
      '.vscode/',
      '.idea/',
      '.env',
      '.env.*',
      'test/',
      '*.spec.ts',
      '*.test.ts',
      '**/*.spec.ts',
      '**/*.test.ts',
      'src/test-*.ts',
      'src/api-test.ts',
      'src/demo-*.ts',
      'src/seed-*.ts',
      'src/init-admin.ts',
      'src/seeds/',
      '*.generated.ts',
      'prisma/generated/',
      '*.log',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Airbnb风格规则
      // 基础规则
      'no-console': 'off', // 暂时关闭，后续使用logger替换
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'off', // 使用TypeScript的规则替代
      'no-use-before-define': 'off', // 使用TypeScript的规则替代
      'no-shadow': 'off', // 使用TypeScript的规则替代
      'no-redeclare': 'off', // 使用TypeScript的规则替代
      
      // 代码风格规则
      'camelcase': ['error', { properties: 'never' }],
      'func-names': 'off', // 关闭，装饰器内部函数不需要命名
      'no-underscore-dangle': ['error', { allow: ['_id'] }],
      'no-param-reassign': 'off', // 暂时关闭，Fastify装饰器需要
      'no-plusplus': 'off',
      'no-restricted-syntax': [
        'error',
        'ForInStatement',
        'LabeledStatement',
        'WithStatement',
      ],
      'prefer-destructuring': 'off', // 暂时关闭
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-parens': ['error', 'always'],
      'arrow-spacing': 'error',
      'no-confusing-arrow': 'error',
      'prefer-arrow-callback': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-constructor': 'off', // 使用TypeScript的规则替代
      'class-methods-use-this': 'off',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'no-new-object': 'error',
      'object-shorthand': 'error',
      'quote-props': ['error', 'as-needed'],
      'no-prototype-builtins': 'error',
      'no-array-constructor': 'error',
      'array-callback-return': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'radix': 'error',
      'no-unneeded-ternary': 'error',
      'no-nested-ternary': 'error',
      'no-mixed-operators': 'error',
      'nonblock-statement-body-position': 'error',
      'brace-style': ['error', '1tbs'],
      'spaced-comment': ['error', 'always'],
      'indent': 'off', // Prettier处理
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'newline-per-chained-call': ['error', { ignoreChainWithDepth: 3 }],
      'no-whitespace-before-property': 'error',
      'padded-blocks': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'max-len': ['error', { code: 100, ignoreUrls: true, ignoreStrings: true }],
      'comma-style': ['error', 'last'],
      'comma-dangle': ['error', 'always-multiline'],
      'semi': ['error', 'always'],
      'no-new': 'error',
      'no-extra-bind': 'error',
      'no-useless-call': 'error',
      'no-useless-return': 'error',
      'no-unused-expressions': 'error',
      'no-sequences': 'error',
      'yoda': 'error',
      'no-throw-literal': 'error',
      'no-loop-func': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-multi-spaces': 'error',
      'no-multi-str': 'error',
      'no-return-assign': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-useless-concat': 'error',
      'no-void': 'off', // 允许使用void来忽略Promise
      'no-with': 'error',
      'no-new-require': 'error',
      'global-require': 'off',
      'handle-callback-err': 'error',
      'no-mixed-requires': 'error',
      
      // TypeScript特定规则
      '@typescript-eslint/no-explicit-any': 'off', // 暂时关闭，逐步改进
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off', // 暂时关闭，逐步改进
      '@typescript-eslint/no-unsafe-assignment': 'off', // 暂时关闭，逐步改进
      '@typescript-eslint/no-unsafe-call': 'off', // 暂时关闭，逐步改进
      '@typescript-eslint/no-unsafe-member-access': 'off', // 暂时关闭，逐步改进
      '@typescript-eslint/no-unsafe-return': 'off', // 暂时关闭，逐步改进
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        }
      ],
      '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],
      '@typescript-eslint/require-await': 'off', // 暂时关闭，有些async函数是为了返回Promise
      '@typescript-eslint/only-throw-error': 'off', // 暂时关闭，有bug
    },
  },
);