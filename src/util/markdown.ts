import { UsageRecord } from "./usage-record";

export function generateUsageTable(values: Map<string, UsageRecord>): string {
	let table = `|  |  |\n| - | - |\n`;

	for (const row of values) {
		const theme = row[0];
		const usageDuration = row[1].time;

		table += `| ${theme} | ${usageDuration} |\n`;
	}

	return table.trim();
}
