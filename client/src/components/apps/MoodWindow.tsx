export default function MoodWindow() {
  const moods = [
    { emoji: '😊', label: 'Joyful', color: 'from-yellow-400 to-orange-400' },
    { emoji: '😌', label: 'Peaceful', color: 'from-blue-400 to-cyan-400' },
    { emoji: '🙏', label: 'Grateful', color: 'from-green-400 to-emerald-400' },
    { emoji: '😢', label: 'Sad', color: 'from-gray-400 to-slate-400' },
    { emoji: '😰', label: 'Anxious', color: 'from-purple-400 to-violet-400' },
    { emoji: '😤', label: 'Angry', color: 'from-red-400 to-pink-400' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">How are you feeling today?</h2>
      <div className="grid grid-cols-3 gap-3">
        {moods.map(mood => (
          <button
            key={mood.label}
            data-testid={`button-mood-${mood.label.toLowerCase()}`}
            className={`p-4 rounded-xl bg-gradient-to-br ${mood.color} text-white hover:-translate-y-1 transition-all duration-200 active-elevate-2`}
          >
            <div className="text-3xl mb-2">{mood.emoji}</div>
            <div className="text-sm font-medium">{mood.label}</div>
          </button>
        ))}
      </div>
      <div>
        <label className="text-sm font-medium text-foreground block mb-2">Notes about your mood</label>
        <textarea 
          className="w-full h-20 p-3 rounded-lg border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-ring"
          placeholder="What's on your heart today..."
          data-testid="textarea-mood-notes"
        />
      </div>
    </div>
  );
}
