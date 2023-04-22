# Favourite Themes README

This extension's main goal is to facilitate switching and keeping track of preferred colour themes, especially in the case of theme packs containing tens of individual themes.

## Features

The extension's main feature is a quick pick menu showing all installed colour themes with the ability to show preferred ones at the top.

Open the command palette and search for "Pick Theme" to show the picker (or alternatively assign a keyboard shortcut for the `favourite-themes.selectColourTheme` command to do the same thing). The moment you check a theme in the picker (using `Space`), it's stored in your settings, and any subsequent invocations of the menu will show checked themes on top of the list.

![Favourite Themes](images/favourite-themes.gif)

(Yes, before you ask, there is a theme called [`undefined`](https://marketplace.visualstudio.com/items?itemName=christianhg.undefined).)

<!-- ## Requirements -->

## Motivation

VSCode's built-in theme picker works perfectly if you have 5 or 10 themes installed. However, if you install a theme pack or two, you can easily end up with 100 themes of which you only like 10.

## Extension Settings

This extension contributes the following settings:

| Setting                                        |    Type    | Description                                                                                                                                               |                               Default value |
| ---------------------------------------------- | :--------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------: |
| `favouriteThemes.pinnedThemes`                 | `string[]` | An array containing all pinned themes.                                                                                                                    |                                        `[]` |
| `favouriteThemes.darkThemesFirst`              | `boolean`  | (Deprecated, use `favouriteThemes.themeTypeSortOrder` instead) Whether dark themes should come first                                                      |                                      `true` |
| `favouriteThemes.sortPinnedByRecentUsage`      | `boolean`  | Whether to show themes in order of their usage (i.e. most recently used ones on top)                                                                      |                                     `false` |
| `favouriteThemes.showExtraQuickPickDetails`    | `boolean`  | Whether to show dark/light theme type inline in the picker                                                                                                |                                     `false` |
| `favouriteThemes.themeTypeSortOrder`           | `string[]` | How to order themes by type (dark, light, high contrast dark, high contrast light)                                                                        | `["vs-dark", "hc-black", "vs", "hc-light"]` |
| `favouriteThemes.showThemesOfCurrentTypeFirst` | `boolean`  | If set to `true`, it will override `favouriteThemes.themeTypeSortOrder` and it will show at the top themes of the type of the theme that's currently used |                                      'false |

<!-- ## Known Issues -->

## TODO

- Track and show statistics of how much you use each theme
- ~~Handle disabling/uninstalling of themes~~
- Tie the extension logic to `workbench.preferredDarkColorTheme` and `workbench.preferredLightColorTheme`
- Revert to previously selected theme if you dismiss the picker
- Have typing while the picker's open automatically focus the search field instead of having to navigate to it
- Highlight active theme when showing the picker
- Debounce switching of themes when quickly scrolling through the list
- Add customizable display (i.e. how to show names in the picker)
- Add extension icon
- Add commands for previous/next theme

---

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md)
