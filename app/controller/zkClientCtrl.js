'use strict';
const _ = require('lodash');

const Controller = require('egg').Controller;

class ZkClient extends Controller {
  // async index() {
  //   this.ctx.body = 'hi, egg';
  // }
  async index() {
    const path = _.get(this.ctx.query, 'path');
    const addr = _.get(this.ctx.query, 'addr');
    const zkChildren = await this.ctx.service.zkClientSev.getChildren(addr, path);
    if (zkChildren === 'time out') {
      this.ctx.status = 500;
    } else {
      this.ctx.body = zkChildren;
    }
  }

  async zkHistory() {
    const zkChildren = await this.ctx.service.zkClientSev.getHistory();
    this.ctx.body = zkChildren;
  }

  async addNode(ctx) {
    const result = await this.ctx.service.zkClientSev.addNode(ctx.request.body);
    if (result === 'time out') {
      this.ctx.status = 500;
    }
  }
}

module.exports = ZkClient;
