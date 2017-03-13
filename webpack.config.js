var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: "./src/entry.js",
  output: {
    path: __dirname,
    filename: "app/js/bundle.js"
  },
  "target": "atom",
  plugins: [
    new webpack.ProvidePlugin({
      hljs: "hightlightjs",
      markdownit: "markdownit",
      CodeMirror: "codemirrorjs"
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      minimize: true,
      sourceMap: false,
      compress: {
        warnings: false,
      },
      output: {
        ascii_only: true
      }
    }),
    new ExtractTextPlugin({ filename: "./app/css/style.css", allChunks: true })
  ],
  module: {
    rules: [
      { enforce: 'pre', test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" }) }
    ],
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" }) }
    ]
  },
  resolve: {
    modules: ["node_modules"],
    alias: {
      hightlightjs: "highlight.js/lib/highlight.js",
      markdownit: "markdown-it/index.js",
      codemirrorjs: "codemirror/lib/codemirror.js",
      codemirrorjs_overlay: "codemirror/addon/mode/overlay.js",
      codemirrorjs_javascript: "codemirror/mode/javascript/javascript.js",
      codemirrorjs_gfm: "codemirror/mode/gfm/gfm.js",
      codemirrorjs_markdown: "codemirror/mode/markdown/markdown.js"
    }
  }
}