import {
	ConfigurationTarget,
	ExtensionContext,
	extensions,
	workspace
} from "vscode";
import {
	BuiltInTheme,
	ExternalTheme,
	Theme,
	ThemeType
} from "../model/package-json";
import { DEFAULT_SORT_ORDER } from "./constants";
import { extensionIsTheme, getThemeName } from "./theme.util";

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

	public async updateSettings(): Promise<void> {
		// this.populateAllThemes();

		this.sortDarkThemesFirst = SettingsManager.getShowDarkThemesFirst();
		this.sortCurrentThemeTypeFirst = SettingsManager.getShowCurrentThemeTypeFirst();
		this.sortPinnedByRecentUsage = SettingsManager.getSortPinnedByRecentUsage();
		this.previouslyPinnedThemes = SettingsManager.getPinnedThemes();
		this.allThemes = SettingsManager.getAllThemes();
		this.showDetailsInPicker = SettingsManager.getShowDetailsInPicker();

		await SettingsManager.storePinnedAndRemoveMissingThemes();
	}

	public static getCurrentColourTheme(): string | undefined {
		return workspace.getConfiguration().get("workbench.colorTheme");
	}

	public static getPinnedThemes(): string[] {
		return workspace.getConfiguration().get("favouriteThemes.pinnedThemes", []);
	}

	public static getThemeTypeSortOrder(): ThemeType[] {
		return workspace
			.getConfiguration()
			.get("favouriteThemes.themeTypeSortOrder", DEFAULT_SORT_ORDER);
	}

	public static async storePinnedAndRemoveMissingThemes(): Promise<
		typeof SettingsManager
	> {
		const allThemes = this.getAllThemes();
		const pinnedThemes = this.getPinnedThemes().filter(t => allThemes.has(t));

		await this.storePinnedThemes(pinnedThemes);

		const lastChosenTheme = this.getCurrentColourTheme();

		const themeExists = this.themeExists(lastChosenTheme as string);

		if (lastChosenTheme && !themeExists) {
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

	private static getAllBuiltInAndExternalThemes():
		| BuiltInTheme[]
		| ExternalTheme[] {
		return extensions.all
			.filter(ext => extensionIsTheme(ext))
			.flatMap(ext => ext.packageJSON.contributes.themes as Theme[]);
	}

	static isBuiltInTheme(theme: Theme): boolean {
		return Object.keys(theme).includes("id");
	}

	public static getAllThemes(): Map<string, BuiltInTheme | ExternalTheme> {
		const allThemes = new Map<string, BuiltInTheme | ExternalTheme>();
		const allThemesFromExtensions = SettingsManager.getAllBuiltInAndExternalThemes().map(
			(theme: Theme) => ({
				...theme,
				name: getThemeName(theme)
			})
		);

		allThemesFromExtensions.map(theme => allThemes.set(theme.name, theme));

		return allThemes;
	}

	public static getCurrentTheme(): Theme | undefined {
		const currentColourThemeId = workspace
			.getConfiguration()
			.get("workbench.colorTheme") as string;

		return this.getAllThemes().get(currentColourThemeId);
	}

	public populateAllThemes(context: ExtensionContext): Thenable<void> {
		const allThemesFromExtensions = SettingsManager.getAllBuiltInAndExternalThemes();

		const thenable = context.globalState.update(
			"allThemes",
			allThemesFromExtensions
		);

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
