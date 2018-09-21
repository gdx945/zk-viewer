import React, { Component } from "react";
import PropTypes from 'prop-types';
import { Layout, Input, Tag, Tooltip, Icon } from 'antd';
import request from '../utils/request';
import MyTree from './MyTree';

const _ = require('lodash');
const { Sider } = Layout;
const Search = Input.Search;

export default class ZKViewer extends Component {
  state = {
    treeData: {},
    zkAddrTags: []
  }

  UNSAFE_componentWillMount = () => {
    request('/data/zkHistory').then((result) => {
      const zkAddrList =  _.values(result.data);
      this.setState(
        {
          zkAddrTags: zkAddrList
        }
      );
    });
  }

  onSearch = (value) => {
    const { zkAddrTags } = this.state;
    value = value ? value : '127.0.0.1:2181';
    request('/data/zkClient/children?addr=' + value + '&path=%2F').then((result) => {
      if (result.data) {
        let addrObj = _.find(zkAddrTags, {addr: value})
        let normalRegistry = [];
        if (addrObj && !_.isEmpty(addrObj.normalRegistry)) {
          normalRegistry = addrObj.normalRegistry;
        }
        let children =  _.sortBy(result.data, function(v) {
          let path = v.path;
          let sortFlag = path;
          if (normalRegistry.includes(path)) {
            sortFlag = 'AA' + sortFlag;
          }
          v.key = v.title = path;
          v.isLeaf = !v.stat.numChildren;
          v.path = '%2F' + path; 
          return sortFlag;
        });
        if (children) {
          document.getElementsByClassName('js-zk-addr-search')[0].style.display = 'none';
          document.getElementsByClassName('js-layout')[0].style.display = '';
          this.setState(
            {
              treeData: {title: value, key: 'zk-address',
                children: children, normalRegistry: normalRegistry}
            }
          );
        }
      }
    });
  }

  onClick = (e) => {
     var addr = e.target.innerText.split('-')[1];
     this.onSearch(addr);
  }

  render() {
    const { treeData, zkAddrTags } = this.state;
    if (!_.isEmpty(zkAddrTags)) {
      return (
        <div style={{ height: '100%' }}>
          <Layout style={{ padding: '24px 0', background: '#fff', display: 'none', height: '100%' }} className='js-layout'>
            <Sider width={'100%'} style={{ background: '#fff' }}>
              <MyTree treeData={treeData} />
            </Sider>
          </Layout>
          <div style={{ paddingTop: 50 }} className='js-zk-addr-search'>
            <Search
              addonBefore="zookeeper://"
              placeholder="127.0.0.1:2181"
              enterButton="Connect"
              size="large"
              onSearch={this.onSearch.bind(this)}
            />
            <div style={{ margin: '40px 10px 0 2px', fontSize: '16px' }}>Commonly Used
              <div style={{ margin: '10px 0px'}}>
                {zkAddrTags.map((tag, index) => {
                  const tagName = `${tag.name}-${tag.addr}`;
                  const isLongTag = tagName.length > 25;
                  const tagElem = (
                    <Tag key={tagName} onClick={this.onClick} closable={!tag.isDefault} afterClose={() => this.handleClose(tagName)}>
                      {isLongTag ? `${tagName.slice(0, 25)}...` : tagName}
                    </Tag>
                  );
                  return isLongTag ? <Tooltip title={tagName} key={tagName}>{tagElem}</Tooltip> : tagElem;
                })}
                <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed' }} >
                  <Icon type="plus" /> Add Address
                </Tag>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div></div>
    );
  }
}

ZKViewer.propTypes = {
  treeData: PropTypes.any
}
