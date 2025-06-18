// csvUtils.ts
// Utility for parsing analytics CSV files for AnalyticsDashboard

export interface AnalyticsData {
  name: string;
  views: number;
  watchTime: number;
}

export function parseAnalyticsCsv(text: string): AnalyticsData[] {
  // Simple CSV parse: expects columns: name,views,watchTime
  const lines = text.split('\n').filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header and at least one row.');
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    if (cols.length !== 3) {
      throw new Error('CSV row must have exactly 3 columns: name, views, watchTime.');
    }
    const [name, views, watchTime] = cols;
    return { name, views: Number(views), watchTime: Number(watchTime) };
  });
}
