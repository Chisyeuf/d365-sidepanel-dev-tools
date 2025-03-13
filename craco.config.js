const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
// const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
// const smp = new SpeedMeasurePlugin()

const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {

            const target = process.env.REACT_APP_TARGET || 'chrome';
            console.log('TARGET', target);

            const isEnvDevelopment = env === 'development'
            console.log('isDev', isEnvDevelopment);
            // console.log(webpackConfig.plugins.map((p) => p.constructor))

            webpackConfig.plugins = webpackConfig.plugins.map((p) => {
                if (p.constructor.name !== 'WebpackManifestPlugin') {
                    return p
                }
                return new WebpackManifestPlugin({
                    fileName: 'asset-manifest.json',
                    publicPath: paths.publicUrlOrPath,
                    generate: (seed, files, entrypoints) => {
                        const manifestFiles = files.reduce((manifest, file) => {
                            manifest[file.name] = file.path;
                            return manifest;
                        }, seed);
                        // const entrypointFiles = entrypoints.main.filter(
                        //     (fileName) => !fileName.endsWith('.map')
                        // )
                        const entrypointFiles = {}
                        
                        Object.keys(entrypoints).forEach((entrypoint) => {
                            entrypointFiles[entrypoint] = entrypoints[entrypoint].filter(
                                (fileName) => !fileName.endsWith('.map')
                            )
                        })

                        return {
                            files: manifestFiles,
                            entrypoints: entrypointFiles,
                        };
                    },
                })
            });

            const copyWebpackPlugin = new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, 'public', `manifest.${target}.json`),
                        to: path.resolve(webpackConfig.output.path, 'manifest.json'),
                        transform: (content) => {
                            let jsonString = content.toString();
                            Object.entries(process.env).forEach(([key, value]) => {
                                jsonString = jsonString.replaceAll(`{${key}}`, value);
                            });
                            return jsonString;
                        }
                    },
                ],
            });

            const newWebpack = {
                ...webpackConfig,
                mode: isEnvDevelopment ? 'development' : 'production',
                devtool: env === 'development' ? 'cheap-module-source-map' : 'source-map',
                watch: true,
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
                plugins: [...webpackConfig.plugins, new ForkTsCheckerWebpackPlugin(), copyWebpackPlugin].filter(
                    Boolean
                ),
                entry: {
                    [process.env.FILE_NAME]: [
                        isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
                        paths.appIndexJs
                    ].filter(Boolean),
                    [`${process.env.FILE_NAME}.content`]: './src/content.tsx',
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
