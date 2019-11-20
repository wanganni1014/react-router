import React from "react";
import PropTypes from "prop-types";
import { createLocation, locationsAreEqual } from "history";
import invariant from "tiny-invariant";

import Lifecycle from "./Lifecycle.js";
import RouterContext from "./RouterContext.js";
import generatePath from "./generatePath.js";

/**
 * Redirect 使用了 context.Consumer（消费组件），订阅了 Router 提供的 context，
 * 一旦 location 发生改变，context 也会改变，则也会触发重定向。
 */

/**
 * The public API for navigating programmatically with a component.
 */
function Redirect({ computedMatch, to, push = false }) {
  return (
    <RouterContext.Consumer>
      {context => {
        invariant(context, "You should not use <Redirect> outside a <Router>");

        const { history, staticContext } = context;

        // 根据有没传属性 push，有传则是往 state 堆栈中新增（history.push），否则就是替代（history.replace）当前 state。
        const method = push ? history.push : history.replace;
        // 生成新的 location
        const location = createLocation(
          computedMatch
            ? typeof to === "string"
              ? generatePath(to, computedMatch.params)
              : {
                  ...to,
                  pathname: generatePath(to.pathname, computedMatch.params)
                }
            : to
        );

        // When rendering in a static context,
        // set the new location immediately.
        // 当渲染一个静态的 context 时（staticRouter)，立即设置新 location
        if (staticContext) {
          method(location); //history.push(location) 或者 history.replace(location);
          return null;
        }

        return (
          // Lifecycle 是一个 return null 的空组件，但定义了 componentDidMount、componentDidUpdate、componentWillUnmount 生命周期
          <Lifecycle
            onMount={() => {
              method(location);
            }}
            onUpdate={(self, prevProps) => {
              const prevLocation = createLocation(prevProps.to);
              if (
                // 触发更新时，对比前后 location 是否相等，不相等，则更新 location
                !locationsAreEqual(prevLocation, {
                  ...location,
                  key: prevLocation.key
                })
              ) {
                method(location);
              }
            }}
            to={to}
          />
        );
      }}
    </RouterContext.Consumer>
  );
}

if (__DEV__) {
  Redirect.propTypes = {
    push: PropTypes.bool,
    from: PropTypes.string,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
  };
}

export default Redirect;
