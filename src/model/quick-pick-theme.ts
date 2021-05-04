import { QuickPickItem } from "vscode";
import { ThemeType } from "./package-json";

export type QuickPickTheme = QuickPickItem & {
	label: string;
	type: ThemeType;
};
