'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/data/zkClient/children', controller.zkClientCtrl.index);
  router.get('/data/zkHistory', controller.zkClientCtrl.zkHistory);
  router.post('/data/node', controller.zkClientCtrl.addNode);
};
