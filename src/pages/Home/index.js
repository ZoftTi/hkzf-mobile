import React from "react"
import { Route } from "react-router-dom"

import News from "../News"
import Index from "../Index"
import HouseList from "../HouseList"
import Profile from "../Profile"
import { TabBar } from "antd-mobile"

import "./index.css"

const tabItems = [
  {
    title: "首页",
    icon: "icon-ind",
    path: "/home",
  },
  {
    title: "找房",
    icon: "icon-findHouse",
    path: "/home/list",
  },
  {
    title: "资讯",
    icon: "icon-infom",
    path: "/home/news",
  },
  {
    title: "我的",
    icon: "icon-my",
    path: "/home/profile",
  },
]

export default class Home extends React.Component {
  state = {
    selectedTab: this.props.location.pathname,
  }

  componentDidUpdate(prevProps) {
    // 路由跳转时设置高亮状态
    prevProps.location.pathname !== this.props.location.pathname &&
      this.setState({
        selectedTab: this.props.location.pathname,
      })
  }

  renderTarBarItem() {
    return tabItems.map((item) => (
      <TabBar.Item
        title={item.title}
        key={item.title}
        icon={<i className={`iconfont ${item.icon}`} />}
        selectedIcon={<i className={`iconfont ${item.icon}`} />}
        selected={this.state.selectedTab === item.path}
        onPress={() => {
          this.setState({
            selectedTab: item.path,
          })

          this.props.history.push(item.path)
        }}
      />
    ))
  }

  render() {
    return (
      <div className="home">
        {/* 渲染子路由内容 */}
        <Route path="/home/news" component={News} />
        <Route exact path="/home" component={Index} />
        <Route path="/home/list" component={HouseList} />
        <Route path="/home/profile" component={Profile} />

        {/* TarBar */}
        <TabBar tintColor="#21b97a" barTintColor="white" noRenderContent={true}>
          {this.renderTarBarItem()}
        </TabBar>
      </div>
    )
  }
}
