export default function DevotionalWindow() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">Walking in Faith</h2>
        <p className="text-sm text-muted-foreground">Daily Devotional</p>
      </div>
      <div className="space-y-4 font-serif text-foreground leading-relaxed">
        <p>
          Faith is not just a belief in the unseen, but a trust that shapes our daily walk. When we step out in faith, we acknowledge that God's plans are greater than our understanding.
        </p>
        <p>
          Today, consider the areas in your life where God is calling you to trust Him more deeply. What steps of faith is He inviting you to take?
        </p>
      </div>
      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">Scripture Reference</p>
        <p className="text-sm text-amber-800 dark:text-amber-200 font-serif">Hebrews 11:1 - "Faith is confidence in what we hope for and assurance about what we do not see."</p>
      </div>
    </div>
  );
}
