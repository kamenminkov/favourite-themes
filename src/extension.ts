import {
	commands,
	ConfigurationChangeEvent,
	ExtensionContext,
	extensions,
	window,
	workspace
} from "vscode";
import {
	showUsageReport,
	prepareQuickPickThemeList,
	showThemeQuickPick
} from "./favourite-themes";
import { affectsRelevantConfig } from "./util";
import { SettingsManager } from "./util/settings-manager";
import { ThemeUsageTracker } from "./util/theme-usage-tracker";

// TODO: Make these readonly or singletons
const settings = new SettingsManager();
const themeTracker = new ThemeUsageTracker().update(
	SettingsManager.getCurrentTheme() as string
);

export function activate(context: ExtensionContext) {
	window.onDidChangeWindowState(e => onChangedTheme(e.focused));
	window.onDidChangeActiveColorTheme(e => onChangedTheme(window.state.focused));

	workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
		if (affectsRelevantConfig(e)) {
			settings.updateSettings();

			if (window.state.focused) {
				themeTracker.update(SettingsManager.getCurrentTheme());
			}
		}
	});

	extensions.onDidChange(e => settings.updateSettings());

	const selectColourThemeDisposable = commands.registerCommand(
		"favourite-themes.selectColourTheme",
		() =>
			prepareQuickPickThemeList(settings).then(quickPickThemes =>
				showThemeQuickPick(quickPickThemes, settings)
			)
	);

	const generateReportDisposable = commands.registerCommand(
		"favourite-themes.showUsageReport",
		() => showUsageReport(themeTracker)
	);

	context.subscriptions.push(
		selectColourThemeDisposable,
		generateReportDisposable
	);
}

function onChangedTheme(
	shouldTrack: boolean = true,
	activeTheme: string | undefined = SettingsManager.getCurrentTheme()
): void {
	themeTracker.update(activeTheme, shouldTrack);
}

export function deactivate() {}
