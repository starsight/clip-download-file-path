import { useEffect } from "react"
import "antd/dist/reset.css"
import { Layout, Typography } from "antd"
import { Main } from "~src/component/main"

const { Header, Content, Footer } = Layout
const { Title } = Typography

function IndexPopup() {
  return (
    <div style={{ height: "350px", width: "250px" }} >
      <Layout style={{ height: "350px", width: "250px" }}>
        <Header style={{ background: "#fff", height: "30px", padding: "0 16px" }}>
          <Title level={4}>Clip Download Path</Title>
        </Header>
        <Content style={{ padding: "10px" }}>
          <Main />
        </Content>
        <Footer style={{ textAlign: "center", padding: "16px" }}>
          Clip Download Path ©2024 Created by wenjie
        </Footer>
      </Layout>
    </div>
  )
}

export default IndexPopup