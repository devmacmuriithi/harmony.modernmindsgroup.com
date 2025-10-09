export default function SettingsWindow() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Settings</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Appearance</h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover-elevate">
              <span className="text-sm text-foreground">Dark Mode</span>
              <input type="checkbox" data-testid="checkbox-dark-mode" className="rounded" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover-elevate">
              <span className="text-sm text-foreground">Show Desktop Icons</span>
              <input type="checkbox" data-testid="checkbox-show-icons" defaultChecked className="rounded" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Notifications</h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover-elevate">
              <span className="text-sm text-foreground">Prayer Reminders</span>
              <input type="checkbox" data-testid="checkbox-prayer-reminders" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover-elevate">
              <span className="text-sm text-foreground">Daily Devotionals</span>
              <input type="checkbox" data-testid="checkbox-daily-devotionals" defaultChecked className="rounded" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Bible Translation</h3>
          <select 
            className="w-full p-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring"
            data-testid="select-bible-translation"
          >
            <option>NIV - New International Version</option>
            <option>KJV - King James Version</option>
            <option>ESV - English Standard Version</option>
            <option>NKJV - New King James Version</option>
          </select>
        </div>
      </div>
    </div>
  );
}
