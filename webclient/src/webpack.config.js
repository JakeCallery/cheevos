'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        indexEntry:'./js/indexPage.js',
        invitedEntry:'./js/invitedPage.js',
        loginEntry:'./js/loginPage.js',
        apitestEntry:'./js/apitestPage.js',
        teamEntry:'./js/teamPage.js',
        createBadgeEntry:'./js/createBadgePage.js',
        profileEntry:'./js/profilePage.js'
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
            filename: 'index.html',
            template: 'html/index.html',
            hash: true,
            chunks: [
                'indexEntry'
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
            filename: 'login.html',
            template: 'html/login.html',
            hash: true,
            chunks: [
                'loginEntry'
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

        new HtmlWebpackPlugin({
            filename: 'createBadge.html',
            template: 'html/createBadge.html',
            hash: true,
            chunks: [
                'createBadgeEntry'
            ]
        }),

        new HtmlWebpackPlugin({
            filename: 'profile.html',
            template: 'html/profile.html',
            hash: true,
            chunks: [
                'profileEntry'
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