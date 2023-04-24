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
