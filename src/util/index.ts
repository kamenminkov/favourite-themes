import type { ConfigurationChangeEvent } from "vscode";
import { Theme, ThemeType } from "../model/package-json";
import { QuickPickTheme } from "../model/quick-pick-theme";

export function uniq<T>(input: T[]): T[] {
	return input.filter((elem, i, array) => array.indexOf(elem) === i);
}

export function sortThemesByType(
	a: QuickPickTheme,
	b: QuickPickTheme,
	darkThemesFirst: boolean = true
): 0 | 1 | -1 {
	if (a.type === b.type) {
		return 0;
	} else {
		if (a.type === ThemeType.dark && b.type === ThemeType.light) {
			return darkThemesFirst ? -1 : 1;
		} else {
			return darkThemesFirst ? 1 : -1;
		}
	}
}

export function getThemeTypeLabel(theme: Theme): "Dark" | "Light" {
	// log

	if (themeIsHighContrast(theme.uiTheme)) {
		if (theme.label.match(/dark/im)) {
			return "Dark";
		} else if (theme.label.match(/light/im)) {
			return "Light";
		}
	}

	return theme.uiTheme === ThemeType.dark ? "Dark" : "Light";
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
