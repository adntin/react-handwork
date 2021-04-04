// 专业术语
// vnode: 虚拟DOM节点, 即`ReactElement`结构JS对象
// node: 真实DOM节点

function render(vnode, container) {
  console.log("vnode", vnode);
  // 1. vnode 变成 node
  const node = createNode(vnode);
  // 2. node 插入到 container
  container.appendChild(node);
}

// 虚拟节点(vnode) 变成 真实节点(node)
function createNode(vnode) {
  let node;
  const { type } = vnode;
  if (typeof type === "string") {
    node = updateHostComponent(vnode);
  } else if (typeof type === "function") {
    node = type.prototype.isReactComponent
      ? updateClassComponent(vnode)
      : updateFunctionComponent(vnode);
  } else {
    node = updateTextComponent(vnode);
  }
  return node;
}

// 原生标签
function updateHostComponent(vnode) {
  const { type, props } = vnode;
  const node = document.createElement(type);
  updateNode(node, props); // 更新节点属性
  reconcileChildren(node, props.children); // 遍历子节点
  return node;
}

// 更新节点属性
function updateNode(node, props) {
  Object.keys(props)
    .filter((k) => k !== "children")
    .forEach((k) => (node[k] = props[k]));
}

// 文本标签
function updateTextComponent(vnode) {
  const node = document.createTextNode(vnode);
  return node;
}

// 协调子节点
function reconcileChildren(parentNode, children) {
  const newChildren = Array.isArray(children) ? children : [children];
  for (let i = 0, len = newChildren.length; i < len; i++) {
    let child = newChildren[i]; // vnode
    // 1. vnode 变成 node
    // 2. node 插入到 parentNode
    render(child, parentNode);
  }
}

/**
 * 函数组件
 * @param {Function} type - 函数组件的函数名
 * @param {Object} props - 函数组件的属性
 * @returns - 真实DOM节点
 */
function updateFunctionComponent({ type, props }) {
  const vnode = type(props); // vnode, 因为函数组件返回的是jsx语法糖, 即JS对象
  const node = createNode(vnode);
  return node;
}

/**
 * 类组件
 * @param {Function} type - 类组件的函数名
 * @param {Object} props - 类组件的属性
 * @returns - 真实DOM节点
 */
function updateClassComponent({ type, props }) {
  const instance = new type(props); // 类需要先实现化
  const vnode = instance.render();
  const node = createNode(vnode);
  return node;
}

const ReactDOM = {
  render,
};

export default ReactDOM;
