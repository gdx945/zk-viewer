import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Tree, Input, Select, Icon, Tabs, Card, Button } from 'antd';
import request from '../utils/request';

// const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;
const Search = Input.Search;
const _ = require('lodash');
const Option = Select.Option;
const TabPane = Tabs.TabPane;

export default class MyTree extends Component {
  state = {
    treeData: [],
    filterTheme: 'twoTone',
    objKeys: [],
    selectedKeys: [],
    selectedNode: {},
    expandedKeys: ['zk-address'],
    searchType: 'service',
    nodeData: '',
    dubboData: '',
    dubboConfData: {display: 'none', weight: 100, enabled: true}
  }

  zkAddress = '';
  normalRegistry = [];
  treeData = {};

  handleChange = (value) => {
    let searchType = value;
    this.setState({
      searchType
    });
  }

  selectBefore = (
    <Select defaultValue={'service'} style={{ width: 90 }} onChange={this.handleChange}>
    <Option value="service">Service</Option>
    <Option value="group">Group</Option>
    </Select>
  )

  onSelect = (selectedKeys, info) => {
    selectedKeys = [];
    let nodeData = '';
    let dubboData = '';
    let selectedNode;
    let dubboConfData = {display: 'none'};
    if (info.node.props.dataRef.key !== 'zk-address') {
      selectedNode = info.node.props.dataRef;
      selectedKeys = [info.node.props.dataRef.key];
      let keyPath = selectedKeys[0].split('-0-');
      let nodeDataPath = [...keyPath];
      nodeDataPath.pop();
      let nodeDataTmp = {'Path': nodeDataPath,'Data Length': info.node.props.dataRef.stat.dataLength, 'Data': info.node.props.dataRef.data,  'Number Of Children': info.node.props.dataRef.stat.numChildren};
      nodeData = JSON.stringify(nodeDataTmp, null, 2);
      if (keyPath.length >= 4) {
        if (_.includes(['configurators', 'consumers', 'providers', 'routers'], keyPath[keyPath.length - 2])) {
          if (keyPath[keyPath.length - 2] === 'providers') {
            let configNode = _.find(info.node.props.dataRef.parent.parent.children, {title: "configurators"});
            // 是否有config
            if (!configNode.isLeaf) {
              let configPath = `%2F${keyPath[0]}%2F${keyPath[1]}%2Fconfigurators`;
              request('/data/zkClient/children?addr=' + this.zkAddress + '&path=' + configPath).then((result) => {
                // 没有配置就是默认
                dubboConfData = {weight: 100, enabled: true};
                let selectedip = info.node.props.dataRef.title.split('/')[2];
                dubboConfData = {weight: 100, enabled: true};
                _.each(result.data, function(item) {
                  item.path = decodeURIComponent(item.path);
                  let ip = item.path.split('/')[2];
                  if (ip === selectedip) {
                    let dubboConfigDataTmp = {};
                    let dubboCofigUrlPath = item.path.split('?');
                    let dubboConfigPath = dubboCofigUrlPath[1].split('&');
                    dubboConfigPath.map((item) => {
                      dubboConfigDataTmp[item.split('=')[0]] = item.split('=')[1];
                    })
                    dubboConfData = {weight: dubboConfigDataTmp.weight, enabled: dubboConfigDataTmp.enabled};
                  }
                })
                this.setState({
                  dubboConfData
                });
              });
            } else {
              // 没有配置就是默认
              dubboConfData = {weight: 100, enabled: true};
              this.setState({
                dubboConfData
              });
            }
          }
          let dubboPath = info.node.props.dataRef.title.split('?');
          let dubboDataTmp = {Service: dubboPath[0]};
          dubboPath = dubboPath[1].split('&');
          dubboPath.map((item) => {
            dubboDataTmp[item.split('=')[0]] = item.split('=')[1];
            return true;
          })
          dubboData = JSON.stringify(dubboDataTmp, null, 2);
        }
      }
      
    }
    this.setState({
      selectedKeys,
      nodeData,
      selectedNode,
      dubboData,
      dubboConfData
    });
  }

