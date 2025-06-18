/**
 * AnalyticsDashboard.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Visualize channel performance data and qualitative success metrics.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { parseAnalyticsCsv } from './csvUtils';

// Define a type for analytics data
interface AnalyticsData {
  name: string;
  views: number;
  watchTime: number;
}

const data: AnalyticsData[] = [
  { name: 'Jan', views: 4000, watchTime: 2400 },
  { name: 'Feb', views: 3000, watchTime: 1398 },
  { name: 'Mar', views: 2000, watchTime: 9800 },
  { name: 'Apr', views: 2780, watchTime: 3908 },
  { name: 'May', views: 1890, watchTime: 4800 },
  { name: 'Jun', views: 2390, watchTime: 3800 },
];

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>(data);
  const [csvError, setCsvError] = useState<string | null>(null);

  // CSV import handler
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = parseAnalyticsCsv(text);
          setAnalyticsData(parsed);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log('CSV parse error:', err);
          setCsvError('Failed to parse CSV: ' + ((err instanceof Error) ? err.message : 'Unknown error'));
        }
      };
      reader.readAsText(file);
    }
  };

  // Export handler
  const handleExport = () => {
    const csv = ['name,views,watchTime', ...analyticsData.map(d => `${d.name},${d.views},${d.watchTime}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Generate dynamic AI insights and recommendations
  function generateInsights(data: AnalyticsData[]) {
    if (!data.length) return [];
    const insights = [];
    // Example: Trend detection
    const viewTrend = data[data.length - 1].views - data[0].views;
    if (viewTrend > 0) {
      insights.push({
        text: `Views have increased by ${viewTrend} since ${data[0].name}.`,
        rationale: `Calculated from first (${data[0].views}) and last (${data[data.length - 1].views}) data points.`
      });
    } else if (viewTrend < 0) {
      insights.push({
        text: `Views have decreased by ${Math.abs(viewTrend)} since ${data[0].name}.`,
        rationale: `Calculated from first (${data[0].views}) and last (${data[data.length - 1].views}) data points.`
      });
    }
    // Example: Best month
    const best = data.reduce((a, b) => (a.views > b.views ? a : b));
    insights.push({
      text: `Best month for views: ${best.name} (${best.views} views).`,
      rationale: `Detected by finding the month with the highest views.`
    });
    // Example: Watch time anomaly
    const avgWatch = data.reduce((sum, d) => sum + d.watchTime, 0) / data.length;
    const highWatch = data.find(d => d.watchTime > avgWatch * 1.5);
    if (highWatch) {
      insights.push({
        text: `Unusually high watch time in ${highWatch.name} (${highWatch.watchTime} hours).`,
        rationale: `Watch time was 50% above average (${avgWatch.toFixed(1)} hours).`
      });
    }
    return insights;
  }

  function generateRecommendations(insights: { text: string }[]) {
    const recs = [];
    if (insights.some(i => i.text.includes('increased'))) {
      recs.push('Continue producing content similar to recent months to maintain growth.');
    }
    if (insights.some(i => i.text.includes('decreased'))) {
      recs.push('Review content strategy for recent months to address declining views.');
    }
    if (insights.some(i => i.text.includes('Unusually high watch time'))) {
      recs.push('Analyze what made this month successful and replicate those factors.');
    }
    if (insights.some(i => i.text.includes('Best month'))) {
      recs.push('Consider revisiting topics or formats from your best month.');
    }
    if (!recs.length) recs.push('Keep monitoring analytics for new trends.');
    return recs;
  }

  const insights = generateInsights(analyticsData);
  const recommendations = generateRecommendations(insights);

  return (
    <Card className="p-6" aria-label="Analytics Dashboard Panel">
      <h2 className="text-xl font-semibold text-gray-800 mb-4" tabIndex={0}>Analytics Dashboard </h2>
      <p className="text-gray-600 mb-6" tabIndex={0}>
        Visualize your channel's performance data, aligning with qualitative success metrics. 
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <input type="file" accept=".csv" onChange={handleCsvImport} aria-label="Import YouTube Analytics CSV" />
        <Button onClick={handleExport} variant="outline" aria-label="Export Analytics Data">Export CSV</Button>
      </div>
      {csvError && <div className="text-red-600 mb-2" role="alert" data-testid="csv-error">{csvError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4" aria-label="Total Views Chart">
          <h3 className="text-lg font-medium text-gray-700 mb-3" tabIndex={0}>Total Views (Last 6 Months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} aria-label="Total Views Bar Chart">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4" aria-label="Watch Time Chart">
          <h3 className="text-lg font-medium text-gray-700 mb-3" tabIndex={0}>Watch Time (Hours)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} aria-label="Watch Time Bar Chart">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="watchTime" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Key Insights</h3>
        <ul className="list-disc list-inside text-gray-600">
          {insights.map((insight, i) => (
            <li key={i}>
              {insight.text}
              <div className="text-xs text-blue-700 mt-1">Explain: {insight.rationale}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-medium text-green-700 mb-3">Actionable Recommendations</h3>
        <ul className="list-disc list-inside text-green-700">
          {recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end mt-6">
        <Button aria-label="Refresh Analytics Data" variant="secondary" onClick={() => alert('Refreshing data...')}>Refresh Data</Button>
      </div>
    </Card>
  );
};

export default AnalyticsDashboard;