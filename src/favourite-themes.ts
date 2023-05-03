import { ExtensionContext, window } from "vscode";
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
				uiTheme: theme.uiTheme,
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
	const previousTheme = settings.currentTheme as Theme;

	let timeout: NodeJS.Timeout | null = null;
	let enqueuedTheme: Theme | null = null;

	return window
		.showQuickPick(quickPickThemes, {
			canPickMany: true,
			matchOnDescription: true,

			onDidSelectItem: (selectedTheme: Theme) => {
				if (timeout) {
					clearTimeout(timeout);
					enqueuedTheme = null;
				}

				enqueuedTheme = selectedTheme;

				timeout = setTimeout(() => {
					SettingsManager.setCurrentColourTheme(selectedTheme)
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
			async result => {
				if (result) {
					const currentTheme =
						enqueuedTheme?.name || SettingsManager.getCurrentColourThemeName();
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

					if (timeout) {
						clearTimeout(timeout);
					}

					if (enqueuedTheme) {
						await SettingsManager.setCurrentColourTheme(enqueuedTheme);
						enqueuedTheme = null;
					}

					await SettingsManager.storePinnedThemes(pinnedThemesToStore);
				} else {
					await SettingsManager.setCurrentColourTheme(previousTheme);
					enqueuedTheme = null;
				}
			},
			async onRejected => {
				console.error(onRejected);
				console.info("setting theme to previous one...");

				return await SettingsManager.setCurrentColourTheme(previousTheme);
			}
		);
}

export function switchTheme(
	direction: "prev" | "next",
	limitToCurrentThemeType: boolean = true
): void {
	// TODO: Consider tying limitToCurrentThemeType to a setting

	const allThemes = SettingsManager.getAllThemesFromContext();

	const currentTheme = SettingsManager.getCurrentColourThemeName();
	const currentThemeType = allThemes.get(currentTheme as string)!.uiTheme;
	const pinnedThemes = limitToCurrentThemeType
		? SettingsManager.getPinnedThemes().filter(
				theme => allThemes.get(theme)!.uiTheme === currentThemeType
		  )
		: SettingsManager.getPinnedThemes();

	const currentThemeIndex = pinnedThemes.findLastIndex(t => t === currentTheme);

	let themeToApplyIndex: number;

	switch (direction) {
		case "prev":
			themeToApplyIndex =
				currentThemeIndex === 0
					? pinnedThemes.length - 1
					: currentThemeIndex - 1;
			break;

		case "next":
			themeToApplyIndex =
				currentThemeIndex === pinnedThemes.length - 1
					? 0
					: currentThemeIndex + 1;
			break;
	}

	const themeName = pinnedThemes[themeToApplyIndex];
	const themeToApply = SettingsManager.getAllThemesFromContext().get(
		themeName
	) as Theme;

	SettingsManager.setCurrentColourTheme(themeToApply);
}
