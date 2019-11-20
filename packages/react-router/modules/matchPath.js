import pathToRegexp from "path-to-regexp";

const cache = {};
const cacheLimit = 10000;
let cacheCount = 0;

function compilePath(path, options) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) return pathCache[path];

  const keys = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}

/**
 * Public API for matching a URL pathname to a path.
 */
function matchPath(pathname, options = {}) {
  if (typeof options === "string" || Array.isArray(options)) {
    options = { path: options };
  }

  const { path, exact = false, strict = false, sensitive = false } = options;

  const paths = [].concat(path);

  /**
   * reduce详解
   */
  // arr.reduce(callback,[initialValue])
  /**
   * callback （执行数组中每个值的函数，包含四个参数）
   *
   * 1、previousValue （上一次调用回调返回的值，或者是提供的初始值（initialValue））
   * 2、currentValue （数组中当前被处理的元素）
   * 3、index （当前元素在数组中的索引）
   * 4、array （调用 reduce 的数组）
   *
   *initialValue （作为第一次调用 callback 的第一个参数。）
   */
  // let names = ['Alice', 'Bob', 'Tiff', 'Bruce', 'Alice'];
  //
  // let nameNum = names.reduce((pre, cur)=>{
  //   console.log(cur);
  //   console.log(pre);
  //   if(cur in pre){
  //     pre[cur]++
  //   }else{
  //     pre[cur] = 1
  //   }
  //   return pre
  // },{});
  // console.log(nameNum); //{Alice: 2, Bob: 1, Tiff: 1, Bruce: 1}

  return paths.reduce((matched, path) => {
    if (!path && path !== "") return null;
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      end: exact,
      strict,
      sensitive
    });
    const match = regexp.exec(pathname);

    if (!match) return null;

    const [url, ...values] = match;
    const isExact = pathname === url;

    if (exact && !isExact) return null;

    return {
      path, // the path used to match
      url: path === "/" && url === "" ? "/" : url, // the matched portion of the URL
      isExact, // whether or not we matched exactly
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {})
    };
  }, null);
}

export default matchPath;
