// import React from "react";
// import ReactDOM from "react-dom";
import ReactDOM from "./react-dom";
import Component from "./Component";

function FunctionComponent(props) {
  return (
    <div className="function">
      <p>函数组件-{props.name}</p>
    </div>
  );
}

class ClassComponent extends Component {
  render() {
    return (
      <div className="class">
        <p>类组件-{this.props.name}</p>
      </div>
    );
  }
}

const jsx = (
  <div className="page">
    <h1>手写源码</h1>
    <a href="https://baidu.com">百度</a>
    <FunctionComponent name="function" />
    <ClassComponent name="class" />
  </div>
);

// React17会自动替换JSX为虚拟DOM结构, 即`ReactElement`结构JS对象
// console.log(jsx);

ReactDOM.render(jsx, document.getElementById("root"));

// console.log("version:", React.version)
