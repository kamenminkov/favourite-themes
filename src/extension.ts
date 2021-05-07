import * as vscode from "vscode";
import {
	getAllThemes,
	setCurrentColourTheme,
	sortThemesByType,
	storePinnedThemes
} from ".";
import { Theme, ThemeType } from "./model/package-json";
import { QuickPickTheme } from "./model/quick-pick-theme";
import * as settings from "./util/settings-util";

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand(
		"favourite-themes.selectColourTheme",
		() => {
			const sortDarkThemesFirst: boolean = settings.getShowDarkThemesFirst();
			const sortPinnedByRecentUsage: boolean = settings.getSortPinnedByRecentUsage();
			const previouslyPinnedThemes: string[] = settings.getPinnedThemes();
			const allThemes: Map<string, Theme> = getAllThemes();

			// TODO: Figure out how to update allThemes only when needed (i.e. when themes are installed or removed) instead of on every action invocation

			let pinnedThemes: QuickPickTheme[] = previouslyPinnedThemes.map(
				theme => ({
					label: theme,
					type: allThemes.get(theme)?.uiTheme as ThemeType,
					picked: true
				})
			);

			if (!sortPinnedByRecentUsage) {
				pinnedThemes = pinnedThemes.sort((a, b) =>
					sortThemesByType(a, b, sortDarkThemesFirst)
				);
			}

			const nonPinnedThemes: QuickPickTheme[] = Array.from(allThemes.values())
				.filter(t => !previouslyPinnedThemes.includes(t.label))
				.map(theme => ({
					label: theme.label,
					type: theme.uiTheme,
					picked: false
				}))
				.sort((a, b) => sortThemesByType(a, b, sortDarkThemesFirst));

			const quickPickThemes = [...pinnedThemes, ...nonPinnedThemes];

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
						const currentTheme = settings.getCurrentColourTheme();
						const currentThemeIsPinned = onFulfilled.some(
							theme => theme.label === currentTheme
						);

						let pinnedThemesToStore: string[];

						if (sortPinnedByRecentUsage && currentThemeIsPinned) {
							pinnedThemesToStore = [
								currentTheme as string,
								...onFulfilled
									.map(theme => theme.label)
									.filter(theme => theme !== currentTheme)
							];
						} else {
							pinnedThemesToStore = onFulfilled
								.map(theme => theme.label)
								.sort();
						}

						storePinnedThemes(pinnedThemesToStore);
					}
				});
		}
	);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
