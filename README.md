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
- 背景、标题、favicon、语言、卡片布局等前台配置可在后台修改
- 后台支持检查 GitHub 最新版本并刷新前端缓存

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

## 1Panel Docker Compose 部署

在 1Panel 创建编排时，可以直接使用下面这一份。它会从 GitHub 拉取源码并构建镜像，适合 1Panel 的编排目录里没有源码文件的情况。

```yaml
services:
  nav-item:
    build:
      context: https://github.com/yuhuan457/nav-item.git#main
      dockerfile: Dockerfile
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

更新 GitHub 仓库后，需要在 1Panel 里对这个编排执行“重新构建”或“重建”。只重启容器不会更新前端文件。

## 源码目录 Docker Compose 部署

如果你已经把仓库源码 clone 到服务器本地，并且 `docker-compose.yml` 与 `Dockerfile` 在同一个目录，可以把 `build.context` 改为本地目录：

```yaml
services:
  nav-item:
    build:
      context: .
      dockerfile: Dockerfile
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

## 手动源码部署

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

## 数据持久化

请保留以下挂载：

- `./database:/app/database`：保存 SQLite 数据库
- `./uploads:/app/uploads`：保存上传的图标等文件

## 访问地址

- 前台：`http://服务器IP:3000`
- 后台：`http://服务器IP:3000/admin`

反向代理时，代理目标填写：

```text
http://127.0.0.1:3000
```

## 仓库

GitHub：`https://github.com/yuhuan457/nav-item`
