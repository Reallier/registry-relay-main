# Registry Relay

一个基于 Cloudflare Workers 的 Docker 容器注册表中继服务，支持通过自定义域名访问多个容器注册表。

## 功能特性

- 🚀 基于 Cloudflare Workers，全球 CDN 加速
- 🔄 支持多个主流容器注册表的中继访问
- 🛡️ 自动处理认证和授权
- ⚡ 高性能，低延迟
- 🔧 易于配置和部署

## 支持的注册表

| 注册表 | 域名 | 描述 |
|--------|------|------|
| Docker Hub | `registry-1.docker.io` | Docker 官方注册表 |
| Kubernetes | `registry.k8s.io` | Kubernetes 容器镜像 |
| Google Container Registry | `gcr.io` | Google 容器注册表 |
| Red Hat Quay | `quay.io` | Red Hat 容器注册表 |
| GitHub Container Registry | `ghcr.io` | GitHub 容器注册表 |
| Elastic | `docker.elastic.co` | Elastic Stack 容器镜像 |
| CrunchyData | `registry.developers.crunchydata.com` | PostgreSQL 相关容器 |
| NVIDIA | `nvcr.io` | NVIDIA GPU 容器 |
| LinuxServer.io | `lscr.io` | LinuxServer 社区容器 |
| Microsoft Container Registry | `mcr.microsoft.com` | Microsoft 容器注册表 |
| GitLab | `registry.gitlab.com` | GitLab 容器注册表 |

## 快速开始

### 环境要求

- Node.js 18+
- Bun (推荐) 或 npm
- Cloudflare 账户

### 安装依赖

```bash
# 使用 Bun (推荐)
bun install

# 或使用 npm
npm install
```

### 本地开发

```bash
# 启动本地开发服务器
bun run dev
# 或
npm run dev
```

### 运行测试

```bash
# 运行单元测试
bun run test
# 或
npm run test
```

## 配置

### 环境变量

在 Cloudflare Workers 中配置以下环境变量：

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `DOCKERHUB_ACCESS_DOMAIN` | Docker Hub 访问域名 | `dhcr.yourdomain.com` |
| `K8S_ACCESS_DOMAIN` | Kubernetes 注册表访问域名 | `k8s.yourdomain.com` |
| `QUAY_ACCESS_DOMAIN` | Quay 注册表访问域名 | `quay.yourdomain.com` |
| `GCR_ACCESS_DOMAIN` | GCR 访问域名 | `gcr.yourdomain.com` |
| `GHCR_ACCESS_DOMAIN` | GHCR 访问域名 | `ghcr.yourdomain.com` |
| `ELASTIC_ACCESS_DOMAIN` | Elastic 访问域名 | `elastic.yourdomain.com` |
| `CRUNCHYDATA_ACCESS_DOMAIN` | CrunchyData 访问域名 | `crunchydata.yourdomain.com` |
| `NVCR_ACCESS_DOMAIN` | NVIDIA 访问域名 | `nvcr.yourdomain.com` |
| `LSCR_ACCESS_DOMAIN` | LinuxServer.io 访问域名 | `lscr.yourdomain.com` |
| `MCR_ACCESS_DOMAIN` | Microsoft 访问域名 | `mcr.yourdomain.com` |
| `GITLAB_ACCESS_DOMAIN` | GitLab 访问域名 | `gitlab.yourdomain.com` |

### 自定义域名配置

在 `wrangler.toml` 中配置路由：

```toml
routes = [
  { pattern = "dhcr.yourdomain.com", custom_domain = true },
  { pattern = "k8s.yourdomain.com", custom_domain = true },
  { pattern = "quay.yourdomain.com", custom_domain = true },
  # ... 其他域名
]
```

## 部署

### 部署到 Cloudflare Workers

1. 确保已配置 Cloudflare 账户和 wrangler
2. 修改 `wrangler.toml` 中的域名配置
3. 部署到 Cloudflare：

```bash
bun run deploy
# 或
npm run deploy
```

### DNS 配置

在你的 DNS 提供商处为每个子域名添加 CNAME 记录，指向：

```
dhcr.yourdomain.com CNAME your-worker-subdomain.workers.dev
k8s.yourdomain.com CNAME your-worker-subdomain.workers.dev
# ... 其他域名
```

## 使用方法

配置 Docker 或容器运行时使用相应的域名：

```bash
# Docker Hub
docker pull dhcr.yourdomain.com/library/nginx:latest

# Kubernetes
docker pull k8s.yourdomain.com/pause:3.9

# GitHub Container Registry
docker pull ghcr.yourdomain.com/owner/repo:tag
```

## 开发

### 项目结构

```
registry-relay-main/
├── src/
│   ├── index.ts      # 主入口文件
│   ├── types.ts      # 类型定义
│   └── patches.ts    # 请求处理补丁
├── test/
│   └── index.spec.ts # 测试文件
├── package.json      # 项目配置
├── wrangler.toml     # Cloudflare 配置
└── tsconfig.json     # TypeScript 配置
```

### 添加新的注册表

1. 在 `src/index.ts` 的 `Env` 接口中添加新的环境变量
2. 在 `generatePairs` 函数中添加新的注册表配置
3. 在 `wrangler.toml` 中添加路由和变量配置

## 测试

项目使用 Vitest 进行测试：

```bash
bun run test
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 注意事项

- 请确保域名配置正确，避免 DNS 解析问题
- Cloudflare Workers 有一定的免费额度限制
- 对于私有注册表，需要确保相应的认证配置