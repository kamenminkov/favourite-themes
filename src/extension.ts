import {
	commands,
	ConfigurationChangeEvent,
	ExtensionContext,
	extensions,
	workspace
} from "vscode";
import {
	prepareQuickPickThemeList,
	showThemeQuickPick
} from "./favourite-themes";
import { affectsRelevantConfig } from "./util";
import { SettingsManager } from "./util/settings-manager";

const settings = new SettingsManager();

export function activate(context: ExtensionContext) {
	workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
		if (affectsRelevantConfig(e)) {
			settings.updateSettings();
		}
	});

	extensions.onDidChange(e => settings.updateSettings());

	const disposable = commands.registerCommand(
		"favourite-themes.selectColourTheme",
		() => {
			prepareQuickPickThemeList(settings).then(quickPickThemes =>
				showThemeQuickPick(quickPickThemes, settings)
			);
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
