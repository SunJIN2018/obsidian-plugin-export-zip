# Obsidian Export-Zip 插件开发任务计划

## 技术方案

### 核心依赖
- **jszip**: 纯浏览器端 zip 库，无 Node 依赖，mobile 兼容

### 关键决策
1. **zip 库选型**：jszip（浏览器原生兼容，体积小，无需 Node API）
2. **图片解析**：正则匹配 markdown 中的图片语法（`![]()`、`![[ ]]`、`<img>` 标签）
3. **保存方式**：Blob + `<a>` 下载链接触发下载（跨平台，desktop/mobile 均可用）
4. **图片读取**：`this.app.vault.adapter.readBinary()` 读取二进制图片

---

## 任务清单

### ✅ 1. 安装依赖 jszip
- [x] 执行 `npm install jszip`（已安装 jszip ^3.10.1）
- [x] 验证 esbuild 能正常打包包含 jszip 的代码（build 通过）

### ✅ 2. 实现 markdown 图片提取工具函数
- [x] 文件：`src/utils/extract-images.ts`
- [x] 从 markdown 文本中提取所有图片引用路径
- [x] 支持三种语法：
  - 标准 markdown：`![alt](path)`
  - Obsidian wikilink：`![[path]]`
  - HTML img 标签：`<img src="path">`
- [x] 去重，返回图片路径列表
- [x] 处理 URL 编码（空格等）

### ✅ 3. 实现 zip 打包与下载逻辑
- [x] 文件：`src/utils/export-zip.ts`
- [x] 输入：markdown 文件路径
- [x] 流程：
  1. 读取 md 文件内容（`vault.read()`）
  2. 调用图片提取函数，获取图片路径列表
  3. 用 jszip 创建 zip：添加 md 文件 + 所有图片
  4. 生成 Blob，创建临时 `<a>` 元素触发下载
  5. zip 文件名与 md 文件同名

### ✅ 4. 注册 file-menu 菜单项
- [x] 文件：`src/main.ts`
- [x] 监听 `file-menu` 事件
- [x] 仅当右键对象为 `.md` 文件时显示"Export as zip"菜单项
- [x] 点击后调用 export-zip 流程

### ✅ 5. 注册 editor-menu 菜单项
- [x] 文件：`src/main.ts`
- [x] 监听 `editor-menu` 事件
- [x] 获取当前活动文件（`workspace.getActiveFile()`）
- [x] 仅当文件为 `.md` 时显示"Export as zip"菜单项
- [x] 点击后调用 export-zip 流程

### ✅ 6. 错误处理与用户提示
- [x] 图片文件不存在时：跳过并用 Notice 提示
- [x] zip 打包/下载失败时：用 Notice 提示错误
- [x] 文件读取异常：catch 并提示

### ✅ 7. 构建与测试
- [x] 执行 `npm run build` 验证编译通过（build + lint 均通过）
- [ ] 手动测试：右键 md 文件 → 导出为 zip → 验证 zip 内容正确
- [ ] 手动测试：编辑器内右键 → 导出为 zip → 验证功能正常

---

## 文件结构（完成后）

```
src/
  main.ts              # 插件入口，注册菜单项
  utils/
    extract-images.ts  # 图片路径提取
    export-zip.ts      # zip 打包与下载
```
