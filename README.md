# Nav-Item 个人导航站

这是 `yuhuan457/nav-item` 维护的个人导航站源码，基于 Vue 3、Node.js 和 SQLite 构建，支持前台导航展示和后台可视化管理。

## 功能

- 首页卡片式导航
- 聚合搜索
- 栏目、子栏目和卡片管理
- 广告位管理
- 友情链接管理
- 用户管理
- 基础设置管理
- 页脚版权和友情链接入口可隐藏、可修改
- 背景、主题色、页面标题、favicon 等前台基础配置

## 默认后台

- 前台地址：`http://localhost:3000`
- 后台地址：`http://localhost:3000/admin`
- 默认用户名：`admin`
- 默认密码：`123456`

如果已经存在 `database/nav.db`，环境变量里的默认账号密码不会覆盖旧数据库里的账号。

## 环境变量

- `PORT`：服务端口，默认 `3000`
- `ADMIN_USERNAME`：初始化管理员用户名，默认 `admin`
- `ADMIN_PASSWORD`：初始化管理员密码，默认 `123456`
- `JWT_SECRET`：JWT 密钥，建议生产环境自行设置

## 源码部署

```bash
git clone https://github.com/yuhuan457/nav-item.git
cd nav-item
npm install
cd web
npm install
npm run build
cd ..
npm start
```

## Docker Compose 部署

在 1Panel 或服务器中拉取本仓库源码后，使用下面的 `docker-compose.yml` 从当前源码构建镜像：

```yaml
version: '3'

services:
  nav-item:
    build:
      context: .
      dockerfile: Dockerfile
    image: yuhuan457/nav-item:latest
    container_name: nav-item
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=123456
    volumes:
      - ./database:/app/database
      - ./uploads:/app/uploads
    restart: unless-stopped
```

如果你启用了 GitHub Actions，也可以使用自动构建出的镜像：

```yaml
image: ghcr.io/yuhuan457/nav-item:latest
```

## 数据持久化

请保留以下挂载：

- `./database:/app/database`：保存 SQLite 数据库
- `./uploads:/app/uploads`：保存上传的图标等文件

## 项目结构

```text
nav-item/
├── app.js
├── config.js
├── db.js
├── Dockerfile
├── docker-compose.yml
├── routes/
├── uploads/
└── web/
```

## 仓库

GitHub：`https://github.com/yuhuan457/nav-item`
