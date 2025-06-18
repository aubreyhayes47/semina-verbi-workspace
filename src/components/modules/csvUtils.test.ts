import { parseAnalyticsCsv } from './csvUtils';

describe('parseAnalyticsCsv', () => {
  it('parses valid CSV', () => {
    const csv = 'name,views,watchTime\nJan,100,200\nFeb,300,400';
    const result = parseAnalyticsCsv(csv);
    expect(result).toEqual([
      { name: 'Jan', views: 100, watchTime: 200 },
      { name: 'Feb', views: 300, watchTime: 400 },
    ]);
  });

  it('throws for row with wrong number of columns', () => {
    const csv = 'name,views,watchTime\nJan,100';
    expect(() => parseAnalyticsCsv(csv)).toThrow('CSV row must have exactly 3 columns');
  });

  it('throws for missing header or row', () => {
    expect(() => parseAnalyticsCsv('name,views,watchTime')).toThrow('CSV must have a header and at least one row.');
  });
});
