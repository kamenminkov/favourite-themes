import { TimePeriod } from "./time-period";

export class ThemeUsageTracker {
	private ticks: TimePeriod[] = [];

	private lastUsedTheme: string | undefined;
	private lastStartTime: number = 0;

	public update(
		currentTheme: string | undefined,
		shouldTrack: boolean = true
	): ThemeUsageTracker {
		if (shouldTrack) {
			this.lastStartTime = Date.now();
		} else {
			this.lastUsedTheme = currentTheme;

			this.ticks.push({
				start: this.lastStartTime,
				end: Date.now(),
				themeUsed: this.lastUsedTheme as string
			});

			// const lastTick = this.ticks[this.ticks.length - 1];
			// const lastDuration: number = lastTick.end - lastTick.start;

			// console.log(`===== ~ ThemeUsageTracker ~ lastDuration`, lastDuration);
		}

		return this;
	}

	public generateReport(): Map<string, number> {
		// TODO: Try using a named tuple instead of a map
		let usages: Map<string, number> = new Map<string, number>();

		for (const tick of this.ticks) {
			let currentTickDuration = tick.end - tick.start;

			if (usages.has(tick.themeUsed)) {
				let previousTotalUsage = usages.get(tick.themeUsed) as number;
				usages.set(tick.themeUsed, previousTotalUsage + currentTickDuration);
			} else {
				usages.set(tick.themeUsed, currentTickDuration);
			}
		}

		return usages;
	}

	public showReport(): void {}
}
