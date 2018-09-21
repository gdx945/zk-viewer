import { connect } from 'dva';
import './IndexPage.css';
import { Layout, Menu } from 'antd';
import ZKViewer from '../components/ZKViewer';

const { Header, Content, Footer } = Layout;

function IndexPage({ dispatch, indexPage }) {

  window.addEventListener('resize', () => {
    dispatch({
      type: 'indexPage/resize',
      contentHeight: window.innerHeight - 65 - 68
    });
  });

  return (
    <div>
      <Layout>
        <Header className="header">
          <div className="logo" style={{width: '186px', height: '25px', margin: '20px 28px 14px 0', float: 'left',
            backgroundImage: `url(${require("../image/home.png")})`}} />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item key="1"><a href="/">ZK for Dubbo</a></Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '20px 35px 0 50px', height: indexPage.contentHeight }}>
          {/* <ZKViewer contentHeight={indexPage.contentHeight} /> */}
          <ZKViewer/>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          ZK Viewer ©2018 Created by CRM
        </Footer>
      </Layout>
    </div>
  );
}

IndexPage.propTypes = {
};

// export default Products;
export default connect(({ indexPage }) => ({
  indexPage,
}))(IndexPage);