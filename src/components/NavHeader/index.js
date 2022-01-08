import React from "react"
import { NavBar } from "antd-mobile"
import { withRouter } from "react-router-dom"
import PropTypes from "prop-types"

import styles from "./index.module.css"

function NavHeader({ children, history, onLeftClick }) {
  const defaultHandler = () => history.go(-1)

  return (
    <NavBar
      className={styles.navBar}
      mode="light"
      icon={<i className="iconfont icon-back" />}
      onLeftClick={onLeftClick || defaultHandler}
    >
      {children}
    </NavBar>
  )
}

NavHeader.propTypes = {
  children: PropTypes.string.isRequired,
  onLeftClick: PropTypes.func
}

// withRouter 函数返回值也是组件
export default withRouter(NavHeader)
