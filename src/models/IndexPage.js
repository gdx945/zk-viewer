export default {
  namespace: 'indexPage',
  state: {},
  reducers: {
    // 'reloadTree'(state, { treeData: data }) {
    //   return {history: state.history, treeData: data, contentHeight: state.contentHeight};
    // },
    'resize'(state, { contentHeight: data }) {
      // return {history: state.history, treeData: state.treeData, contentHeight: data};
      return {contentHeight: data};
    }
  },
};