import React from 'react';
import { CalendarDaysIcon } from 'lucide-react';

// Define interface for a single timeline event
interface TimelineEvent {
  id: string; // Unique ID for the event
  year: string; // The year or specific date (e.g., "354 AD", "July 14, 1789")
  description: string; // Brief description of the event
}

// Define props for the HistoricalTimeline component
interface HistoricalTimelineProps {
  events: TimelineEvent[]; // Array of timeline events to display
}

export const HistoricalTimeline: React.FC<HistoricalTimelineProps> = ({ events }) => {
  // Display a message if there are no events to show
  if (events.length === 0) {
    return (
      <p className="text-center text-ink-light italic p-4 bg-vellum-light rounded-md">
        No timeline events added yet. Add events above to see them here.
      </p>
    );
  }

  // Sort events by year for chronological display
  // This is a simple sort, robust date parsing would be more complex for varied date formats
  const sortedEvents = [...events].sort((a, b) => {
    // Basic numerical extraction for sorting. Handles "AD" and "BC" simply.
    // Negative years for BC, positive for AD.
    const yearA = parseInt(a.year.replace(/[^0-9-]/g, '')) * (a.year.toLowerCase().includes('bc') ? -1 : 1);
    const yearB = parseInt(b.year.replace(/[^0-9-]/g, '')) * (b.year.toLowerCase().includes('bc') ? -1 : 1);
    return yearA - yearB;
  });

  return (
    // Relative positioning for the timeline line and dots
    <div className="relative pl-6 border-l-2 border-vellum-dark pt-2">
      {sortedEvents.map((event) => (
        <div key={event.id} className="mb-6 last:mb-0 relative">
          {/* Timeline dot: positioned absolutely to align with the vertical line */}
          <div className="absolute -left-3 top-1.5 h-4 w-4 rounded-full bg-illuminated-gold border-2 border-vellum-dark"></div>
          
          {/* Event year/date */}
          <div className="flex items-baseline mb-1">
            <CalendarDaysIcon size={16} className="text-illuminated-gold mr-2 flex-shrink-0" />
            <span className="font-bold text-ink text-md">{event.year}</span>
          </div>
          {/* Event description */}
          <p className="text-sm text-ink-light ml-6">{event.description}</p>
        </div>
      ))}
    </div>
  );
};
