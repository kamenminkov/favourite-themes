import * as vscode from "vscode";

export function getCurrentColourTheme(): string | undefined {
	return vscode.workspace.getConfiguration().get("workbench.colorTheme");
}

export function getPinnedThemes(): string[] {
	return vscode.workspace
		.getConfiguration()
		.get("favouriteThemes.pinnedThemes", []);
}

export function getShowDarkThemesFirst(): boolean {
	return vscode.workspace
		.getConfiguration()
		.get("favouriteThemes.darkThemesFirst", true);
}

export function getSortPinnedByRecentUsage(): boolean {
	return vscode.workspace
		.getConfiguration()
		.get("favouriteThemes.sortPinnedByRecentUsage", false);
}
