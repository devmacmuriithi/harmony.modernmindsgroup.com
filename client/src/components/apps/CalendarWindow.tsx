export default function CalendarWindow() {
  //todo: remove mock functionality
  const events = [
    { id: 1, time: '9:00 AM', title: 'Morning Prayer', color: 'bg-blue-500' },
    { id: 2, time: '12:00 PM', title: 'Bible Study Group', color: 'bg-purple-500' },
    { id: 3, time: '7:00 PM', title: 'Evening Devotional', color: 'bg-green-500' },
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = 15;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Calendar</h2>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => {
          const dayNum = i - 5;
          const isToday = dayNum === today;
          return (
            <div 
              key={i}
              data-testid={`calendar-day-${i}`}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                dayNum > 0 && dayNum <= 30
                  ? isToday
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
                    : 'text-foreground hover-elevate cursor-pointer'
                  : 'text-muted-foreground/30'
              }`}
            >
              {dayNum > 0 && dayNum <= 30 ? dayNum : ''}
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Today's Schedule</h3>
        {events.map(event => (
          <div 
            key={event.id}
            className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card"
            data-testid={`event-${event.id}`}
          >
            <div className={`w-1 h-8 rounded-full ${event.color}`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
