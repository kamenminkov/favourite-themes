import { TimePeriod } from "./time-period";
import { UsageRecord } from "./usage-record";

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

			this.ticks.push(
				new TimePeriod({
					start: this.lastStartTime,
					end: Date.now(),
					themeUsed: this.lastUsedTheme as string
				})
			);

			// const lastTick = this.ticks[this.ticks.length - 1];
			// const lastDuration: number = lastTick.end - lastTick.start;

			// console.log(`===== ~ ThemeUsageTracker ~ lastDuration`, lastDuration);
		}

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
