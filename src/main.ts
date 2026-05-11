import { Notice, Plugin} from 'obsidian';

// Remember to rename these classes and interfaces!

export default class ExportZipPlugin extends Plugin {
	async onload() {
		console.log('ExportZipPlugin loading');
		this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        menu.addItem((item) => {
          item
            .setTitle('Print file path 👈')
            .setIcon('document')
            .onClick(async () => {
              new Notice(file.path);
							console.log(file);
            });
        });
      })
    );

	}

	onunload() {
		console.log('ExportZipPlugin unloading');
	}
}
