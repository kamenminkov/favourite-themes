export function generateUsageTable(values: Map<string, number>): string {
	let table = `|  |  |\n| - | - |\n`;

	for (const row of values) {
		const theme = row[0];
		const usageDuration = row[1];

		table += `| ${theme} | ${usageDuration} |\n`;
	}

	return table.trim();
}
