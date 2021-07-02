const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const WebpackPWAPlugin = require('webpack-pwa-manifest')
const { GenerateSW } = require('workbox-webpack-plugin')

const mode = process.env.NODE_ENV || 'development'
const isProduction = mode === 'production'
const package = require('./package.json')

const StyleExportLoader = isProduction
  ? MiniCssExtractPlugin.loader
  : 'style-loader'

module.exports = {
  mode,
  entry: {
    app: {
      import: './src/app.jsx',
      dependOn: 'vendors',
    },
    'app-ar': {
      import: './src/app-ar.jsx',
      dependOn: 'vendors',
    },
    vendors: {
      import: Object.keys(package.dependencies),
      filename: 'js/vendors.js',
    },
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'js/[name].[contenthash].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        include: path.join(__dirname, 'src'),
        loader: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: [StyleExportLoader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(ttf|svg|eot|woff2?)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[contenthash][ext]',
        },
      },
      {
        test: /\.glb$/i,
        type: 'asset/resource',
        generator: {
          filename: 'models/[contenthash][ext]',
        },
      },
      {
        test: /\.mp3$/i,
        type: 'asset/resource',
        generator: {
          filename: 'audio/[contenthash][ext]',
        },
      },
      {
        test: /\.wasm(\.bin)?$/i,
        type: 'asset/resource',
        generator: {
          filename: '[contenthash][ext]',
        },
      },
      {
        test: /\.(jpg|png)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[contenthash][ext]',
        },
      },
      {
        test: path.join(__dirname, 'libs', 'js-aruco', 'svd.js'),
        loader: 'exports-loader',
        options: {
          type: 'module',
          exports: 'default|SVD',
        },
      },
      {
        test: [
          path.join(__dirname, 'libs', 'js-aruco', 'posit1.js'),
          path.join(__dirname, 'libs', 'js-aruco', 'posit2.js'),
        ],
        use: [
          {
            loader: 'exports-loader',
            options: {
              type: 'module',
              exports: 'default|POS',
            },
          },
          {
            loader: 'imports-loader',
            options: {
              type: 'module',
              imports: 'default|js-aruco/svd.js|SVD',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'js-aruco': path.join(__dirname, 'libs', 'js-aruco'),
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
      '...',
    ],
  },
  devtool: isProduction ? false : 'eval-source-map',
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/style.[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      excludeChunks: ['app-ar'],
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      excludeChunks: ['app'],
      filename: 'ar.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'public'),
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/*.html'],
          },
        },
      ],
    }),
    new WebpackPWAPlugin({
      name: package.name,
      short_name: package.short_name,
      start_url: '/#/qrscan',
      description: package.description,
      background_color: '#ffffff',
      theme_color: '#309242',
      inject: true,
      ios: true,
      icons: [
        {
          src: path.join(__dirname, 'public', 'icon.png'),
          sizes: [192, 512],
          ios: true,
        },
        {
          src: path.join(__dirname, 'public', 'icon.png'),
          size: '512x512',
          purpose: 'maskable',
        },
      ],
    }),
    new GenerateSW({
      skipWaiting: true,
    }),
  ],
}
