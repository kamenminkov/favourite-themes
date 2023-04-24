import { window } from "vscode";
import { Theme } from "./model/package-json";
import { QuickPickTheme } from "./model/quick-pick-theme";
import { getThemeTypeLabel, sortThemesByType } from "./util/index";
import { SettingsManager } from "./util/settings-manager";

export async function prepareQuickPickThemeList(
	settings: SettingsManager
): Promise<QuickPickTheme[]> {
	let pinnedThemes: QuickPickTheme[] = settings.previouslyPinnedThemes.map(
		themeLabel => {
			const theme = settings.allThemes.get(themeLabel) as Theme;

			return {
				label: theme.name,
				type: theme.uiTheme,
				name: theme.name,
				picked: true,
				description: settings.showDetailsInPicker
					? getThemeTypeLabel(theme)
					: undefined
			};
		}
	);

	const currentThemeType = settings.currentTheme!.uiTheme;
	const themeTypeSortOrder = settings.themeTypeSortOrder;

	if (settings.sortCurrentThemeTypeFirst) {
		pinnedThemes = pinnedThemes.sort((a, b) =>
			sortThemesByType(a, b, themeTypeSortOrder, currentThemeType)
		);
	} else {
		if (!settings.sortPinnedByRecentUsage) {
			pinnedThemes = pinnedThemes.sort((a, b) =>
				sortThemesByType(a, b, themeTypeSortOrder)
			);
		}
	}

	const nonPinnedThemes: QuickPickTheme[] = Array.from(
		settings.allThemes.values()
	)
		.filter(t => !settings.previouslyPinnedThemes.includes(t.name))
		.map(
			theme =>
				({
					label: theme.label,
					type: theme.uiTheme,
					name: theme.name,
					picked: false,
					description: settings.showDetailsInPicker
						? getThemeTypeLabel(theme)
						: undefined
				} as QuickPickTheme)
		)
		.sort((a, b) => sortThemesByType(a, b, themeTypeSortOrder));

	return [...pinnedThemes, ...nonPinnedThemes];
}

export function showThemeQuickPick(
	quickPickThemes: QuickPickTheme[],
	settings: SettingsManager
): Thenable<void> {
	const previousTheme = settings.currentTheme!.name;

	let timeout: NodeJS.Timeout | null = null;

	return window
		.showQuickPick(quickPickThemes, {
			canPickMany: true,
			matchOnDescription: true,

			onDidSelectItem: (selectedTheme: Theme) => {
				if (timeout) {
					clearTimeout(timeout);
				}

				timeout = setTimeout(() => {
					SettingsManager.setCurrentColourTheme(selectedTheme.name)
						.then(r => {
							console.log(`Theme set to ${selectedTheme.label}`);
						})
						.catch(e => {
							console.error(e);
						});
				}, settings.themeSelectionDelay);
			}
		})
		.then(
			result => {
				if (result) {
					const currentTheme = SettingsManager.getCurrentColourTheme();
					const currentThemeIsPinned = result.some(
						theme => theme.label === currentTheme
					);

					const pinnedThemesToStore: string[] =
						settings.sortPinnedByRecentUsage && currentThemeIsPinned
							? [
									currentTheme as string,
									...result
										.map(theme => theme.label)
										.filter(theme => theme !== currentTheme)
							  ]
							: result.map(theme => theme.label).sort();

					return SettingsManager.storePinnedThemes(pinnedThemesToStore);
				}
			},
			onRejected => {
				console.error(onRejected);
				console.info("setting theme to previous one...");

				return SettingsManager.setCurrentColourTheme(previousTheme);
			}
		);
}
