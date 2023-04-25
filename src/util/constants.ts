import { ThemeType } from "../model/package-json";

import {
	ConfigKey,
	getConfigDefaultFromPackageJson
} from "../model/package-json.config";

export const DEFAULT_SORT_ORDER = getConfigDefaultFromPackageJson(
	ConfigKey.themeTypeSortOrder
) as ThemeType[];

export const DEFAULT_THEME_SELECTION_DELAY = getConfigDefaultFromPackageJson(
	ConfigKey.themeSelectionDelay
) as number;

export const DEFAULT_SHOW_THEMES_OF_CURRENT_TYPE_FIRST = getConfigDefaultFromPackageJson(
	ConfigKey.showThemesOfCurrentTypeFirst
) as boolean;

export const DEFAULT_UPDATE_PREFERRED_THEMES = getConfigDefaultFromPackageJson(
	ConfigKey.updatePreferredThemes
) as boolean;
