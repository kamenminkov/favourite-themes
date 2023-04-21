import { Extension } from "vscode";
import { BuiltInTheme, ExternalTheme } from "../model/package-json";

export function getThemeName(t: BuiltInTheme | ExternalTheme): string {
	return (t as BuiltInTheme).id || (t as ExternalTheme).label;
}

export function extensionIsTheme(ext: Extension<any>): unknown {
	return (
		ext.packageJSON.contributes &&
		Object.keys(ext.packageJSON.contributes).includes("themes")
	);
}
