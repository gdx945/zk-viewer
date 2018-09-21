'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  // async index() {
  //   this.ctx.body = 'hi, egg';
  // }
  async index() {
    const { ctx } = this;
      // render user.html
    await ctx.render('index');
  }
}

module.exports = HomeController;
