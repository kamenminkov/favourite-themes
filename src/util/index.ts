import type { ConfigurationChangeEvent } from "vscode";
import { Theme, ThemeType, ThemeTypeLabel } from "../model/package-json";
import { QuickPickTheme } from "../model/quick-pick-theme";

export function uniq<T>(input: T[]): T[] {
	return input.filter((elem, i, array) => array.indexOf(elem) === i);
}

export function sortThemesByType(
	a: QuickPickTheme,
	b: QuickPickTheme,
	sortOrder: ThemeType[],
	currentThemeType: ThemeType | null = null
): 0 | 1 | -1 {
	currentThemeType && sortOrder.sort(a => (a === currentThemeType ? -1 : 0));

	const indexA = sortOrder.findIndex(t => a.type === t);
	const indexB = sortOrder.findIndex(t => b.type === t);

	if (indexA === indexB) {
		return 0;
	} else {
		return indexA - indexB < 0 ? -1 : 1;
	}
}

export function getThemeTypeLabel(theme: Theme): ThemeTypeLabel {
	switch (theme.uiTheme) {
		case ThemeType.dark:
			return "Dark";
		case ThemeType.hcBlack:
			return "High Contrast Dark";
		case ThemeType.hcLight:
			return "High Contrast Light";
		case ThemeType.light:
			return "Light";
	}
}

function themeIsHighContrast(themeType?: ThemeType): boolean {
	return themeType !== ThemeType.dark && themeType !== ThemeType.light;
}

export function affectsRelevantConfig(e: ConfigurationChangeEvent): boolean {
	return (
		e.affectsConfiguration("favouriteThemes") ||
		e.affectsConfiguration("workbench.colorTheme")
	);
}
