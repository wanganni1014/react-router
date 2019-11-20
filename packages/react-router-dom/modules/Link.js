import React from "react";
import { __RouterContext as RouterContext } from "react-router";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import {
  resolveToLocation,
  normalizeToLocation
} from "./utils/locationUtils.js";

// React 15 compat
const forwardRefShim = C => C;
let { forwardRef } = React;
if (typeof forwardRef === "undefined") {
  forwardRef = forwardRefShim;
}

/**
 * Link 组件作用是跳转到指定某个路由。Link 实际是对 <a> 标签进行了封装。
 *
 * 点击时会触发以下：
 *
 * 改变 url，但使用了 e.preventDefault()，所以页面没有发生跳转。
 * 根据是否传递属性 replace，有传就是替代当前 state（history.replace），否则是往 state 堆栈中新增（history.push），从而路由发生了改变。
 * 路由发生了改变，由于 Router 中有对 location 进行监听，从而通过 context 传递给消费子组件，匹配 path 是否相同，渲染相应的组件。
 *
 */
function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

const LinkAnchor = forwardRef(
  (
    {
      innerRef, // TODO: deprecate
      navigate,
      onClick,
      ...rest
    },
    forwardedRef
  ) => {
    const { target } = rest;

    let props = {
      ...rest,
      onClick: event => {
        try {
          if (onClick) onClick(event);
        } catch (ex) {
          event.preventDefault();
          throw ex;
        }

        if (
          !event.defaultPrevented && // onClick prevented default
          event.button === 0 && // ignore everything but left clicks
          (!target || target === "_self") && // let browser handle "target=_blank" etc.
          !isModifiedEvent(event) // ignore clicks with modifier keys
        ) {
          event.preventDefault();
          navigate();
        }
      }
    };

    // React 15 compat
    if (forwardRefShim !== forwardRef) {
      props.ref = forwardedRef || innerRef;
    } else {
      props.ref = innerRef;
    }

    /* eslint-disable-next-line jsx-a11y/anchor-has-content */
    return <a {...props} />;
  }
);

if (__DEV__) {
  LinkAnchor.displayName = "LinkAnchor";
}

/**
 * The public API for rendering a history-aware <a>.
 */
const Link = forwardRef(
  (
    {
      component = LinkAnchor,
      replace,
      to,
      innerRef, // TODO: deprecate
      ...rest
    },
    forwardedRef
  ) => {
    return (
      <RouterContext.Consumer>
        {context => {
          invariant(context, "You should not use <Link> outside a <Router>");

          const { history } = context;

          const location = normalizeToLocation(
            resolveToLocation(to, context.location),
            context.location
          );

          const href = location ? history.createHref(location) : "";
          const props = {
            ...rest,
            href,
            navigate() {
              const location = resolveToLocation(to, context.location);
              const method = replace ? history.replace : history.push;

              method(location);
            }
          };

          // React 15 compat
          if (forwardRefShim !== forwardRef) {
            props.ref = forwardedRef || innerRef;
          } else {
            props.innerRef = innerRef;
          }

          return React.createElement(component, props);
        }}
      </RouterContext.Consumer>
    );
  }
);

if (__DEV__) {
  const toType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.func
  ]);
  const refType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any })
  ]);

  Link.displayName = "Link";

  Link.propTypes = {
    innerRef: refType,
    onClick: PropTypes.func,
    replace: PropTypes.bool,
    target: PropTypes.string,
    to: toType.isRequired
  };
}

export default Link;
