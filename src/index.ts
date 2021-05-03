import * as vscode from "vscode";
import { Theme, ThemeType } from "./model/package-json";
import { QuickPickTheme } from "./model/quick-pick-theme";

export function getAllThemes(): Theme[] {
	return vscode.extensions.all
		.filter(
			(ext: vscode.Extension<any>) =>
				ext.packageJSON.contributes &&
				Object.keys(ext.packageJSON.contributes).includes("themes")
		)
		.flatMap(ext => ext.packageJSON.contributes.themes);
}

export function getCurrentColourTheme(): string | undefined {
	return vscode.workspace.getConfiguration().get("workbench.colorTheme");
}

export async function setCurrentColourTheme(theme: string): Promise<void> {
	return await vscode.workspace
		.getConfiguration()
		.update("workbench.colorTheme", theme, vscode.ConfigurationTarget.Global);
}

export async function storePinnedThemes(themes: string[]): Promise<void> {
	return await vscode.workspace
		.getConfiguration()
		.update(
			"favouriteThemes.pinnedThemes",
			themes,
			vscode.ConfigurationTarget.Global
		);
}

export function uniq<T>(input: T[]): T[] {
	return input.filter((elem, i, array) => array.indexOf(elem) === i);
}

export function sortThemesByPinnedStatus(
	a: QuickPickTheme,
	b: QuickPickTheme,
	pinnedThemes?: string[]
) {
	if (pinnedThemes?.includes(a.label) && !pinnedThemes?.includes(b.label)) {
		return -1;
	} else if (
		!pinnedThemes?.includes(a.label) &&
		pinnedThemes?.includes(b.label)
	) {
		return 1;
	} else {
		return 0;
	}
}

export function sortThemesByType(
	a: QuickPickTheme,
	b: QuickPickTheme
): 0 | 1 | -1 {
	// TODO: Make dark/light order configurable

	if (a.type === b.type) {
		return 0;
	} else {
		if (a.type === ThemeType.dark && b.type === ThemeType.light) {
			return -1;
		} else {
			return 1;
		}
	}
}
