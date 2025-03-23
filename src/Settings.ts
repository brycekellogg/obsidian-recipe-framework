/**
 * This file contains all the "settings" related functoinality for
 * the Obsidian Recipe Framework Plugin. This includes the possible
 * settings to configure, the default values, and the GUI for setting
 * values in the Obsidian settings window.
 *
 * Author: Bryce Kellogg
 * License: GPLv3
 */
import RecipeFramework from 'main';
import {
    App,
    PluginSettingTab,
    Setting,
} from 'obsidian';


/**
 *
 */
export interface Settings {
    LogPath:string;
    RecipePath:string;
    CookPath: string;
}


/**
 *
 */
export const DEFAULT_SETTINGS : Settings = {
    LogPath: "Food/Logs",
    RecipePath: "Food/Recipes",
    CookPath: "Food/Logs/Cooks.yaml",
}


/**
 *
 */
export class RecipeFrameworkSettingsTab extends PluginSettingTab {
	plugin: RecipeFramework;

	constructor(app: App, plugin: RecipeFramework) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Recipes Folder Location")
			.setDesc("Files in this folder will be available as recipes.")
			.addText(text => text
				.setValue(this.plugin.settings.RecipePath)
				.onChange(async (value) => {
					this.plugin.settings.RecipePath = value;
					await this.plugin.saveSettings();
				}));
	}
}
