const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();

module.exports = {
    webpack: {
        configure: (webpackConfig, {env, paths}) => {
            return smp.wrap({
                ...webpackConfig,
                entry: {
                    main: [env === 'development' && require.resolve('react-dev-utils/webpackHotDevClient'),paths.appIndexJs].filter(Boolean),
                    content: './src/content.tsx',
                    options: './src/screens/options.tsx'
                },
                output: {
                    ...webpackConfig.output,
                    filename: 'static/js/[name].js',
                    asyncChunks: true,
                },
                optimization: {
                    ...webpackConfig.optimization,
                    runtimeChunk: false,
                }
            })
        },
    }
 }