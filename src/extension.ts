import { commands, ExtensionContext, workspace } from "vscode";
import {
	prepareQuickPickThemeList,
	showThemeQuickPick
} from "./favourite-themes";
import { SettingsManager } from "./util/settings-manager";

const settings = new SettingsManager();

export function activate(context: ExtensionContext) {
	workspace.onDidChangeConfiguration(e => {
		settings.updateSettings();
	});

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
