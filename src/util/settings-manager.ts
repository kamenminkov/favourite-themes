import { ConfigurationTarget, extensions, workspace } from "vscode";
import { Theme } from "../model/package-json";

export class SettingsManager {
	public sortDarkThemesFirst: boolean = false;
	public sortPinnedByRecentUsage: boolean = false;
	public previouslyPinnedThemes: string[] = [];
	public allThemes: Map<string, Theme> = new Map();
	public showDetailsInPicker: boolean = false;

	constructor() {
		this.updateSettings();
	}

	public updateSettings(): void {
		this.sortDarkThemesFirst = SettingsManager.getShowDarkThemesFirst();
		this.sortPinnedByRecentUsage = SettingsManager.getSortPinnedByRecentUsage();
		this.previouslyPinnedThemes = SettingsManager.getPinnedThemes();
		this.allThemes = SettingsManager.getAllThemes();
		this.showDetailsInPicker = SettingsManager.getShowDetailsInPicker();

		SettingsManager.removeMissingThemes();
	}

	public static getCurrentTheme(): string | undefined {
		return workspace.getConfiguration().get("workbench.colorTheme");
	}

	public static getPinnedThemes(): string[] {
		return workspace.getConfiguration().get("favouriteThemes.pinnedThemes", []);
	}

	public static removeMissingThemes(): typeof SettingsManager {
		const allThemes = this.getAllThemes();
		const pinnedThemes = this.getPinnedThemes().filter(t => allThemes.has(t));

		this.storePinnedThemes(pinnedThemes);

		const lastChosenTheme = this.getCurrentTheme();

		if (lastChosenTheme && !this.themeExists(lastChosenTheme)) {
			const firstFavouriteTheme = this.getPinnedThemes()[0];
			this.setCurrentColourTheme(firstFavouriteTheme);
		}

		return this;
	}

	public static themeExists(theme: string): boolean {
		return this.getAllThemes().has(theme);
	}

	public static getShowDarkThemesFirst(): boolean {
		return workspace
			.getConfiguration()
			.get("favouriteThemes.darkThemesFirst", true);
	}

	public static getSortPinnedByRecentUsage(): boolean {
		return workspace
			.getConfiguration()
			.get("favouriteThemes.sortPinnedByRecentUsage", false);
	}

	private static getAllThemes(): Map<string, Theme> {
		const allThemes = new Map<string, Theme>();

		extensions.all
			.filter(
				ext =>
					ext.packageJSON.contributes &&
					Object.keys(ext.packageJSON.contributes).includes("themes")
			)
			.flatMap(ext => ext.packageJSON.contributes.themes as Theme[])
			.map(theme => allThemes.set(theme.label, theme));

		return allThemes;
	}

	private static getShowDetailsInPicker(): boolean {
		return workspace
			.getConfiguration()
			.get("favouriteThemes.showExtraQuickPickDetails", false);
	}

	public static async setCurrentColourTheme(theme: string): Promise<void> {
		return await workspace
			.getConfiguration()
			.update("workbench.colorTheme", theme, ConfigurationTarget.Global);
	}

	public static async storePinnedThemes(themes: string[]): Promise<void> {
		return await workspace
			.getConfiguration()
			.update(
				"favouriteThemes.pinnedThemes",
				themes,
				ConfigurationTarget.Global
			);
	}
}
