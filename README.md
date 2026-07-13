# 医院挂号小程序

基于微信小程序 + Node.js 的医院在线挂号系统，支持患者挂号、支付、就诊记录查询以及管理员后台管理。

## 功能模块

**患者端**
- 科室浏览与医生搜索
- 在线预约挂号，支持微信支付/支付宝/医保卡
- 挂号记录查询与就诊历史
- 个人信息管理
- 在线咨询与常见问题

**管理端**
- 患者管理（增删改查）
- 医生管理（上下架、排班、最大挂号数）
- 科室管理
- 挂号管理（状态更新）
- 数据分析看板
- 系统设置（医院信息、支付方式、通知类型等）

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | 微信小程序（Skyline 渲染引擎 + glass-easel 组件框架） |
| 后端 | Node.js + Express 5.1 |
| 数据库 | MySQL |
| 通信 | RESTful API（JSON） |

## 项目结构

```
├── app.js / app.json / app.wxss    # 小程序入口
├── pages/                          # 页面
│   ├── index/                      # 首页（科室、公告、快捷入口）
│   ├── login/                      # 登录
│   ├── profile/                    # 个人中心
│   ├── doctorList/                 # 医生列表
│   ├── doctorDetail/               # 医生详情
│   ├── register/                   # 预约挂号
│   ├── registration/              # 挂号确认/支付
│   ├── registrations/             # 我的挂号记录
│   ├── visits/                     # 就诊历史
│   ├── chat/                       # 在线咨询
│   ├── faq/                        # 常见问题
│   ├── edit/                       # 信息编辑
│   └── admin/                      # 管理端
│       ├── dashboard/              # 仪表盘
│       ├── departments/            # 科室管理
│       ├── doctors/                # 医生管理
│       ├── registrations/          # 挂号管理
│       ├── analysis/               # 数据分析
│       └── settings/               # 系统设置
├── components/                     # 公共组件
│   └── navigation-bar/            # 自定义导航栏
├── server/                         # 后端服务
│   ├── server.js                   # Express 服务入口（端口 3000）
│   ├── package.json
│   └── *.sql                       # 数据库脚本
├── images/                         # 图片资源
├── request.js                      # 网络请求封装
└── project.config.json             # 微信小程序配置
```

## 快速开始

### 1. 数据库初始化

创建 MySQL 数据库并导入测试数据：

```sql
CREATE DATABASE db_school;
-- 按需执行 server/ 目录下的 SQL 脚本
```

默认数据库配置（可在 `server/server.js` 中修改）：

```js
host: 'localhost'
user: 'root'
password: '123456'
database: 'db_school'
```

### 2. 启动后端服务

```bash
cd server
npm install
node server.js
```

服务运行在 `http://localhost:3000`。

### 3. 启动小程序

1. 下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目目录，AppID 使用 `wx5342f3084c23dd23` 或替换为自己的
3. 在开发者工具中预览/调试

## API 概览

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/patient/login` | 患者登录 |
| POST | `/api/admin/login` | 管理员登录 |
| POST | `/api/doctor/login` | 医生登录 |
| GET | `/api/patient/all` | 获取所有患者 |
| POST | `/api/patient/add` | 添加患者 |
| POST | `/api/patient/edit` | 修改患者 |
| POST | `/api/patient/delete` | 删除患者 |
| GET | `/api/departments` | 获取科室列表 |
| GET | `/api/doctors` | 获取医生列表 |
| POST | `/api/doctors/add` | 添加医生 |
| POST | `/api/doctors/edit` | 编辑医生 |
| POST | `/api/doctors/delete` | 删除医生 |
| POST | `/api/registration/add` | 挂号并支付 |
| GET | `/api/registrations` | 查询挂号记录 |
| GET | `/api/visit/history` | 就诊历史 |
| GET | `/api/settings` | 系统设置 |

## 注意事项

- `server/node_modules/` 和 `project.private.config.json` 已加入 `.gitignore`，不会提交到仓库
- 后端数据库密码为明文测试用，生产环境请修改并加密存储
- 微信支付为模拟流程，实际对接需接入微信支付 SDK
