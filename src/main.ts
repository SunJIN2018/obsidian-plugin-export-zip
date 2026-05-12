import { Notice, Plugin, TFile } from 'obsidian';
import { exportFileAsZip } from './utils/export-zip';

export default class ExportZipPlugin extends Plugin {
	async onload() {
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (!(file instanceof TFile) || file.extension !== 'md') return;
				menu.addItem((item) => {
					item
						.setTitle('Export as zip')
						.setIcon('archive')
						.onClick(async () => {
							await this.handleExport(file);
						});
				});
			})
		);

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu) => {
				const file = this.app.workspace.getActiveFile();
				if (!file || file.extension !== 'md') return;
				menu.addItem((item) => {
					item
						.setTitle('Export as zip')
						.setIcon('archive')
						.onClick(async () => {
							await this.handleExport(file);
						});
				});
			})
		);
	}

	onunload() {}

	private async handleExport(file: TFile): Promise<void> {
		try {
			const result = await exportFileAsZip(this.app, file);
			if (result.saved) {
				new Notice(`已导出: ${file.basename}.zip (${result.imageCount} 张图片)`);
			}
		} catch (err) {
			console.error('Export zip failed:', err);
			new Notice('导出失败，请查看控制台了解详情。');
		}
	}
}
