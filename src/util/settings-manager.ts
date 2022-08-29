import {
	ConfigurationTarget,
	ExtensionContext,
	extensions,
	window,
	workspace
} from "vscode";
import { Theme } from "../model/package-json";

export class SettingsManager {
	public sortDarkThemesFirst: boolean = false;
	public sortCurrentThemeTypeFirst: boolean = false;

	public sortPinnedByRecentUsage: boolean = false;
	public previouslyPinnedThemes: string[] = [];
	public showDetailsInPicker: boolean = false;

	public allThemes: Map<string, Theme> = new Map();

	constructor() {
		this.updateSettings();
	}

	public updateSettings(): void {
		// this.populateAllThemes();

		this.sortDarkThemesFirst = SettingsManager.getShowDarkThemesFirst();
		this.sortCurrentThemeTypeFirst = SettingsManager.getShowCurrentThemeTypeFirst();
		this.sortPinnedByRecentUsage = SettingsManager.getSortPinnedByRecentUsage();
		this.previouslyPinnedThemes = SettingsManager.getPinnedThemes();
		this.allThemes = SettingsManager.getAllThemes();
		this.showDetailsInPicker = SettingsManager.getShowDetailsInPicker();

		SettingsManager.removeMissingThemes();
	}

	public static getCurrentColourTheme(): string | undefined {
		return workspace.getConfiguration().get("workbench.colorTheme");
	}

	public static getPinnedThemes(): string[] {
		return workspace.getConfiguration().get("favouriteThemes.pinnedThemes", []);
	}

	public static removeMissingThemes(): typeof SettingsManager {
		const allThemes = this.getAllThemes();
		const pinnedThemes = this.getPinnedThemes().filter(t => allThemes.has(t));

		this.storePinnedThemes(pinnedThemes);

		const lastChosenTheme = this.getCurrentColourTheme();

		if (lastChosenTheme && !this.themeExists(lastChosenTheme)) {
			const firstFavouriteTheme = this.getPinnedThemes()[0];
			this.setCurrentColourTheme(firstFavouriteTheme);
		}

		return this;
	}

	public static themeExists(theme: string): boolean {
		return (
			this.getAllThemes().has(theme) ||
			Array.from(this.getAllThemes().values()).some(
				t => t.id === theme || t.label === theme
			)
		);
	}

	public static getShowDarkThemesFirst(): boolean {
		return workspace
			.getConfiguration()
			.get("favouriteThemes.darkThemesFirst", true);
	}

	static getShowCurrentThemeTypeFirst(): boolean {
		const settingKey = "favouriteThemes.showThemesOfCurrentTypeFirst";
		const defaultValue: boolean = workspace
			.getConfiguration()
			.inspect(settingKey)!.defaultValue as boolean;

		return workspace.getConfiguration().get(settingKey, defaultValue);
	}

	public static getSortPinnedByRecentUsage(): boolean {
		return workspace
			.getConfiguration()
			.get("favouriteThemes.sortPinnedByRecentUsage", false);
	}

	private static getAllThemesFromExtensions(): Theme[] {
		return extensions.all
			.filter(
				ext =>
					ext.packageJSON.contributes &&
					Object.keys(ext.packageJSON.contributes).includes("themes")
			)
			.flatMap(ext => ext.packageJSON.contributes.themes as Theme[]);
	}

	public static getAllThemes(): Map<string, Theme> {
		const allThemes = new Map<string, Theme>();

		SettingsManager.getAllThemesFromExtensions().map(theme =>
			allThemes.set(theme.label, theme)
		);

		return allThemes;
	}

	public static getCurrentTheme(): Theme | undefined {
		const currentColourThemeId = workspace
			.getConfiguration()
			.get("workbench.colorTheme") as string;

		return this.getAllThemes().get(currentColourThemeId);
	}

	public populateAllThemes(context: ExtensionContext): Thenable<void> {
		const allThemesFromExtensions = SettingsManager.getAllThemesFromExtensions();

		const thenable = context.globalState.update(
			"allThemes",
			allThemesFromExtensions
		);

		// debugger;

		return thenable;
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
