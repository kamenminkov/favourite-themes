import { window } from "vscode";
import { Theme, ThemeType } from "./model/package-json";
import { QuickPickTheme } from "./model/quick-pick-theme";
import { getThemeTypeLabel, sortThemesByType } from "./util/index";
import { SettingsManager } from "./util/settings-manager";

export async function prepareQuickPickThemeList(
	settings: SettingsManager
): Promise<QuickPickTheme[]> {
	let pinnedThemes: QuickPickTheme[] = settings.previouslyPinnedThemes
		.map(themeLabel => settings.allThemes.get(themeLabel) as Theme)
		.map(theme => {
			const themeType = theme?.uiTheme as ThemeType;

			return {
				id: theme?.id || null,
				label: theme.label,
				type: themeType,
				picked: true,
				description: settings.showDetailsInPicker
					? getThemeTypeLabel(themeType)
					: undefined
			};
		});

	if (!settings.sortPinnedByRecentUsage) {
		pinnedThemes = pinnedThemes.sort((a, b) =>
			sortThemesByType(a, b, settings.sortDarkThemesFirst)
		);
	}

	const nonPinnedThemes: QuickPickTheme[] = Array.from(
		settings.allThemes.values()
	)
		.filter(t => !settings.previouslyPinnedThemes.includes(t.label))
		.map(
			theme =>
				({
					id: theme.id,
					label: theme.label,
					type: theme.uiTheme,
					picked: false,
					description: settings.showDetailsInPicker
						? getThemeTypeLabel(theme.uiTheme)
						: undefined
				} as QuickPickTheme)
		)
		.sort((a, b) => sortThemesByType(a, b, settings.sortDarkThemesFirst));

	return [...pinnedThemes, ...nonPinnedThemes];
}

function pickThemeIdentifier(selectedTheme: Theme): string {
	return selectedTheme.id ?? selectedTheme.label;
}

export function showThemeQuickPick(
	quickPickThemes: QuickPickTheme[],
	settings: SettingsManager
): Thenable<void> {
	const previousTheme = SettingsManager.getCurrentColourTheme() as string;

	return window
		.showQuickPick(quickPickThemes, {
			canPickMany: true,
			matchOnDescription: true,
			onDidSelectItem: (selectedTheme: Theme) => {
				const themeIdentifier = pickThemeIdentifier(selectedTheme);

				return SettingsManager.setCurrentColourTheme(themeIdentifier)
					.catch(e => {
						debugger;
						console.error(e);
					})
					.then(r => {
						console.log(
							`Theme set to ${selectedTheme.id || selectedTheme.label}`
						);
						console.log(r);

						return selectedTheme.id || selectedTheme.label;
					});
			}
		})
		.then(
			onFulfilled => {
				if (onFulfilled) {
					const currentTheme = SettingsManager.getCurrentColourTheme();
					const currentThemeIsPinned = onFulfilled.some(
						theme => theme.label === currentTheme || theme.id === currentTheme
					);

					const pinnedThemesToStore: string[] =
						settings.sortPinnedByRecentUsage && currentThemeIsPinned
							? [
									currentTheme as string,
									...onFulfilled
										.map(theme => {
											const ret = theme.id ?? theme.label;
											return ret;
										})
										.filter(theme => theme !== currentTheme)
							  ]
							: onFulfilled.map(theme => theme.label).sort();

					return SettingsManager.storePinnedThemes(pinnedThemesToStore);
				} else {
					return SettingsManager.setCurrentColourTheme(previousTheme);
				}
			},

			onRejected => (reason: any) => {
				debugger;
			}
		);
}
