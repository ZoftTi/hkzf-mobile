import React from "react"
import { Toast } from "antd-mobile"
import { List, AutoSizer } from "react-virtualized"
import NavHeader from '../../components/NavHeader'

import "./index.css"
import axios from "axios"
import { getCurrentCity } from "../../utils"

// 索引的高度
const TITLE_HEIGHT = 36
// 城市名称的高度
const NAME_HEIGHT = 50

// 数据格式化方法
const formatCityData = (list) => {
  const cityList = {}

  // 1. 遍历list数组
  list.forEach((item) => {
    // 2. 获取每一个城市的首字母
    const first = item.short.substr(0, 1)
    // 3. 判断citylist 中是否有该分类
    if (cityList[first]) {
      // 4. 如果有直接往该分类中push数据
      cityList[first].push(item)
    } else {
      // 5. 如果没有，就先创建一个数组，然后把当前城市信息添加到数组中
      cityList[first] = [item]
    }
  })

  // 获取索引数据
  const cityIndex = Object.keys(cityList).sort()

  return {
    cityList,
    cityIndex,
  }
}

const formatCityIndex = (letter) => {
  switch (letter) {
    case "#":
      return "当前定位"
    case "hot":
      return "热门城市"
    default:
      return letter.toUpperCase()
  }
}

const HOUSE_CITY = ["上海", "北京", "广州", "深圳"]

export default class CityList extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      cityList: {},
      cityIndex: [],
      // 指定右侧字母索引列表高亮的索引号
      activeIndex: 0,
    }

    // 创建 ref 对象
    this.cityListComponent = React.createRef()
  }

  async componentDidMount() {
    await this.getCityList()
    this.cityListComponent.current.measureAllRows()
  }

  async getCityList() {
    const res = await axios.get("http://localhost:8080/area/city?level=1")
    const { cityList, cityIndex } = formatCityData(res.data.body)

    const hotRes = await axios.get("http://localhost:8080/area/hot")
    cityList["hot"] = hotRes.data.body
    cityIndex.unshift("hot")
    // 获取定位城市
    const curCity = await getCurrentCity()
    cityList["#"] = [curCity]
    cityIndex.unshift("#")

    this.setState({
      cityList,
      cityIndex,
    })
  }

  changeCity = ({ label, value }) => {
    if (HOUSE_CITY.indexOf(label) > -1) {
      // 有
      localStorage.setItem("hkzf_city", JSON.stringify({ label, value }))
      this.props.history.go(-1)
    } else {
      Toast.info('该城市暂无房源信息', 1, null, false)
    }
  }

  rowRenderer = ({ key, index, style }) => {
    const letter = this.state.cityIndex[index]

    return (
      <div key={key} style={style} className="city">
        <div className="title">{formatCityIndex(letter)}</div>
        {this.state.cityList[letter].map((item) => (
          <div
            className="name"
            key={item.value}
            onClick={() => this.changeCity(item)}
          >
            {item.label}
          </div>
        ))}
      </div>
    )
  }

  getRowHeight = ({ index }) => {
    const { cityList, cityIndex } = this.state
    return TITLE_HEIGHT + cityList[cityIndex[index]].length * NAME_HEIGHT
  }

  // 封装渲染右侧索引列表的方法
  renderCityIndex() {
    // 获取到 cityIndex，并遍历其，实现渲染
    const { cityIndex, activeIndex } = this.state
    return cityIndex.map((item, index) => (
      <li
        className="city-index-item"
        key={item}
        onClick={() => {
          this.cityListComponent.current.scrollToRow(index)
        }}
      >
        <span className={activeIndex === index ? "index-active" : ""}>
          {item === "hot" ? "热" : item.toUpperCase()}
        </span>
      </li>
    ))
  }

  // 用于获取list 组件中渲染的信息
  onRowsRendered = ({ startIndex }) => {
    if (this.state.activeIndex !== startIndex) {
      this.setState({
        activeIndex: startIndex,
      })
    }
  }

  render() {
    return (
      <div className="citylist">
        <NavHeader>
          地图选择
        </NavHeader>
        {/* 城市列表 */}
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={this.cityListComponent}
              width={width}
              height={height}
              rowCount={this.state.cityIndex.length}
              rowHeight={this.getRowHeight}
              rowRenderer={this.rowRenderer}
              onRowsRendered={this.onRowsRendered}
              scrollToAlignment="start"
            />
          )}
        </AutoSizer>
        {/* 索引列表 */}
        <ul className="city-index">{this.renderCityIndex()}</ul>
      </div>
    )
  }
}
