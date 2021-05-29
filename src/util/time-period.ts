export class TimePeriod {
	constructor(
		public start: number,
		public end: number,
		public themeUsed: string
	) {}

	public get duration(): number {
		return this.end - this.start;
	}
}
