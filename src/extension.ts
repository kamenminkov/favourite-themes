import * as vscode from "vscode";
import {
	getAllThemes,
	setCurrentColourTheme,
	sortThemesByPinnedStatus,
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
			const pinnedThemes: string[] = settings.getPinnedThemes();
			const showDarkThemesFirst: boolean = settings.getShowDarkThemesFirst();

			const allThemes: Theme[] = getAllThemes();
			const quickPickThemes: QuickPickTheme[] = allThemes
				.map(
					theme =>
						({
							label: theme.label,
							type: theme.uiTheme,
							picked: pinnedThemes.includes(theme.label)
						} as QuickPickTheme)
				)
				.sort((a, b) => sortThemesByType(a, b, showDarkThemesFirst))
				.sort((a, b) => sortThemesByPinnedStatus(a, b, pinnedThemes));

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
						const newlyPinnedThemes = onFulfilled.map(theme => theme.label);
						const pinnedThemesToStore: string[] = uniq([
							...pinnedThemes,
							...newlyPinnedThemes
						]).sort();

						storePinnedThemes(pinnedThemesToStore);
					}
				});
		}
	);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
