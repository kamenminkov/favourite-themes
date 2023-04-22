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

export interface BaseTheme {
	name: string; // doesn't exist originally; added to normalise id and label
	label: string;
	uiTheme: ThemeType;
	path: string;
}

export interface BuiltInTheme extends BaseTheme {
	id: string;
}

export interface ExternalTheme extends BaseTheme {}

export type Theme = BuiltInTheme | ExternalTheme;

export enum ThemeType {
	light = "vs",
	dark = "vs-dark",
	hcBlack = "hc-black",
	hcLight = "hc-light"
}

export type ThemeTypeLabel =
	| "Dark"
	| "Light"
	| "High Contrast Dark"
	| "High Contrast Light";

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
