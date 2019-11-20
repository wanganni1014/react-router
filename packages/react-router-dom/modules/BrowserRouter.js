import React from "react";
import { Router } from "react-router";
import { createBrowserHistory as createHistory } from "history";
import PropTypes from "prop-types";
import warning from "tiny-warning";

/**
 * react-router 分为四个包，分别为 react-router、react-router-dom、react-router-config、react-router-native，其中 react-router-dom 是浏览器相关 API，react-router-native 是 React-Native 相关 API，react-router 是核心也是共同部分 API，react-router-config 是一些配置相关。
 * react-router 是 React指定路由，内部 API 的实现也是继承 React 一些属性和方法，所以说 react-router 内 API 也是 React 组件。
 * react-router 还用到了 history 库，这个库主要是对 hash 路由、history 路由、memory 路由的封装。
 * Router 都是作为 Route 等其他子路由的上层路由，使用了 context.Provider，接收一个 value 属性，传递 value 给消费子组件。
 * history 库中有个方法 history.listen(callback(location)) 对 location 进行监听，点击某个 Link 组件，改变了 location，只要 location 发生变化了，通过 context 传递改变后的 location，消费的子组件拿到更新后的 location，从而渲染相应的组件。
 **/

/**
 * The public API for a <Router> that uses HTML5 history.
 */
class BrowserRouter extends React.Component {
  history = createHistory(this.props);

  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}

if (__DEV__) {
  BrowserRouter.propTypes = {
    basename: PropTypes.string,
    children: PropTypes.node,
    forceRefresh: PropTypes.bool,
    getUserConfirmation: PropTypes.func,
    keyLength: PropTypes.number
  };

  BrowserRouter.prototype.componentDidMount = function() {
    warning(
      !this.props.history,
      "<BrowserRouter> ignores the history prop. To use a custom history, " +
        "use `import { Router }` instead of `import { BrowserRouter as Router }`."
    );
  };
}

export default BrowserRouter;
