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
import { ConfigKey } from "../model/package-json.config";
import { DEFAULT_SORT_ORDER, DEFAULT_THEME_SELECTION_DELAY } from "./constants";
import { extensionIsTheme, getThemeName } from "./theme.util";

export class SettingsManager {
	public sortCurrentThemeTypeFirst: boolean = false;

	public sortPinnedByRecentUsage: boolean = false;
	public previouslyPinnedThemes: string[] = [];
	public showDetailsInPicker: boolean = false;

	public allThemes: Map<string, Theme> = new Map();
	public currentTheme: Theme | undefined;
	public themeTypeSortOrder: ThemeType[] = DEFAULT_SORT_ORDER;
	public themeSelectionDelay: number = DEFAULT_THEME_SELECTION_DELAY;

	constructor() {
		this.updateSettings();
	}

	public async updateSettings(): Promise<void> {
		// this.populateAllThemes();

		this.sortCurrentThemeTypeFirst = SettingsManager.getShowCurrentThemeTypeFirst();
		this.sortPinnedByRecentUsage = SettingsManager.getSortPinnedByRecentUsage();
		this.previouslyPinnedThemes = SettingsManager.getPinnedThemes();
		this.allThemes = SettingsManager.getAllThemes();
		this.showDetailsInPicker = SettingsManager.getShowDetailsInPicker();
		this.currentTheme = SettingsManager.getCurrentTheme() as Theme;
		this.themeTypeSortOrder = SettingsManager.getThemeTypeSortOrder();
		this.themeSelectionDelay = SettingsManager.getThemeSelectionDelay();

		// TODO: Use ConfigKey for all settings instead of hardcoded strings

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

	static getThemeSelectionDelay(): number {
		return workspace
			.getConfiguration()
			.get(ConfigKey.themeSelectionDelay, DEFAULT_THEME_SELECTION_DELAY);
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

	public static getCurrentTheme(): Theme {
		const currentColourThemeId = workspace
			.getConfiguration()
			.get("workbench.colorTheme") as string;

		return this.getAllThemes().get(currentColourThemeId) as Theme;
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
