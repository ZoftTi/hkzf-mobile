import React from "react"

/*
  1 安装: yarn add react-router-dom@v5.2
  2 导入路由组件: Router / Route / Link
  3 在 pages 文件夹中创建 Home / index.js 和 CityList / index.js 组件
  4 使用 Route 组件配置首页和城市选择页面
*/

import { BrowserRouter as Router, Route, Redirect } from "react-router-dom"

import Home from "./pages/Home"
import CityList from "./pages/CityList"
import Map from "./pages/Map"

function App() {
  return (
    <Router>
      <div className="App">
        {/* 配置路由 */}
        <Route exact path="/" render={() => <Redirect to="/home" />}></Route>
        <Route path="/home" component={Home}></Route>
        <Route path="/citylist" component={CityList}></Route>
        <Route path="/map" component={Map}></Route>
      </div>
    </Router>
  )
}

export default App
