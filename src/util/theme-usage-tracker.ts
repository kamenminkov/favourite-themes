import { TimePeriod } from "./time-period";
import { UsageRecord } from "./usage-record";

export class ThemeUsageTracker {
	private ticks: TimePeriod[] = [];

	private lastUsedTheme: string | undefined;
	private lastStartTime: number = 0;

	private isTracking: boolean = false;

	public update(
		currentTheme: string | undefined,
		shouldTrack: boolean = true
	): ThemeUsageTracker {
		if (this.isTracking) {
			if (shouldTrack) {
				// this.tracking = true; // implied

				if (this.lastUsedTheme !== currentTheme) {
					this.lastUsedTheme = currentTheme;
				}
			} else {
				this.newTick(
					this.lastStartTime,
					Date.now(),
					this.lastUsedTheme as string
				);
			}
		} else {
			if (shouldTrack) {
				this.isTracking = true;

				this.lastUsedTheme = currentTheme;
				this.lastStartTime = Date.now();
			} else {
				// this.tracking = false; // implied

				this.lastUsedTheme = currentTheme;

				// Probably shouldn't track here.

				this.newTick(
					this.lastStartTime,
					Date.now(),
					this.lastUsedTheme as string
				);
			}

			// const lastTick = this.ticks[this.ticks.length - 1];
			// const lastDuration: number = lastTick.end - lastTick.start;

			// console.log(`===== ~ ThemeUsageTracker ~ lastDuration`, lastDuration);
		}

		return this;
	}

	private newTick(start: number, end: number, themeUsed: string): this {
		this.ticks.push(new TimePeriod({ start, end, themeUsed }));

		return this;
	}

	public generateReport(): Map<string, UsageRecord> {
		const usages: Map<string, UsageRecord> = new Map<string, UsageRecord>();

		for (const tick of this.ticks) {
			const theme = tick.theme;
			const previousUsage = usages.get(theme)?.time as number;
			const duration = usages.has(theme)
				? previousUsage + tick.duration
				: tick.duration;

			usages.set(theme, { theme: theme, time: duration });
		}

		return usages;
	}

	public showReport(): void {}
}
