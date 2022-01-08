import React from "react"
import NavHeader from "../../components/NavHeader"
import styles from "./index.module.css"
import axios from "axios"

import { Link } from "react-router-dom"
import { Toast } from "antd-mobile"

const BMapGL = window.BMapGL

const labelStyle = {
  cursor: "pointer",
  border: "0px solid rgb(255, 0, 0)",
  padding: "0px",
  whiteSpace: "nowrap",
  fontSize: "12px",
  color: "rgb(255, 255, 255)",
  textAlign: "center",
}

export default class Map extends React.Component {
  state = {
    // 小区下的房源列表
    housesList: [],
    isShowList: false,
  }

  componentDidMount() {
    this.initMap()
  }

  initMap() {
    // 初始化地图实例
    // 注意：在 react 脚手架中全局对象需要使用 window 来访问，否则，会造成 ESLint 校验错误
    const { label, value } = JSON.parse(localStorage.getItem("hkzf_city"))

    const map = new BMapGL.Map("container")
    // 作用：能够在其他方法中获取到地图
    this.map = map
    // 正｜逆地址解析器
    map.centerAndZoom(new BMapGL.Point(116.331398, 39.897445), 12)
    //创建地址解析器实例
    const myGeo = new BMapGL.Geocoder()
    // 将地址解析结果显示在地图上，并调整地图视野
    myGeo.getPoint(
      label,
      async (point) => {
        if (point) {
          // 初始化地图
          map.centerAndZoom(point, 11)
          // 添加控件
          map.addControl(new BMapGL.ScaleControl())
          map.addControl(new BMapGL.ZoomControl())
          this.renderOverlays(value)
        }
      },
      label
    )

    // 给地图绑定移动事件
    map.addEventListener("movestart", () => {
      // console.log('movestart')
      if (this.state.isShowList) {
        this.setState({
          isShowList: false,
        })
      }
    })
  }

  async renderOverlays(id) {
    try {
      // 加载动画
      Toast.loading("加载中...", 0, null, false)

      const res = await axios.get(`http://localhost:8080/area/map?id=${id}`)
      // 关闭loading
      Toast.hide()
      const data = res.data.body
      const { nextZoom, type } = this.getTypeAndZoom()

      data.forEach((item) => {
        this.createOverlays(item, nextZoom, type)
      })
    } catch (e) {
      Toast.hide()
    }
  }

  getTypeAndZoom() {
    const zoom = this.map.getZoom()
    let nextZoom, type
    if (zoom >= 10 && zoom < 12) {
      type = "circle"
      nextZoom = 13
    } else if (zoom >= 12 && zoom < 14) {
      type = "circle"
      nextZoom = 15
    } else if (zoom > 14 && zoom < 16) {
      type = "rect"
    }
    return { type, nextZoom }
  }

  createOverlays(data, zoom, type) {
    const {
      label: areaName,
      count,
      value,
      coord: { longitude, latitude },
    } = data
    const areaPoint = new BMapGL.Point(longitude, latitude)

    if (type === "circle") {
      this.createCircle(areaPoint, areaName, count, value, zoom)
    } else {
      this.createRect(areaPoint, areaName, count, value)
    }
  }

  createCircle(point, name, count, id, zoom) {
    const label = new BMapGL.Label("", {
      position: point,
      offset: new BMapGL.Size(-35, -35),
    })

    // 给 label 对象添加唯一标识
    label.id = id

    label.setContent(`
      <div class="${styles.bubble}">
        <p class="${styles.name}">${name}</p>
        <p>${count}套</p>
      </div>
    `)

    label.setStyle(labelStyle)

    label.addEventListener("click", () => {
      this.renderOverlays(id)

      this.map.centerAndZoom(point, zoom)

      setTimeout(() => {
        this.map.clearOverlays()
      }, 0)
    })

    this.map.addOverlay(label)
  }

  createRect(point, name, count, id) {
    const label = new BMapGL.Label("", {
      position: point,
      offset: new BMapGL.Size(-50, -28),
    })

    // 给 label 对象添加唯一标识
    label.setStyle(labelStyle)

    label.setContent(`
      <div class="${styles.rect}">
        <span class="${styles.housename}">${name}</span>
        <span class="${styles.housenum}">${count}套</span>
        <i class="${styles.arrow}"></i>
      </div>
    `)

    label.addEventListener("click", (e) => {
      this.getHouseList(id)

      // 获取当前被点击项
      if (e.clientX && e.clientY) {
        this.map.panBy(
          window.innerWidth / 2 - e.clientX,
          (window.innerHeight - 330) / 2 - e.clientY
        )
      }
    })

    this.map.addOverlay(label)
  }

  async getHouseList(id) {
    try {
      Toast.loading("加载中...", 0, null, false)

      const res = await axios.get(`http://localhost:8080/houses?cityId=${id}`)

      Toast.hide()
      this.setState({
        housesList: res.data.body.list,
        isShowList: true,
      })
    } catch (e) {
      Toast.hide()
    }
  }

  renderHouseList() {
    return this.state.housesList.map((item) => (
      <div className={styles.house} key={item.houseCode}>
        <div className={styles.imgWrap}>
          <img
            className={styles.img}
            src={`http://localhost:8080${item.houseImg}`}
            alt=""
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{item.title}</h3>
          <div className={styles.desc}>{item.desc}</div>
          <div>
            {item.tags.map((tag, index) => {
              const tagClass = "tag" + (index + 1)
              return (
                <span
                  className={[styles.tag, styles[tagClass]].join(" ")}
                  key={tag}
                >
                  {tag}
                </span>
              )
            })}
          </div>
          <div className={styles.price}>
            <span className={styles.priceNum}>{item.price}</span> 元/月
          </div>
        </div>
      </div>
    ))
  }

  render() {
    return (
      <div className={styles.map}>
        <NavHeader>地图找房</NavHeader>
        {/* 地图容器元素 */}
        <div id="container" className={styles.container} />

        {/* 房源列表 */}
        <div
          className={[
            styles.houseList,
            this.state.isShowList ? styles.show : "",
          ].join(" ")}
        >
          <div className={styles.titleWrap}>
            <h1 className={styles.listTitle}>房屋列表</h1>
            <Link className={styles.titleMore} to="/home/list">
              更多房源
            </Link>
          </div>

          <div className={styles.houseItems}>{this.renderHouseList()}</div>
        </div>
      </div>
    )
  }
}
