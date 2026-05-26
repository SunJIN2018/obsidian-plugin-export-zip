# Obsidian Export Zip Plugin

[English](README.md) | [中文](#功能特性)

这是一个 Obsidian 插件，可以将 Markdown 文件及其引用的图片打包成 ZIP 压缩包导出。

## 功能特性

- 将 Markdown 文件导出为 ZIP 压缩包
- 自动收集并打包文件中引用的图片
- 支持多种图片来源：
  - Vault 内的本地图片
  - 网络图片（HTTP/HTTPS）
  - Data URI 格式的图片（base64 编码）
- 自动将 Obsidian 的 Wiki 链接 `![[image.png]]` 转换为标准 Markdown 链接 `![](image.png)`
- 图片统一存放在 ZIP 包的 `assets` 文件夹中

## 安装

### 方法一：社区插件市场

1. 打开 Obsidian 设置
2. 进入 **第三方插件** → **浏览**
3. 搜索 "Export Zip"
4. 点击 **安装** → **启用**

### 方法二：手动安装

1. 下载最新的 `main.js`、`manifest.json` 文件
2. 复制到你的 Vault 目录：`<VaultFolder>/.obsidian/plugins/export-zip/`
3. 重新加载 Obsidian
4. 在 **设置** → **第三方插件** 中启用 "Export Zip"

## 使用方法

1. 在文件列表中右键点击任意 Markdown 文件
2. 选择 **Export as zip**
3. 选择保存位置（如果浏览器支持）
4. 等待导出完成

也可以在编辑器中右键点击，从上下文菜单中选择 **Export as zip**。

导出成功后会显示通知，包含导出的图片数量。

## 开发

### 环境要求

- Node.js 18+
- npm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 许可证

[MIT](LICENSE)