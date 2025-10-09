import Window from '../Window';

export default function WindowExample() {
  return (
    <div className="relative h-screen">
      <Window 
        appId="bible" 
        title="Bible" 
        onClose={() => console.log('Window closed')}
        initialPosition={{ x: 50, y: 50 }}
      >
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-foreground">John 3:16</h2>
          <p className="font-serif text-foreground leading-relaxed">
            For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.
          </p>
        </div>
      </Window>
    </div>
  );
}
