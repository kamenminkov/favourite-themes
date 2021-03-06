import type { ConfigurationChangeEvent } from "vscode";
import { ThemeType } from "../model/package-json";
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

export function getThemeTypeLabel(themeType?: ThemeType): "Dark" | "Light" {
	return themeType === ThemeType.dark ? "Dark" : "Light";
}

export function affectsRelevantConfig(e: ConfigurationChangeEvent): boolean {
	return (
		e.affectsConfiguration("favouriteThemes") ||
		e.affectsConfiguration("workbench.colorTheme")
	);
}
