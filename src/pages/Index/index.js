import React from "react"
import { Carousel, Flex, Grid, WingBlank } from "antd-mobile"

import axios from "axios"

// 导入图片
import Nav1 from "../../assets/images/nav-1.png"
import Nav2 from "../../assets/images/nav-2.png"
import Nav3 from "../../assets/images/nav-3.png"
import Nav4 from "../../assets/images/nav-4.png"

// 导入样式文件
import "./index.css"
import { getCurrentCity } from "../../utils"

// 导航菜单数据
const navs = [
  {
    id: 1,
    img: Nav1,
    title: "整租",
    path: "/home/list",
  },
  {
    id: 2,
    img: Nav2,
    title: "合租",
    path: "/home/list",
  },
  {
    id: 3,
    img: Nav3,
    title: "地图找房",
    path: "/map",
  },
  {
    id: 4,
    img: Nav4,
    title: "去出租",
    path: "/rent",
  },
]

export default class Index extends React.Component {
  state = {
    // 轮播图数据 轮播图存在两个问题 不会自动播放，从其他路由返回时出现高度问题 原因：动态加载数据，加载完成前后图片数量不一致
    swipers: [],
    isSwiperLoaded: false,
    // 租房小组数据
    groups: [],
    // 最新资讯
    news: [],

    curCityName: '上海'
  }

  // 获取轮播图数据的方法
  async getSwipers() {
    const res = await axios.get("http://localhost:8080/home/swiper")
    this.setState({
      swipers: res.data.body,
      isSwiperLoaded: true,
    })
  }

  // 获取小组信息
  async getGroups() {
    const res = await axios.get("http://localhost:8080/home/groups", {
      params: {
        area: "AREA%7C88cff55c-aaa4-e2e0",
      },
    })

    this.setState({
      groups: res.data.body,
    })
  }

  // 获取最新资讯
  async getNews() {
    const res = await axios.get(
      "http://localhost:8080/home/news?area=AREA%7C88cff55c-aaa4-e2e0"
    )

    this.setState({
      news: res.data.body,
    })
  }

  async componentDidMount() {
    this.getSwipers()
    this.getGroups()
    this.getNews()

    // 获取当前定位城市
    const curCity = await getCurrentCity()

    this.setState({
      curCityName: curCity.label
    })
  }
  // 渲染轮播图结构
  renderSwipers() {
    return this.state.swipers.map((val) => (
      <a
        key={val.id}
        href="http://itcast.cn"
        style={{
          display: "inline-block",
          width: "100%",
          height: 212,
        }}
      >
        <img
          src={`http://localhost:8080${val.imgSrc}`}
          alt={val.alt}
          style={{ width: "100%", verticalAlign: "top" }}
        />
      </a>
    ))
  }

  renderNavs() {
    return navs.map((item) => (
      <Flex.Item
        key={item.id}
        onClick={() => {
          this.props.history.push(item.path)
        }}
      >
        <img src={item.img} alt="" />
        <h2>{item.title}</h2>
      </Flex.Item>
    ))
  }

  renderNews() {
    return this.state.news.map((item) => (
      <div className="news-item" key={item.id}>
        <div className="imgwrap">
          <img
            className="img"
            src={`http://localhost:8080${item.imgSrc}`}
            alt=""
          />
        </div>
        <Flex className="content" direction="column" justify="between">
          <h3 className="title">{item.title}</h3>
          <Flex className="info" justify="between">
            <span>{item.from}</span>
            <span>{item.date}</span>
          </Flex>
        </Flex>
      </div>
    ))
  }

  render() {
    return (
      <div className="index">
        <div className="swiper">
          {this.state.isSwiperLoaded && (
            <Carousel autoplay infinite autoplayInterval={5000}>
              {this.renderSwipers()}
            </Carousel>
          )}

          {/* 搜索框 */}
          <Flex className="search-box">
            {/* 左侧白色区域 */}
            <Flex className="search">
              {/* 位置 */}
              <div
                className="location"
                onClick={() => this.props.history.push("/citylist")}
              >
                <span className="name">{this.state.curCityName}</span>
                <i className="iconfont icon-arrow" />
              </div>

              {/* 搜索表单 */}
              <div
                className="form"
                onClick={() => this.props.history.push("/search")}
              >
                <i className="iconfont icon-seach" />
                <span className="text">请输入小区或地址</span>
              </div>
            </Flex>
            {/* 右侧地图图标 */}
            <i
              className="iconfont icon-map"
              onClick={() => this.props.history.push("/map")}
            />
          </Flex>
        </div>
        {/* 导航菜单 */}
        <Flex className="nav">{this.renderNavs()}</Flex>

        <div className="group">
          <h3 className="group-title">
            租房小组 <span className="more">更多</span>
          </h3>

          <Grid
            data={this.state.groups}
            columnNum={2}
            square={false}
            hasLine={false}
            renderItem={(item) => (
              <Flex className="group-item" justify="around" key={item.id}>
                <div className="desc">
                  <p className="title">{item.title}</p>
                  <span className="info">{item.desc}</span>
                </div>
                <img src={`http://localhost:8080${item.imgSrc}`} alt="" />
              </Flex>
            )}
          />
        </div>

        <div className="news">
          <h3 className="group-title">最新资讯</h3>
          <WingBlank size="md">{this.renderNews()}</WingBlank>
        </div>
      </div>
    )
  }
}
