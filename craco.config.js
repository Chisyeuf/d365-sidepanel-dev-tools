const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')

const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const smp = new SpeedMeasurePlugin()

module.exports = {
    webpack: {
        configure: (webpackConfig, { env, paths }) => {
            const isEnvDevelopment = env === 'development'
            console.log('isDev', isEnvDevelopment)
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
                      console.log("entrypoints",entrypoints)
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
            })

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
                plugins: [...webpackConfig.plugins, new ForkTsCheckerWebpackPlugin()].filter(
                    Boolean
                ),
                entry: {
                    spdevtools: [
                        isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
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
