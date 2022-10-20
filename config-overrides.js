const {
    override,
    addWebpackPlugin,
    addBabelPlugin,
    addBabelPlugins,
    disableEsLint
} = require('customize-cra')
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

const { paths: rewiredPaths } = require('react-app-rewired')
const { scriptVersion } = rewiredPaths
const paths = require(`${scriptVersion}/config/paths`)
const babelConfig = require('./babel.config')

const isDevelopment = process.env.NODE_ENV !== 'production'

module.exports = override(
    // Custom config override
    (config) => {
        // Disable eslint
        config.module.rules.splice(1, 1)

        // Disable type checking
        paths.appTsConfig = undefined

        return config
    },

    // Babel import optimize
    addBabelPlugins(...babelConfig.plugins),

    // Disable EsLint
    disableEsLint(),
    // React Refresh
    isDevelopment && addBabelPlugin('react-refresh/babel'),
    isDevelopment && addWebpackPlugin(new ReactRefreshWebpackPlugin()),

    // Adding progressbar plugin
    isDevelopment && addWebpackPlugin(new SimpleProgressWebpackPlugin({ format: 'compact' }))
)
