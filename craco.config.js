const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            // const newWebpack = smp.wrap({
            //     ...webpackConfig,
            //     module: {
            //         ...webpackConfig.module,
            //         rules: [
            //             {
            //                 test: /\.tsx?$/,
            //                 loader: 'ts-loader',
            //                 // add transpileOnly option if you use ts-loader < 9.3.0
            //                 options: {
            //                     transpileOnly: true
            //                 }
            //             },
            //             webpackConfig.module.rules[1]
            //         ]
            //     },
            //     plugins: [
            //         ...webpackConfig.plugins,
            //         new ForkTsCheckerWebpackPlugin(),
            //     ],
            //     entry: {
            //         main: [
            //             env === 'development' &&
            //                 require.resolve('react-dev-utils/webpackHotDevClient'),
            //             paths.appIndexJs
            //         ].filter(Boolean),
            //         content: './src/content.tsx',
            //         options: './src/screens/options.tsx',
            //         background: './src/background.tsx'
            //     },
            //     output: {
            //         ...webpackConfig.output,
            //         filename: 'static/js/[name].js',
            //         asyncChunks: true
            //     },
            //     optimization: {
            //         ...webpackConfig.optimization,
            //         runtimeChunk: false
            //         // minimize: false,
            //     }
            // })
            const newWebpack = {
                ...webpackConfig,
                module: {
                    ...webpackConfig.module,
                    rules: [
                        {
                            test: /\.tsx?$/,
                            loader: 'ts-loader',
                            // add transpileOnly option if you use ts-loader < 9.3.0
                            options: {
                                transpileOnly: true
                            }
                        },
                        webpackConfig.module.rules[1]
                    ]
                },
                plugins: [
                    ...webpackConfig.plugins,
                    new ForkTsCheckerWebpackPlugin(),
                ],
                entry: {
                    main: [
                        env === 'development' &&
                            require.resolve('react-dev-utils/webpackHotDevClient'),
                        paths.appIndexJs
                    ].filter(Boolean),
                    content: './src/content.tsx',
                    options: './src/screens/options.tsx',
                    background: './src/background.tsx'
                },
                output: {
                    ...webpackConfig.output,
                    filename: 'static/js/[name].js',
                    asyncChunks: true
                },
                optimization: {
                    ...webpackConfig.optimization,
                    runtimeChunk: false
                    // minimize: false,
                }
            }

            return newWebpack
        }
    }
}
