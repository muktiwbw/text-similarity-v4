const path = require('path')
const webpack = require('webpack')

module.exports = {
    entry: {
        app: [
            "babel-polyfill",
            "./js/demo.js"
        ]
    },
    output: {
        path: path.resolve(__dirname, "dist/js"),
        filename: "app.bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    query: {
                        presets: [
                            "env",
                            "stage-0"
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            akarata: 'akarata'
        })
    ]
}