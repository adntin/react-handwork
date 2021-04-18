// 核心流程: Virtual DOM --> 更新整个Fiber链表--> 提交整个Fiber链表 --> 更新真实DOM

// 根 Fiber, 即 container 的 Fiber
let rootFiber = null;

/**
 * 渲染
 * @param {Object} vnode - ReactElement, JS对象
 * @param {HTMLDivElement} container - 真实DOM节点
 */
function render(vnode, container) {
  // 通过JSX语法糖, 用`React.createElement`创建出来的`ReactElement`JS对象
  console.log("ReactElement", vnode);
  // 构造container真实DOM的Fiber(根)结构
  rootFiber = {
    type: "div",
    props: { id: "root", children: { ...vnode } },
    stateNode: container,
  };
  // 初次渲染
  nextUnitOfWork = rootFiber;
}

// 创建真实节点, 只有原生标签才需要创建真实DOM, 即Fiber的stateNode属性
function createNode(workInProgress) {
  const { type, props } = workInProgress;
  const node = document.createElement(type);
  updateNode(node, props);
  return node;
}

// 更新节点属性
function updateNode(node, props) {
  Object.keys(props).forEach((k) => {
    if (k === "children") {
      if (typeof props[k] === "string") {
        node.textContent = props[k];
      }
    } else {
      node[k] = props[k];
    }
  });
}

// 更新原生标签(实际是更新Fiber结构)
function updateHostComponent(workInProgress) {
  // 更新自己
  const { props, stateNode } = workInProgress;
  if (!stateNode) {
    workInProgress.stateNode = createNode(workInProgress);
  }
  // 更新孩子
  reconcileChildren(workInProgress, props.children);
}

/**
 * 协调子节点, 实际是更新Fiber结构
 * @param {Fiber} workInProgress - 当前执行单元任务
 * @param {Object} children - ReactElement, JS对象
 * @returns
 */
function reconcileChildren(workInProgress, children) {
  if (typeof children === "string" || typeof children === "number") {
    return;
  }
  const newChildren = Array.isArray(children) ? children : [children];
  let previousNewFiber = null;
  for (let i = 0, len = newChildren.length; i < len; i++) {
    let child = newChildren[i];
    let newFiber = {
      type: child.type,
      props: { ...child.props },
      stateNode: null,
      child: null,
      sibling: null,
      return: workInProgress,
    };
    if (i === 0) {
      workInProgress.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
  }
}

// 下一个单元任务(Fiber)
let nextUnitOfWork = null;

// 执行单元任务(Fiber)
function performUnitOfWork(workInProgress) {
  // step1: 执行任务
  const { type } = workInProgress;
  if (typeof type === "string") {
    updateHostComponent(workInProgress);
  }
  // TODO: 函数组件和类组件
  // step2: 返回下一个执行任务, 深度优先遍历(链表结构)
  if (workInProgress.child) {
    return workInProgress.child;
  }
  let nextFiber = workInProgress;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }
}

function commitWorker(workInProgress) {
  // 提交自己
  if (!workInProgress) {
    return;
  }
  let parentNodeFiber = workInProgress.return;
  let parentNode = parentNodeFiber.stateNode;
  if (workInProgress.stateNode) {
    parentNode.appendChild(workInProgress.stateNode);
  }
  // 提交子节点
  commitWorker(workInProgress.child);
  // 提交兄弟节点
  commitWorker(workInProgress.sibling);
}

function commitRoot() {
  commitWorker(rootFiber.child);
  rootFiber = null;
}

function workLoop(deadline) {
  // 执行任务, 并返回下一个执行任务
  while (nextUnitOfWork && deadline.timeRemaining() > 0) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  console.log("rootFiber", rootFiber);
  // 提交wipRoot整个链表(Fiber)
  if (!nextUnitOfWork && rootFiber) {
    commitRoot();
  }
}

window.requestIdleCallback(workLoop);

const ReactDOM = {
  render,
};

export default ReactDOM;