  onSearch = (value, event) => {
    let objKeys = []; // 目标
    let expandedKeys = ['zk-address'];
    let promise =new Promise((resolve) => {
      if (this.state.treeData[0] && value ) {
        let filter = (src) => {
          src.forEach((child) => {
            if (child.title.indexOf(value) > -1) {
              let keys = child.key.split('-0-');
              if (keys.length > 1) {
                expandedKeys.push(keys[keys.length - 2]);
              }
              objKeys.push(child.key);
            }
          })
        }
        if (this.state.searchType === 'group') {
          this.state.treeData[0].children.forEach((item) => {
            if (item.title.indexOf(value) > -1) {
              objKeys.push(item.key);
            }
          });
          resolve();
        } else {
          let flag = this.state.treeData[0].children.length;
          this.state.treeData[0].children.forEach((item) => {
            if (item.children) {
              flag--;
              filter(item.children);
              if (!flag) {
                resolve();
              }
            } else if (item.stat.numChildren) {
              this.onLoadData(item).then((result) => {
                filter(item.children);
                flag--;
                if (!flag) {
                  resolve();
                }
              });
            } else {
              flag--;
            }
          })
        }
      }
    });
    promise.then(() => {
      this.setState({
        objKeys,
        expandedKeys,
        selectedKeys: [objKeys[0]]
      });
    })
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys
    });
  }

  onLoad = (loadedKeys, {event, node}) => {
    // let zkAddr = document.getElementsByClassName('js-zk-address');
    // var label = document.createElement("label"); 
    // label.class = "ant-checkbox-wrapper";

    // var span1 = document.createElement("span"); 
    // span1.class = "ant-checkbox";
    // var input = document.createElement("input"); 
    // input.class = "ant-checkbox-input";
    // input.type = "checkbox";
    // var span2 = document.createElement("span"); 
    // span2.class = "ant-checkbox-inner";
    // span1.appendChild(input);
    // span1.appendChild(span2);

    // var span3 = document.createElement("span"); 
    // span3.innerText = "Checkbox";

    // label.appendChild(span1);
    // label.appendChild(span3);
    // zkAddr[0].childNodes[1].append(label);
  }

  onLoadData = (treeNode) => {
    return new Promise((resolve) => {
      if (treeNode.props && treeNode.props.children) {
        resolve();
        return;
      }
      let dataRef = treeNode.props ? treeNode.props.dataRef : treeNode;
      request('/data/zkClient/children?addr=' + this.zkAddress + '&path=' + dataRef.path).then((result) => {
        if (result.data) {
          let children =  _.sortBy(result.data, function(v) {
            let path = v.path;
            v.title = decodeURIComponent(path);
            v.key = `${dataRef.key}-0-${path}`;
            v.isLeaf = !v.stat.numChildren;
            v.path = dataRef.path + '%2F' + path;
            v.parent = dataRef;
            return path;
          });
          if (children) {
            dataRef.children = children;
            this.setState({
              treeData: [...this.state.treeData],
            });
          }
          resolve();
        }
      });
    });
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.key === 'zk-address') {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item} ref={item.key}
            className='js-zk-address'
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item} ref={item.key}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} dataRef={item} ref={item.key} />;
    });
  }

  seq = 0;
  selectNext = () => {
    if (!this.state.objKeys.length) {
      return;
    }
    let seq = this.seq + 1;
    if (seq > this.state.objKeys.length - 1) {
      seq = 0;
    }
    let selectedKeys = [this.state.objKeys[seq]];
    // this.setState({
    //   selectedKeys
    // });
    this.refs[selectedKeys[0]].selectHandle.scrollIntoView({block: "center"});
    this.onSelect(selectedKeys, {node: this.refs[selectedKeys[0]]});
    this.seq = seq;
  }

  selectPrev = () => {
    if (!this.state.objKeys.length) {
      return;
    }
    let seq = this.seq - 1;
    if (seq < 0) {
      seq = this.state.objKeys.length - 1;
    }
    let selectedKeys = [this.state.objKeys[seq]];
    // this.setState({
    //   selectedKeys
    // });
    this.refs[selectedKeys[0]].selectHandle.scrollIntoView({block: "center"});
    this.onSelect(selectedKeys, {node: this.refs[selectedKeys[0]]});
    this.seq = seq;
  }

  oldExpandedKeys = [];
  shrink = () => {
    if (this.state.expandedKeys.length === 1) {
      return;
    }
    this.oldExpandedKeys = this.state.expandedKeys;
    let expandedKeys = ['zk-address'];
    this.setState({
      expandedKeys
    });
  }

  reloadTree = (e, a, b) => {
    if (this.state.selectedKeys.length === 0) {
      return;
    }
    let selectedNode = this.state.selectedNode;
    request('/data/zkClient/children?addr=' + this.zkAddress + '&path=' +
    selectedNode.path).then((result) => {
      if (result.data) {
        let children =  _.sortBy(result.data, function(v) {
          let path = v.path;
          v.title = decodeURIComponent(path);
          v.key = `${selectedNode.key}-0-${path}`;
          v.isLeaf = !v.stat.numChildren;
          v.path = selectedNode.path + '%2F' + path; 
          v.parent = selectedNode;
          return path;
        });
        if (children) {
          selectedNode.children = children;
          this.setState(
            {
              selectedKeys: [...this.state.selectedKeys]
            }
          );
        }
      }
    });
  }

  filterTreeNode = (node) => {
    return _.includes(this.state.objKeys, node.props.dataRef.key);
  }

  siwtchFilter = (node) => {
    let filterTheme = '';
    let treeData = _.extend({}, this.treeData);
    if (this.state.filterTheme === 'twoTone') {
      filterTheme = 'outlined';
    } else {
      filterTheme = 'twoTone';
      if (!_.isEmpty(treeData.normalRegistry)) {
        treeData.children = [];
        _.each(this.treeData.children, (item) => {
          if (this.treeData.normalRegistry.includes(item.key)) {
            treeData.children.push(item);
          }
        })
      }
    }
    this.setState({filterTheme: filterTheme, treeData: [treeData]});
  }

  onHalfWeight = () => {
    let formData = {};
    formData.addr = this.zkAddress;
    formData.path = '/test/demo';
    let headers = { 'Content-Type': 'application/json'};
    request('/data/node', {method: 'POST',
      body: JSON.stringify(formData),
      headers: headers
    }).then((result) => {
    })
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    let treeData = _.extend({}, nextProps.treeData);
    if (!_.isEmpty(nextProps.treeData.normalRegistry)) {
      treeData.children = [];
      _.each(nextProps.treeData.children, (item) => {
        if (nextProps.treeData.normalRegistry.includes(item.key)) {
          treeData.children.push(item);
        }
      })
    }
    this.setState({treeData: [treeData], expandedKeys: [treeData.key]})
  }

  render() {
    if (this.props.treeData) {
      this.treeData = this.props.treeData;
      this.zkAddress = this.props.treeData.title;
      this.normalRegistry = this.props.treeData.normalRegistry;
    }
    const { expandedKeys, selectedKeys, treeData, nodeData, dubboData, filterTheme, dubboConfData } = this.state;
    return (
      <div>
        <div style={{width: 640, height: '100%', display: 'inline-block', borderRight: '1px solid #e8e8e8', paddingRight: 3, paddingBottom: 40}}>
          <Search style={{ margin: '0 10px 8px 4px', width: 494 }} placeholder="com.ztesoft.zsmart.pot.service.DateService"
            onSearch={this.onSearch} addonBefore={this.selectBefore} />
          <Icon type="filter" theme={filterTheme} onClick={this.siwtchFilter} className='css-zk-icon' style={{ marginRight: 8 }} title='Filter Normal Registry' />
          <Icon type="arrow-down" onClick={this.selectNext} className='css-zk-icon' style={{ marginRight: 8 }} title='Next' />
          <Icon type="arrow-up" onClick={this.selectPrev} className='css-zk-icon' style={{ marginRight: 8  }} title='Previous' />
          <Icon type="shrink" onClick={this.shrink} className='css-zk-icon' style={{ marginRight: 8  }} title='Shrink' />
          <Icon type="reload" onClick={this.reloadTree} className='css-zk-icon' title='Reload' />
          <Tree loadData={this.onLoadData} onSelect={this.onSelect} onExpand={this.onExpand} showLine expandedKeys={expandedKeys}
            selectedKeys={selectedKeys} filterTreeNode={this.filterTreeNode} className='css-ant-tree' onLoad={this.onLoad}>
            {this.renderTreeNodes(treeData)}
          </Tree>
        </div>
        <div style={{ display: 'inline-block', float: 'right', width: 'calc(100% - 650px)', paddingRight: 10, height: '100%' }}>
          <Tabs defaultActiveKey="1" style={{ height: '100%' }}>
            <TabPane tab="Node Data" key="1"><Card style={{ width: '100%' }}><pre>{nodeData}</pre></Card></TabPane>
            <TabPane tab="Dubbo Data" key="2"><Card style={{ width: '100%' }}><pre style={{ 'margin': '8px'}}>{dubboData}</pre>
            <div style={{ marginRight: '8px', display: dubboConfData.display}}>
              <pre style={{ display: 'inline', 'margin': '0 8px 0 0'}}>"weight": "{dubboConfData.weight}"</pre>
              <Icon type="arrow-down" style={{cursor: 'pointer', marginRight: '5px'}} title="Half Weight" onClick={this.onHalfWeight} />
              <Icon type="arrow-up" style={{cursor: 'pointer'}} title="Double Weight" />
              <br/>
              <pre style={{ display: 'inline', 'margin': '0 8px 0 0'}}>"enabled": {dubboConfData.enabled ? 'true' : 'false'}</pre>
              <Icon type="retweet" theme="outlined" style={{cursor: 'pointer'}} title="Change" />
            </div>
            </Card></TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

MyTree.propTypes = {
  treeData: PropTypes.any
}
