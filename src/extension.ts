import * as vscode from "vscode";
import {
	getAllThemes,
	setCurrentColourTheme,
	sortThemesByPinnedStatus,
	sortThemesByType,
	storePinnedThemes,
	uniq
} from ".";
import { Theme } from "./model/package-json";
import { QuickPickTheme } from "./model/quick-pick-theme";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "favourite-themes" is now active!');

	const pinnedThemes: string[] = vscode.workspace
		.getConfiguration()
		.get("favouriteThemes.pinnedThemes", []);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand(
		"favourite-themes.selectColourTheme",
		() => {
			const allThemes: Theme[] = getAllThemes();
			const quickPickItems: QuickPickTheme[] = allThemes
				.map(theme => ({
					label: theme.label,
					type: theme.uiTheme
				}))
				.sort((a, b) => sortThemesByPinnedStatus(a, b, pinnedThemes))
				.sort((a, b) => sortThemesByType(a, b));

			vscode.window
				.showQuickPick(quickPickItems, {
					canPickMany: true,
					onDidSelectItem: (selectedTheme: { label: string }) => {
						setCurrentColourTheme(selectedTheme.label)
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
						const newlyPinnedThemes = onFulfilled.map(theme => theme.label);
						const pinnedThemesToStore: string[] = uniq([
							...pinnedThemes,
							...newlyPinnedThemes
						]).sort();

						storePinnedThemes(pinnedThemesToStore);
					}
				});
		}
	);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
