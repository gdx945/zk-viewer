'use strict';
const Service = require('egg').Service;
const zookeeper = require('node-zookeeper-client');
const fs = require('fs');
const zkAddrFile = 'app/temp/zkAddr.json';
const _ = require('lodash');

let zkAddrList = [];

class ZkClient extends Service {

  async getHistory() {
    return new Promise((resolve, reject) => {
      var result = JSON.parse(fs.readFileSync(zkAddrFile));
      resolve(result);
    })
  }
  
  async getChildren(addr, path) {
    if (_.isEmpty(zkAddrList)) {
      zkAddrList = await this.ctx.service.zkClientSev.getHistory();
    }
    return new Promise((resolve, reject) => {
      var connected = false;
      var client = zookeeper.createClient(addr, { sessionTimeout: 5000 });
      client.once('connected', function () {
        connected = true;
        console.log('Connected to ZooKeeper. ' + addr);
        client.getChildren(path, (error, children, stat) => {
          if (error) {
              console.log( 'Failed to list children of %s due to: %s.', path, error );
          }
          let result = [];
          if (_.isEmpty(children)) {
            resolve(null);
          }
          children.forEach((element, idx) => {
            let item = {path: element};
            if (!path.endsWith('/')) {
              path = path + '/';
            }
            client.getData(path + element, function(event) {
                  console.log('Got event: %s.', event);
              }, function(error, data, stat) {
                  if (error) {
                    console.log(error.stack);
                  }
                  item.data = data;
                  item.stat = stat;
                  result.push(item);
                  if (idx === children.length - 1) {
                    client.close();
                    resolve(result);
                  }
              }
            )
          });
        });
      });
      client.connect();
      setTimeout(() => {
        if (!connected) {
          client.close();
          resolve('time out');
        }
      }, 6000)
    })
  }

  async addNode(nodeParam) {
    // let addr = nodeParam.addr;
    let addr = '127.0.0.1:2181';
    let path = nodeParam.path;
    return new Promise((resolve, reject) => {
      var connected = false;
      var client = zookeeper.createClient(addr);
      var id = new zookeeper.Id('ip', addr);
      var acl = zookeeper.ACL.OPEN_ACL_UNSAFE;
      
      client.once('connected', async function () {
        // 获得config节点数据
        let childList = [];
        await new Promise((resolve, reject) => {
          client.getChildren('/', (error, children, stat) => {
            childList = children;
            resolve();
          });
        });
        client.create(
          '/xx',
          // new Buffer.alloc(4, 'test'),
          // acl,
          zookeeper.CreateMode.PERSISTENT,
          function (error, path) {
              if (error) {
                  console.log(error.stack);
              }
              console.log('Node: %s is created.', path);
              client.close();
              resolve();
          }
        );
      })
      client.connect();
      // client.once('connected', function () {
      //   client.create(
      //     '/xx/test',
      //     new Buffer('test'),
      //     zookeeper.ACL.OPEN_ACL_UNSAFE,
      //     function (error, path) {
      //         if (error) {
      //             console.log(error.stack);
      //             return;
      //         }
      //         console.log('Node: %s is created.', path);
      //         client.close();
      //         resolve();
      //     }
      //   );
      // })
      // client.connect();
      // setTimeout(() => {
      //   if (!connected) {
      //     client.close();
      //     resolve('time out');
      //   }
      // }, 6000)
    })
  }
}

module.exports = ZkClient;
