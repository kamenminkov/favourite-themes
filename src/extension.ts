import * as vscode from "vscode";
import { getAllThemes, getCurrentColourTheme, setCurrentColourTheme } from ".";
import { Theme } from "./model/package-json";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "favourite-themes" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(
		"favourite-themes.selectColourTheme",
		() => {
			let allThemes: Theme[] = getAllThemes();

			let quickPickItems: vscode.QuickPickItem[] = allThemes.map(theme => ({
				label: theme.label,
				type: theme.uiTheme
			}));

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
				.then((onFulfilled: vscode.QuickPickItem[] | undefined) => {
					if (onFulfilled) {
						console.log(`selected themes:`, onFulfilled);
					}
				});
		}
	);

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
