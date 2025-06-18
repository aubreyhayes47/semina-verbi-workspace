/**
 * HistoricalEventTimelineGenerator.tsx
 *
 * Part of the Semina Verbi Workspace.
 * Purpose: Generate and visualize historical event timelines for content context.
 *
 * Reference: See /docs/InstructionManual.md for project mission, values, and directives.
 * All code and features must prioritize Truth, Charity, and Intellectual Rigor.
 */

import React, { useState } from 'react';
import Card from '../Card';
import Input from '../Input';
import Button from '../Button';
import { PlusCircle, Trash2 } from 'lucide-react'; // Assuming Lucide React is installed

interface TimelineEvent {
  id: string;
  year: string;
  description: string;
}

const HistoricalEventTimelineGenerator: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([
    { id: '1', year: '', description: '' },
  ]);
  const [timelineTitle, setTimelineTitle] = useState('');

  const addEvent = () => {
    setEvents([...events, { id: Date.now().toString(), year: '', description: '' }]);
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const handleEventChange = (id: string, field: keyof TimelineEvent, value: string) => {
    setEvents(events.map((event) => (event.id === id ? { ...event, [field]: value } : event)));
  };

  const generateTimeline = () => {
    // In MVF, this would just format the data or display it statically.
    // Future versions might generate a visual timeline or an exportable file.
    alert(
      `Generating timeline for: ${timelineTitle}\n\n` +
        events
          .map((e) => `Year: ${e.year}, Description: ${e.description}`)
          .join('\n')
    );
    console.log('Timeline Data:', { title: timelineTitle, events });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Historical Event Timeline Generator </h2>
      <p className="text-gray-600 mb-6">
        Generate interactive timelines for historical periods, aiding your research and content visualization. 
      </p>

      <div className="mb-4">
        <Input
          label="Timeline Title"
          placeholder="e.g., Key Events in Early Church Missions"
          value={timelineTitle}
          onChange={(e) => setTimelineTitle(e.target.value)}
        />
      </div>

      <h3 className="text-lg font-medium text-gray-700 mb-3">Events</h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={`Event ${index + 1} Year`}
                placeholder="e.g., 313 AD"
                value={event.year}
                onChange={(e) => handleEventChange(event.id, 'year', e.target.value)}
              />
              <Input
                label={`Event ${index + 1} Description`}
                placeholder="e.g., Edict of Milan grants religious toleration"
                value={event.description}
                onChange={(e) => handleEventChange(event.id, 'description', e.target.value)}
              />
            </div>
            {events.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeEvent(event.id)} className="self-end p-2">
                <Trash2 size={20} className="text-red-500" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={addEvent} className="mt-4 flex items-center">
        <PlusCircle size={18} className="mr-2" /> Add Event
      </Button>

      <div className="flex justify-end mt-6">
        <Button onClick={generateTimeline} disabled={!timelineTitle.trim() || events.some(e => !e.year || !e.description)}>
          Generate Timeline
        </Button>
      </div>
    </Card>
  );
};

export default HistoricalEventTimelineGenerator;