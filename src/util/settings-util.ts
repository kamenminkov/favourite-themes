import * as vscode from "vscode";

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
