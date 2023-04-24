import { contributes } from "../../package.json";

export enum ConfigKey {
	pinnedThemes = "favouriteThemes.pinnedThemes",
	themeTypeSortOrder = "favouriteThemes.themeTypeSortOrder",
	sortPinnedByRecentUsage = "favouriteThemes.sortPinnedByRecentUsage",
	showExtraQuickPickDetails = "favouriteThemes.showExtraQuickPickDetails",
	showThemesOfCurrentTypeFirst = "favouriteThemes.showThemesOfCurrentTypeFirst",
	darkThemesFirst = "favouriteThemes.darkThemesFirst",
	themeSelectionDelay = "favouriteThemes.themeSelectionDelay"
}

export function getConfigDefaultFromPackageJson(key: ConfigKey) {
	return contributes.configuration.find(c => c.properties[key])?.properties[key]
		?.default;
}
