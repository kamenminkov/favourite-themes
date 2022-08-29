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
	// debugger;
	console.log("ext activate");

	settings.populateAllThemes(context);

	const disposable = commands.registerCommand(
		"favourite-themes.selectColourTheme",
		() => {
			prepareQuickPickThemeList(settings).then(quickPickThemes =>
				showThemeQuickPick(quickPickThemes, settings)
			);
		}
	);

	context.subscriptions.push(disposable);

	const workspaceConfChanged = workspace.onDidChangeConfiguration(
		(e: ConfigurationChangeEvent) => {
			if (affectsRelevantConfig(e)) {
				console.info(
					"Setting change affects relevant config, updating settings..."
				);

				// TODO: Investigate theme reverting when selecting a hc theme

				settings.updateSettings();
			}
		}
	);

	const extensionsChanged = extensions.onDidChange(e =>
		settings.updateSettings()
	);

	context.subscriptions.push(
		workspaceConfChanged,
		extensionsChanged,
		disposable
	);
}

export function deactivate(context: ExtensionContext) {
	// debugger;
}
