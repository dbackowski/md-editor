const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  target: "electron-main",
  mode: "production",
  entry: "./src/entry.js",
  output: {
    path: __dirname,
    filename: "app/js/bundle.js"
  },
  performance: {
    hints: false
  },
  plugins: [
    new webpack.ProvidePlugin({
      hljs: "hightlightjs",
      markdownit: "markdownit",
      CodeMirror: "codemirrorjs"
    }),
  ],
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        uglifyOptions: {
          output: {
            ascii_only: true
          }
        }
      }),
    ]
  },
  resolve: {
    modules: ["node_modules"],
    extensions: ['.js', '.css'],
    alias: {
      hightlightjs: "highlight.js/lib/highlight.js",
      markdownit: "markdown-it/index.js",
      codemirrorjs: "codemirror/lib/codemirror.js",
      codemirrorjs_overlay: "codemirror/addon/mode/overlay.js",
      codemirrorjs_javascript: "codemirror/mode/javascript/javascript.js",
      codemirrorjs_gfm: "codemirror/mode/gfm/gfm.js",
      codemirrorjs_markdown: "codemirror/mode/markdown/markdown.js"
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          path.resolve('node_modules'),
        ],
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  }
};
