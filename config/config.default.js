'use strict';

const path = require('path');
module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1532153621557_4815';

  // add your config here
  // 配置需要的中间件，数组顺序即为中间件的加载顺序
  config.middleware = [ 'gzip' ];

  // 配置 gzip 中间件的配置
  config.gzip = {
    threshold: 1024, // 小于 1k 的响应体不压缩
  };

  config.view = {
    root: [
      path.join(appInfo.baseDir, 'app/public')
    ].join(','),
    defaultExtension: '.html',
    defaultViewEngine: 'nunjucks',
    mapping: {'.tpl': 'nunjucks'}
  };

  config.static = {
    prefix: '/',
    maxAge: 31536000,
    gzip: true
  };

  config.security = {
    xframe: {
      enable: false,
    },
    // 配合cors
    domainWhiteList: [ 'https://gdx945.gitee.io', 'https://gdx945.github.io', 'http://gdx945.html-5.me', 'http://gdx945.ztesoft.io' ],
    csrf: {
      enable: false,
      cookieName: 'csrfToken'
    }
  };

  config.cors = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true
  };
  
  return config;
};
