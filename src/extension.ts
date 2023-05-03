import {
	commands,
	ConfigurationChangeEvent,
	ExtensionContext,
	extensions,
	workspace
} from "vscode";
import {
	prepareQuickPickThemeList,
	showThemeQuickPick,
	switchTheme
} from "./favourite-themes";
import { ExposedCommands } from "./model/commands";
import { affectsRelevantConfig } from "./util";
import { SettingsManager } from "./util/settings-manager";

export const settings = new SettingsManager();

export function activate(context: ExtensionContext) {
	settings.setContext(context);
	settings.populateAllThemes();
	settings.updateSettings(context);

	const disposable = commands.registerCommand(
		ExposedCommands.selectColourTheme,
		() => {
			prepareQuickPickThemeList(settings).then(quickPickThemes =>
				showThemeQuickPick(quickPickThemes, settings)
			);
		}
	);

	const nextTheme = commands.registerCommand(
		ExposedCommands.nextFavouriteTheme,
		() => switchTheme("next")
	);

	const prevTheme = commands.registerCommand(
		ExposedCommands.prevFavouriteTheme,
		() => switchTheme("prev")
	);

	context.subscriptions.push(disposable);

	const workspaceConfChanged = workspace.onDidChangeConfiguration(
		(e: ConfigurationChangeEvent) => {
			if (affectsRelevantConfig(e)) {
				console.info(
					"Setting change affects relevant config, updating settings..."
				);

				settings.updateSettings(context);
			}
		}
	);

	const extensionsChanged = extensions.onDidChange(
		e => settings.updateSettings()
		//                ^?
	);

	context.subscriptions.push(
		workspaceConfChanged,
		extensionsChanged,
		disposable,
		prevTheme,
		nextTheme
	);
}

export function deactivate(context: ExtensionContext) {}
