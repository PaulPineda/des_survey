import {resolve} from 'path';

export default env => {
  return {
    context: resolve('src'),
    entry: './index.js',
    output: {
      filename: 'DesSurvey.js',
      path: resolve('dist'),
      publicPath: '/dist/',
      pathinfo: !env.prod
    },
    devtool: env.prod ? 'source-map': 'eval',
    module: {
      loaders: [
        {test:/\.js$/, loaders: ['babel-loader'], exclude: /node_modules/}
      ]
    }
  };
};
