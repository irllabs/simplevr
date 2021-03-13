module.exports = {
    parser: '@babel/eslint-parser',
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'plugin:react/recommended',
        'airbnb',
    ],
    plugins: [
        'react',
    ],
    rules: {
        indent: ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-indent': ['error', 4],
        'arrow-body-style': ['error', 'always'],
        'object-shorthand': ['error', 'never'],
        'react/prop-types': ['off'],
        'max-len': ['error', { code: 160 }],
        'react/jsx-props-no-spreading': ['off'],
        'jsx-a11y/click-events-have-key-events': ['off'],
        'jsx-a11y/no-noninteractive-element-interactions': ['off'],
        'jsx-a11y/media-has-caption': ['off'],
        'jsx-a11y/no-static-element-interactions': ['off'],
        'no-param-reassign': ['off'],
    },
};
