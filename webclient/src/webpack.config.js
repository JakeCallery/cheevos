'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        indexEntry:'./js/index.js',
        invitedEntry:'./js/invited.js'
    },

    output: {
        filename: '[name].js',
        path: __dirname + '/../dist',
        publicPath: '/'
    },

    resolve: {
        modules: [
            'node_modules',
            './js',
            './js/jacjslibes6'
        ]
    },

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
                exclude: /node_modules/
            }
        ],

    },

    plugins: [
        new HtmlWebpackPlugin({
            template: 'html/index.html',
            hash: true,
            chunks: [
                'indexEntry'
            ]
        }),

        new HtmlWebpackPlugin({
            filename: 'invited.html',
            template: 'html/invited.html',
            hash: true,
            chunks: [
                'invitedEntry'
            ]
        }),

        function() {
            this.plugin('watch-run', function(watching, callback) {
                console.log('Begin Compile At ' + new Date());
                callback();
            })
        }
    ],

    devtool: 'source-map'

};