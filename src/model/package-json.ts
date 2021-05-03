export interface PackageJson {
	name: string;
	displayName: string;
	description: string;
	version: string;
	publisher: string;
	icon: string;
	repository: Repository;
	homepage: string;
	bugs: Bugs;
	engines: Engines;

	categories: string[];
	keywords: string[];
	badges: Badge[];
	activationEvents: string[];
	main: string;
	contributes: Contributes;
	license: string;
	author: string;
	devDependencies: { [key: string]: string };
	scripts: Scripts;
	private: boolean;
}

export interface Badge {
	url: string;
	href: string;
	description: string;
}

export interface Bugs {
	url: string;
}

interface Contributes {
	commands: Command[];
	themes: Theme[];
}

export interface Theme {
	label: string;
	uiTheme: ThemeType;
	path: string;
}

export enum ThemeType {
	light = "vs",
	dark = "vs-dark"
}

interface Engines {
	vscode: string;
}

export interface Repository {
	url: string;
	type: string;
}

interface Command {
	command: string;
	title: string;
}

interface Scripts {
	[key: string]: string;
}
