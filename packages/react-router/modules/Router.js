import React from "react";
import PropTypes from "prop-types";
import warning from "tiny-warning";

import RouterContext from "./RouterContext.js";

/**
 * The public API for putting history on context.
 */
class Router extends React.Component {
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }

  constructor(props) {
    super(props);

    this.state = {
      location: props.history.location
    };

    // This is a bit of a hack. We have to start listening for location
    // changes here in the constructor in case there are any <Redirect>s
    // on the initial render. If there are, they will replace/push when
    // they mount and since cDM fires in children before parents, we may
    // get a new location before the <Router> is mounted.
    // 这是一个小技巧。我们必须开始监听location在构造函数中有任何<重定向>s初始渲染。如果有，他们会replace/push的时候
    // 这些问题越来越多，而且由于cDM在父元素之前就开始影响子元素，我们可能会在被挂载之前获得一个新的location。
    this._isMounted = false;
    this._pendingLocation = null;

    if (!props.staticContext) {
      // 如果不是 staticRouter，则对 location 进行监听
      this.unlisten = props.history.listen(location => {
        if (this._isMounted) {
          this.setState({ location });
        } else {
          this._pendingLocation = location;
        }
      });
    }
  }

  componentDidMount() {
    this._isMounted = true;

    if (this._pendingLocation) {
      this.setState({ location: this._pendingLocation });
    }
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten();
  }

  render() {
    // 使用了 React Context 传递 history、location、match、staticContext，使得所有子组件都可以获取这些属性和方法
    return (
      <RouterContext.Provider
        children={this.props.children || null}
        value={{
          history: this.props.history,
          location: this.state.location,
          match: Router.computeRootMatch(this.state.location.pathname),
          staticContext: this.props.staticContext //staticContext 是 staticRouter 中的 API，不是公用 API
        }}
      />
    );
  }
}

if (__DEV__) {
  Router.propTypes = {
    children: PropTypes.node,
    history: PropTypes.object.isRequired,
    staticContext: PropTypes.object
  };

  Router.prototype.componentDidUpdate = function(prevProps) {
    warning(
      prevProps.history === this.props.history,
      "You cannot change <Router history>"
    );
  };
}

export default Router;
