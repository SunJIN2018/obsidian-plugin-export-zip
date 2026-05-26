# Obsidian Export Zip Plugin

[English](#features) | [中文](README.zh.md)

An Obsidian plugin that exports Markdown files with their referenced images as ZIP archives.

## Features

- Export Markdown files as ZIP archives
- Automatically collect and package referenced images
- Support multiple image sources:
  - Local images in Vault
  - Network images (HTTP/HTTPS)
  - Data URI format images (base64 encoded)
- Automatically convert Obsidian Wiki links `![[image.png]]` to standard Markdown links `![](image.png)`
- Images are stored in the `assets` folder within the ZIP

## Installation

### Method 1: Community Plugins

1. Open Obsidian Settings
2. Go to **Community plugins** → **Browse**
3. Search for "Export Zip"
4. Click **Install** → **Enable**

### Method 2: Manual Installation

1. Download the latest `main.js` and `manifest.json` files
2. Copy to your Vault directory: `<VaultFolder>/.obsidian/plugins/export-zip/`
3. Reload Obsidian
4. Enable "Export Zip" in **Settings** → **Community plugins**

## Usage

1. Right-click on any Markdown file in the file list
2. Select **Export as zip**
3. Choose save location (if supported by browser)
4. Wait for export to complete

You can also right-click in the editor and select **Export as zip** from the context menu.

A notification will show the number of exported images after successful export.

## Development

### Requirements

- Node.js 18+
- npm

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Code Linting

```bash
npm run lint
```

## License

[MIT](LICENSE)