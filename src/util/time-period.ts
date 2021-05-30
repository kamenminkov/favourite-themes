export class TimePeriod {
	constructor(
		private params: {
			start: number;
			end: number;
			themeUsed: string;
		}
	) {}

	public get duration(): number {
		return this.params.end - this.params.start;
	}

	public get theme(): string {
		return this.params.themeUsed;
	}
}
