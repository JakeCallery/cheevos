'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        landingEntry:'./js/landingPage.js',
        appEntry:'./js/appPage.js',
        invitedEntry:'./js/invitedPage.js',
        invitedNotLoggedInEntry:'./js/invitedNotLoggedInPage.js',
        apitestEntry:'./js/apitestPage.js',
        teamEntry:'./js/teamPage.js'
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
        rules: [
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
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: true,
                            sourceMap: false
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ],
    },

    plugins: [
        new HtmlWebpackPlugin({
            filename: 'app.html',
            template: 'html/app.html',
            hash: true,
            chunks: [
                'appEntry'
            ]
        }),

        new HtmlWebpackPlugin({
            filename: 'apitest.html',
            template: 'html/apitest.html',
            hash: true,
            chunks: [
                'apitestEntry'
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

        new HtmlWebpackPlugin({
            filename: 'invitedNotLoggedIn.html',
            template: 'html/invitedNotLoggedIn.html',
            hash: true,
            chunks: [
                'invitedNotLoggedInEntry'
            ]
        }),

        new HtmlWebpackPlugin({
            filename: 'landing.html',
            template: 'html/landing.html',
            hash: true,
            chunks: [
                'landingEntry'
            ]
        }),

        new HtmlWebpackPlugin({
            filename: 'team.html',
            template: 'html/team.html',
            hash: true,
            chunks: [
                'teamEntry'
            ]
        }),

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                screw_ie8: true,
                warnings: false
            },
            sourceMap: true
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