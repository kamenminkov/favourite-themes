import * as vscode from "vscode";
import { ThemeType } from "./model/package-json";
import { QuickPickTheme } from "./model/quick-pick-theme";
import { sortThemesByType } from "./util";
import { SettingsManager } from "./util/settings-manager";

const settings = new SettingsManager();

export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.onDidChangeConfiguration(e => {
		settings.updateSettings();
	});

	const disposable = vscode.commands.registerCommand(
		"favourite-themes.selectColourTheme",
		() => {
			let pinnedThemes: QuickPickTheme[] = settings.previouslyPinnedThemes.map(
				theme => ({
					label: theme,
					type: settings.allThemes.get(theme)?.uiTheme as ThemeType,
					picked: true
				})
			);

			if (!settings.sortPinnedByRecentUsage) {
				pinnedThemes = pinnedThemes.sort((a, b) =>
					sortThemesByType(a, b, settings.sortDarkThemesFirst)
				);
			}

			const nonPinnedThemes: QuickPickTheme[] = Array.from(
				settings.allThemes.values()
			)
				.filter(t => !settings.previouslyPinnedThemes.includes(t.label))
				.map(theme => ({
					label: theme.label,
					type: theme.uiTheme,
					picked: false
				}))
				.sort((a, b) => sortThemesByType(a, b, settings.sortDarkThemesFirst));

			const quickPickThemes = [...pinnedThemes, ...nonPinnedThemes];

			vscode.window
				.showQuickPick(quickPickThemes, {
					canPickMany: true,
					onDidSelectItem: (selectedTheme: { label: string }) => {
						SettingsManager.setCurrentColourTheme(selectedTheme.label)
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
						const currentTheme = SettingsManager.getCurrentColourTheme();
						const currentThemeIsPinned = onFulfilled.some(
							theme => theme.label === currentTheme
						);

						let pinnedThemesToStore: string[];

						if (settings.sortPinnedByRecentUsage && currentThemeIsPinned) {
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

						SettingsManager.storePinnedThemes(pinnedThemesToStore);
					}
				});
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
