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
import { GlobalContextKeys, RelatedConfigKey } from "./config";
import {
	DEFAULT_SHOW_THEMES_OF_CURRENT_TYPE_FIRST,
	DEFAULT_SORT_ORDER,
	DEFAULT_THEME_SELECTION_DELAY,
	DEFAULT_UPDATE_PREFERRED_THEMES
} from "./constants";
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
	public updatePreferredThemes: boolean = DEFAULT_UPDATE_PREFERRED_THEMES;
	private static context: ExtensionContext;

	constructor() {
		// this.updateSettings();
	}

	public updateSettings(context?: ExtensionContext): void {
		if (context) {
			this.setContext(context);
		}

		// this.populateAllThemes();

		this.sortCurrentThemeTypeFirst = SettingsManager.getShowCurrentThemeTypeFirst();
		this.sortPinnedByRecentUsage = SettingsManager.getSortPinnedByRecentUsage();
		this.previouslyPinnedThemes = SettingsManager.getPinnedThemes();
		this.allThemes = SettingsManager.getAllThemes();
		this.showDetailsInPicker = SettingsManager.getShowDetailsInPicker();
		this.currentTheme = SettingsManager.getCurrentTheme() as Theme;
		this.themeTypeSortOrder = SettingsManager.getThemeTypeSortOrder();
		this.themeSelectionDelay = SettingsManager.getThemeSelectionDelay();
		this.updatePreferredThemes = SettingsManager.getUpdatePreferredThemes();

		SettingsManager.storePinnedAndRemoveMissingThemes();
	}

	public populateAllThemes(): Thenable<void> {
		const allThemesFromExtensions = SettingsManager.getAllThemes();

		const thenable = SettingsManager.context.globalState.update(
			GlobalContextKeys.allThemes,
			allThemesFromExtensions
		);

		return thenable;
	}

	public setContext(context: ExtensionContext): SettingsManager {
		SettingsManager.context = context;

		return this;
	}

	public static async storePinnedAndRemoveMissingThemes(): Promise<
		typeof SettingsManager
	> {
		const allThemes = SettingsManager.getAllThemesFromContext();
		const pinnedThemes = this.getPinnedThemes().filter(t => allThemes.has(t));

		await this.storePinnedThemes(pinnedThemes);

		const lastChosenTheme = this.getCurrentColourThemeName();

		const themeExists = this.themeExists(lastChosenTheme as string);

		if (lastChosenTheme && !themeExists) {
			const firstFavouriteThemeName = this.getPinnedThemes()[0];
			const firstFavouriteTheme = allThemes.get(firstFavouriteThemeName);
			this.setCurrentColourTheme(firstFavouriteTheme as Theme);
		}

		return this;
	}

	public static getCurrentColourThemeName(): string | undefined {
		return workspace
			.getConfiguration()
			.get(RelatedConfigKey.currentColourTheme);
	}

	public static async setCurrentColourTheme(theme: Theme): Promise<void> {
		if (this.getUpdatePreferredThemes()) {
			switch (theme.uiTheme) {
				case ThemeType.dark:
				case ThemeType.hcBlack:
					await this.updateGlobalSetting(
						RelatedConfigKey.preferredDarkColourTheme,
						theme.name
					);
					break;
				case ThemeType.light:
				case ThemeType.hcLight:
					await this.updateGlobalSetting(
						RelatedConfigKey.preferredLightColourTheme,
						theme.name
					);
					break;
			}
		}

		return await this.updateGlobalSetting(
			RelatedConfigKey.currentColourTheme,
			theme.name
		);
	}

	public static async storePinnedThemes(themes: string[]): Promise<void> {
		return this.updateGlobalSetting(ConfigKey.pinnedThemes, themes);
	}

	public static getPinnedThemes(): string[] {
		return workspace.getConfiguration().get(ConfigKey.pinnedThemes, []);
	}

	private static getThemeTypeSortOrder(): ThemeType[] {
		return workspace
			.getConfiguration()
			.get(ConfigKey.themeTypeSortOrder, DEFAULT_SORT_ORDER);
	}

	private static getThemeSelectionDelay(): number {
		return workspace
			.getConfiguration()
			.get(ConfigKey.themeSelectionDelay, DEFAULT_THEME_SELECTION_DELAY);
	}

	private static themeExists(theme: string): boolean {
		return this.getAllThemesFromContext().has(theme);
	}

	private static getShowDarkThemesFirst(): boolean {
		return workspace.getConfiguration().get(ConfigKey.darkThemesFirst, true);
	}

	private static getShowCurrentThemeTypeFirst(): boolean {
		return workspace
			.getConfiguration()
			.get(
				ConfigKey.showThemesOfCurrentTypeFirst,
				DEFAULT_SHOW_THEMES_OF_CURRENT_TYPE_FIRST
			);
	}

	private static getSortPinnedByRecentUsage(): boolean {
		return workspace
			.getConfiguration()
			.get(ConfigKey.sortPinnedByRecentUsage, false);
	}

	private static getAllBuiltInAndExternalThemes():
		| BuiltInTheme[]
		| ExternalTheme[] {
		return extensions.all
			.filter(ext => extensionIsTheme(ext))
			.flatMap(ext => ext.packageJSON.contributes.themes as Theme[]);
	}

	public static getAllThemesFromContext(
		context: ExtensionContext | null = SettingsManager.context as ExtensionContext
	): Map<string, BuiltInTheme | ExternalTheme> {
		if (!this.context) {
			throw new Error("No context found");
		}

		return this.context.globalState.get(GlobalContextKeys.allThemes) as Map<
			string,
			BuiltInTheme | ExternalTheme
		>;
	}

	private static getAllThemes(): Map<string, BuiltInTheme | ExternalTheme> {
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

	private static getCurrentTheme(): Theme {
		const currentColourThemeId = workspace
			.getConfiguration()
			.get(RelatedConfigKey.currentColourTheme) as string;

		return this.getAllThemes().get(currentColourThemeId) as Theme;
	}

	private static getShowDetailsInPicker(): boolean {
		return workspace
			.getConfiguration()
			.get(ConfigKey.showExtraQuickPickDetails, false);
	}

	private static getUpdatePreferredThemes(): boolean {
		return workspace
			.getConfiguration()
			.get(ConfigKey.updatePreferredThemes, DEFAULT_UPDATE_PREFERRED_THEMES);
	}

	private static async updateGlobalSetting(
		sectionKey: string,
		value: any
	): Promise<void> {
		return await workspace
			.getConfiguration()
			.update(sectionKey, value, ConfigurationTarget.Global);
	}
}
