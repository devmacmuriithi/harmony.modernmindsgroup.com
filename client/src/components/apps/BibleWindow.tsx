import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Search, BookOpen, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BibleVerse {
  id: string;
  userId: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  translation: string;
  content: string | null;
  notes: string | null;
  createdAt: string;
}

interface SearchResult {
  reference: string;
  text: string;
  translation: string;
}

const BIBLE_VERSIONS = [
  { value: 'NIV', label: 'NIV' },
  { value: 'KJV', label: 'KJV' },
  { value: 'ESV', label: 'ESV' },
  { value: 'NKJV', label: 'NKJV' },
  { value: 'NLT', label: 'NLT' },
  { value: 'NASB', label: 'NASB' },
];

const BIBLE_BOOKS = [
  // Old Testament
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  // New Testament
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

export default function BibleWindow() {
  const { toast } = useToast();
  const [version, setVersion] = useState('NIV');
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: versesData, isLoading } = useQuery<{ data: BibleVerse[] }>({
    queryKey: ['/api/bible-verses']
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/bible-verses/generate');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bible-verses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flourishing'] });
      toast({ title: 'New verse generated!', description: 'Personalized for your spiritual journey.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to generate verse. Please try again.', variant: 'destructive' });
    }
  });

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest('GET', `/api/bible-verses/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      return data.data as SearchResult;
    },
    onSuccess: (data) => {
      setSearchResult(data);
      toast({ title: 'Verse found!', description: data.reference });
    },
    onError: () => {
      toast({ title: 'Not found', description: 'Could not find that verse. Try "John 3:16" format.', variant: 'destructive' });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (result: SearchResult) => {
      const res = await apiRequest('POST', '/api/bible-verses/save', {
        reference: result.reference,
        text: result.text,
        translation: result.translation
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bible-verses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flourishing'] });
      setSearchResult(null);
      setChapter('');
      setVerse('');
      toast({ title: 'Verse saved!', description: 'Added to your Bible verses.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save verse. Please try again.', variant: 'destructive' });
    }
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || !chapter) return;
    
    // Build search query from structured fields
    let query = `${book} ${chapter}`;
    if (verse) {
      query += `:${verse}`;
    }
    query += ` ${version}`;
    
    setIsSearching(true);
    try {
      await searchMutation.mutateAsync(query);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveSearchResult = () => {
    if (searchResult) {
      saveMutation.mutate(searchResult);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const latestVerse = versesData?.data?.[0];

  return (
    <Tabs defaultValue="personalized" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="personalized" data-testid="tab-personalized-verse">
          <BookOpen className="w-4 h-4 mr-2" />
          Personalized Verse
        </TabsTrigger>
        <TabsTrigger value="search" data-testid="tab-search-verse">
          <Search className="w-4 h-4 mr-2" />
          Search Verses
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personalized" className="space-y-6 mt-6">
        {!latestVerse ? (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-xl font-serif font-semibold text-foreground mb-2">Daily Verse</h2>
              <p className="text-sm text-muted-foreground mb-4">Get a personalized Bible verse for today</p>
            </div>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              data-testid="button-generate-verse"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Get Today's Verse
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-serif font-semibold text-foreground" data-testid="text-verse-reference">
                  {latestVerse.book} {latestVerse.chapter}:{latestVerse.verseStart}
                  {latestVerse.verseEnd ? `-${latestVerse.verseEnd}` : ''}
                </h2>
                <span className="text-sm text-muted-foreground">{latestVerse.translation}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending}
                data-testid="button-refresh-verse"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-4" data-testid="text-verse-content">
              {/* Actual Verse Content */}
              {latestVerse.content && (
                <div className="p-6 bg-background border border-border rounded-lg">
                  <p className="text-lg font-serif leading-relaxed text-foreground italic">
                    "{latestVerse.content}"
                  </p>
                </div>
              )}

              {/* AI Personalization */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  ✨ AI-Personalized Verse Recommendation
                </p>
                <p className="text-base font-semibold text-foreground">
                  {latestVerse.book} {latestVerse.chapter}:{latestVerse.verseStart}
                  {latestVerse.verseEnd ? `-${latestVerse.verseEnd}` : ''}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  This verse was personalized based on your spiritual journey, moods, and prayer patterns.
                </p>
              </div>

              {/* Previous Reflection (AI's reasoning) */}
              {latestVerse.notes && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Previous reflection:</p>
                  <p className="text-sm text-muted-foreground">{latestVerse.notes}</p>
                </div>
              )}
            </div>
          </>
        )}
      </TabsContent>

      <TabsContent value="search" className="space-y-6 mt-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-2">Search Bible Verses</h2>
            <p className="text-sm text-muted-foreground">
              Select book, chapter, and verse to find any Bible passage
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
            <Select value={version} onValueChange={setVersion}>
              <SelectTrigger className="w-[100px]" data-testid="select-bible-version">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_VERSIONS.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={book} onValueChange={setBook}>
              <SelectTrigger className="w-[160px]" data-testid="select-bible-book">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_BOOKS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Chapter"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              disabled={isSearching}
              data-testid="input-chapter"
              className="w-[100px]"
              min="1"
            />

            <Input
              type="text"
              placeholder="Verse (optional)"
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              disabled={isSearching}
              data-testid="input-verse"
              className="w-[140px]"
            />

            <Button 
              type="submit" 
              disabled={isSearching || !chapter}
              data-testid="button-search-verse"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Go'
              )}
            </Button>
          </form>

          {searchResult && (
            <div className="space-y-4 border border-border rounded-lg p-6 bg-background" data-testid="search-result">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-serif font-semibold text-foreground">
                    {searchResult.reference}
                  </h3>
                  <span className="text-sm text-muted-foreground">{searchResult.translation}</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleSaveSearchResult}
                  disabled={saveMutation.isPending}
                  data-testid="button-save-verse"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Save Verse
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-base font-serif leading-relaxed text-foreground italic">
                "{searchResult.text}"
              </p>
            </div>
          )}

          {!searchResult && !isSearching && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                Search for a Bible verse to get started
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
