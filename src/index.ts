import * as vscode from "vscode";
import { Theme } from "./model/package-json";

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