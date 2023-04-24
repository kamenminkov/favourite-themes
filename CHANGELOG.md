# Change Log

## 1.6.0

### Added

- Delay when quickly switching themes in the picker to prevent lag when quickly going through a lot of themes. Configurable by `favouriteThemes.themeSelectionDelay`.

## 1.5.0

### Fixed

- Handling of built-in default themes (including high contrast ones).

### Added

- Setting for custom order of theme types (`favouriteThemes.themeTypeSortOrder`) allowing you to specify dark, light, high contrast dark and high contrast light themes instead of just dark/light like previously.

### Deprecated

- The `favouriteThemes.darkThemesFirst` setting. You should now use the aforementioned `favouriteThemes.themeTypeSortOrder` that covers the same functionality.

## 1.3.0

### Added

- Automatically removing missing themes from the pinned list (when uninstalling or disabling a theme)

## 1.2.2

### Added

- Dismissing the picker will get you back to the previous theme

## 1.2.1

Clean up

## 1.2.0

Add optional details in the picker - showing dark/light theme (`favouriteThemes.showExtraQuickPickDetails`)

## 1.1.1

Rework & clean up settings management

## 1.1.0

### Added

- Sorting of pinned themes by recent usage (`favouriteThemes.sortPinnedByRecentUsage`)

## 1.0.0

Initial release
