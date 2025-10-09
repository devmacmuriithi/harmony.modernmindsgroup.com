export default function BibleWindow() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-semibold text-foreground">John 3:16-17</h2>
        <span className="text-sm text-muted-foreground">NIV</span>
      </div>
      <div className="space-y-4 font-serif text-foreground leading-relaxed">
        <p>
          <span className="font-semibold">16</span> For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.
        </p>
        <p>
          <span className="font-semibold">17</span> For God did not send his Son into the world to condemn the world, but to save the world through him.
        </p>
      </div>
      <div className="pt-4 border-t border-border">
        <label className="text-sm font-medium text-foreground block mb-2">My Notes</label>
        <textarea 
          className="w-full h-24 p-3 rounded-lg border border-input bg-background text-foreground resize-none focus:ring-2 focus:ring-ring"
          placeholder="Add your reflection..."
          data-testid="textarea-bible-notes"
        />
      </div>
    </div>
  );
}
