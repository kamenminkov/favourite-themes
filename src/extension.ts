import * as vscode from "vscode";
import {
	getAllThemes,
	setCurrentColourTheme,
	sortThemesByType,
	storePinnedThemes,
	uniq
} from ".";
import { Theme } from "./model/package-json";
import { QuickPickTheme } from "./model/quick-pick-theme";
import * as settings from "./util/settings-util";

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		"favourite-themes.selectColourTheme",
		() => {
			const darkThemesFirst: boolean = settings.getShowDarkThemesFirst();
			const previouslyPinnedThemes: string[] = settings.getPinnedThemes();
			const allThemes: Theme[] = getAllThemes();

			const pinnedThemes: QuickPickTheme[] = allThemes
				.filter(t => previouslyPinnedThemes.includes(t.label))
				.map(theme => ({
					label: theme.label,
					type: theme.uiTheme,
					picked: true
				}));

			const nonPinnedThemes: QuickPickTheme[] = allThemes
				.filter(t => !previouslyPinnedThemes.includes(t.label))
				.map(theme => ({
					label: theme.label,
					type: theme.uiTheme,
					picked: false
				}));

			const quickPickThemes: QuickPickTheme[] = [
				pinnedThemes,
				nonPinnedThemes
			].flatMap(themeSet =>
				themeSet.sort((a, b) => sortThemesByType(a, b, darkThemesFirst))
			);

			// TODO: Add customizable display besides just theme label

			vscode.window
				.showQuickPick(quickPickThemes, {
					canPickMany: true,
					onDidSelectItem: (selectedTheme: { label: string }) => {
						setCurrentColourTheme(selectedTheme.label)
							.then(r => {
								console.log(`Theme set to ${selectedTheme.label}`);
								console.log(r);
							})
							.catch(e => {
								console.error(e);
							});
					}
				})
				.then((onFulfilled: QuickPickTheme[] | undefined) => {
					if (onFulfilled) {
						const pinnedThemesToStore: string[] = onFulfilled
							.map(theme => theme.label)
							.sort();

						storePinnedThemes(pinnedThemesToStore);
					}
				});
		}
	);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
