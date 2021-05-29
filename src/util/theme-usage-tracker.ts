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
				new TimePeriod(
					this.lastStartTime,
					Date.now(),
					this.lastUsedTheme as string
				)
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
			if (usages.has(tick.themeUsed)) {
				const previousTotalUsage = usages.get(tick.themeUsed)?.time as number;

				usages.set(tick.themeUsed, {
					theme: tick.themeUsed,
					time: previousTotalUsage + tick.duration
				});
			} else {
				usages.set(tick.themeUsed, {
					theme: tick.themeUsed,
					time: tick.duration
				});
			}
		}

		return usages;
	}

	public showReport(): void {}
}
