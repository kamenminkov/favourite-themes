import { window } from "vscode";
import { Theme, ThemeType } from "./model/package-json";
import { QuickPickTheme } from "./model/quick-pick-theme";
import { getThemeTypeLabel, sortThemesByType } from "./util/index";
import { SettingsManager } from "./util/settings-manager";

export async function prepareQuickPickThemeList(
	settings: SettingsManager
): Promise<QuickPickTheme[]> {
	let pinnedThemes: QuickPickTheme[] = settings.previouslyPinnedThemes.map(
		themeLabel => {
			const theme =
				(settings.allThemes.get(themeLabel) as Theme) ||
				Array.from(settings.allThemes.values()).find(t => t.id === themeLabel);
			const themeType = theme.uiTheme;

			return {
				label: themeLabel,
				type: themeType,
				picked: true,
				description: settings.showDetailsInPicker
					? getThemeTypeLabel(theme)
					: undefined
			};
		}
	);

	const currentThemeType = SettingsManager.getCurrentTheme()?.uiTheme;

	let sortDarkThemesFirst: boolean;

	if (settings.sortCurrentThemeTypeFirst) {
		if (currentThemeType === ThemeType.dark) {
			sortDarkThemesFirst = true;
		} else if (currentThemeType === ThemeType.light) {
			sortDarkThemesFirst = false;
		}

		pinnedThemes = pinnedThemes.sort((a, b) =>
			sortThemesByType(a, b, sortDarkThemesFirst)
		);
	} else {
		sortDarkThemesFirst = settings.sortDarkThemesFirst;

		if (!settings.sortPinnedByRecentUsage) {
			pinnedThemes = pinnedThemes.sort((a, b) =>
				sortThemesByType(a, b, sortDarkThemesFirst)
			);
		}
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
						? getThemeTypeLabel(theme)
						: undefined
				} as QuickPickTheme)
		)
		.sort((a, b) => sortThemesByType(a, b, sortDarkThemesFirst));

	return [...pinnedThemes, ...nonPinnedThemes];
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

			onDidSelectItem: (selectedTheme: { id?: string; label: string }) => {
				const selTheme = Array.from(
					SettingsManager.getAllThemes().values()
				).find(
					t =>
						// TODO: Extract method
						t.id === ((selectedTheme.id as unknown) as string) ||
						t.label === ((selectedTheme.id as unknown) as string)
				);

				return SettingsManager.setCurrentColourTheme(
					selectedTheme.id || selectedTheme.label
				)
					.then(
						r => {
							console.log(`Theme set to ${selectedTheme.label}`);
							console.log(r);
						},
						onrejected => {
							debugger;
							console.error(onrejected);
						}
					)
					.catch(e => {
						debugger;
						console.error(e);
					});
			}
		})
		.then(
			onFulfilled => {
				if (onFulfilled) {
					const currentTheme = SettingsManager.getCurrentColourTheme();
					const currentThemeIsPinned = onFulfilled.some(
						theme => theme.label === currentTheme
					);

					const pinnedThemesToStore: string[] =
						settings.sortPinnedByRecentUsage && currentThemeIsPinned
							? [
									currentTheme as string,
									...onFulfilled
										.map(theme => theme.label)
										.filter(theme => theme !== currentTheme)
							  ]
							: onFulfilled.map(theme => theme.label).sort();

					return SettingsManager.storePinnedThemes(pinnedThemesToStore);
				} else {
				}
			},
			onRejected => {
				debugger;
				console.info("setting theme to previous one...");
				return SettingsManager.setCurrentColourTheme(previousTheme);
			}
		);
}
