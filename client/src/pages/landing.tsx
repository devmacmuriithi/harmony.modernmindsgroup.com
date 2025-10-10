import { Link } from 'wouter';
import { Book, Heart, MessageSquare, TrendingUp, Users, Sparkles, CheckCircle2, ArrowRight, Zap, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Flourishing Index",
      description: "AI-powered spiritual wellness tracking with personalized insights for your faith journey",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Holy Bible",
      description: "Daily personalized scripture with AI recommendations based on your spiritual growth",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Prayer Journal",
      description: "Track your prayers, mark answered prayers, and witness God's faithfulness",
      color: "from-pink-400 to-rose-500"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Daily Devotionals",
      description: "AI-generated devotional content personalized to your spiritual journey",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Spiritual Guides",
      description: "AI companions for prayer support, biblical wisdom, and spiritual encouragement",
      color: "from-amber-400 to-orange-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Faith Circles",
      description: "Join communities for Bible study, prayer, fellowship, and spiritual growth",
      color: "from-violet-400 to-purple-500"
    }
  ];

  const benefits = [
    "Desktop-inspired workspace with windows, dock, and tile views",
    "14+ faith-based productivity apps in one platform",
    "AI-powered personalization for spiritual growth",
    "Prayer tracking with answered prayer celebration",
    "Community forums for fellowship and support",
    "Beautiful stained-glass aesthetic design"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] via-[#f5f1e8] to-amber-50 dark:from-[#1a1410] dark:via-[#1a1410] dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#c9a961_1px,transparent_1px)] [background-size:16px_16px] opacity-20 animate-pulse"></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f5f1e8]/50 to-[#f5f1e8] dark:via-[#1a1410]/50 dark:to-[#1a1410]"></div>

        {/* Floating gradient orbs for vibrancy */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative">
          {/* Navigation */}
          <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">Harmony</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" data-testid="button-nav-login">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-amber-600 text-white shadow-lg" data-testid="button-nav-register">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content - Split Layout */}
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Value Proposition */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full mb-6">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">AI-Powered Faith Growth Platform</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                  Measure Your
                  <span className="block bg-gradient-to-r from-purple-600 via-amber-600 to-amber-500 bg-clip-text text-transparent">
                    Spiritual Flourishing
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-xl">
                  Track your faith journey with the <span className="font-semibold text-amber-600">Flourishing Index</span> - 
                  a comprehensive score across 7 spiritual dimensions powered by AI insights.
                </p>

                {/* Key Value Points */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-amber-200/30 dark:border-amber-800/30">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">Real-Time Tracking</div>
                      <div className="text-xs text-muted-foreground">7 spiritual dimensions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 border border-amber-200/30 dark:border-amber-800/30">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <Target className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">AI Insights</div>
                      <div className="text-xs text-muted-foreground">Personalized guidance</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  <Link href="/register">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-lg px-8 py-6 shadow-xl shadow-amber-500/25"
                      data-testid="button-hero-get-started"
                    >
                      Start Measuring Today
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="text-lg px-8 py-6 border-2 border-amber-300 dark:border-amber-700"
                      data-testid="button-hero-sign-in"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Side - Flourishing Index Visualization */}
              <div className="relative">
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-amber-500/20 to-pink-500/20 rounded-3xl blur-3xl animate-pulse"></div>
                
                {/* Main visualization card */}
                <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-amber-200/50 dark:border-amber-800/50 shadow-2xl">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-muted-foreground">Your Flourishing Index</span>
                    </div>
                    <div className="text-7xl font-bold bg-gradient-to-br from-purple-600 via-amber-600 to-amber-500 bg-clip-text text-transparent mb-2" data-testid="demo-fi-score">
                      85
                    </div>
                    <div className="flex items-center justify-center gap-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400" data-testid="demo-fi-status">
                      <span>Thriving</span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>

                  {/* 7 Dimensions with animated bars */}
                  <div className="space-y-3">
                    {[
                      { label: 'Health', score: 85, color: 'from-red-500 to-pink-600' },
                      { label: 'Relationships', score: 78, color: 'from-blue-500 to-cyan-600' },
                      { label: 'Finances', score: 82, color: 'from-green-500 to-emerald-600' },
                      { label: 'Meaning', score: 90, color: 'from-purple-500 to-violet-600' },
                      { label: 'Happiness', score: 88, color: 'from-yellow-500 to-amber-600' },
                      { label: 'Character', score: 92, color: 'from-indigo-500 to-purple-600' },
                      { label: 'Faith', score: 95, color: 'from-amber-500 to-orange-600' },
                    ].map((dim, idx) => (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium text-foreground">{dim.label}</span>
                          <span className="text-muted-foreground">{dim.score}/100</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${dim.color} transition-all duration-1000 ease-out`}
                            style={{ 
                              width: `${dim.score}%`,
                              animation: `slideIn 0.8s ease-out ${idx * 0.1}s both`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Insight Preview */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground" data-testid="demo-ai-insight">
                        <span className="font-semibold">AI Insight:</span> Your faith score is exceptional! 
                        Consider mentoring others in their spiritual journey.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Quick Explainer */}
      <div className="bg-gradient-to-br from-purple-50 to-amber-50 dark:from-purple-950/30 dark:to-amber-950/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How Your Flourishing Index Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI analyzes your spiritual activities to give you a comprehensive view of your faith journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Track Your Activities</h3>
              <p className="text-muted-foreground">Prayer, Bible reading, mood, community engagement - we analyze it all</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Get Your Score</h3>
              <p className="text-muted-foreground">See how you're doing across 7 key spiritual dimensions in real-time</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Grow with AI Insights</h3>
              <p className="text-muted-foreground">Receive personalized recommendations to deepen your faith journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Complete Faith Workspace
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            14+ powerful apps designed to nurture every aspect of your spiritual growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-amber-900/10 dark:border-amber-200/10 hover:-translate-y-1 transition-all duration-200 hover:shadow-xl"
              data-testid={`feature-card-${index}`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-slate-800/50 dark:to-slate-900/50 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Why Choose Harmony?
              </h2>
              <p className="text-xl text-muted-foreground">
                A complete spiritual growth platform designed for modern believers
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-4 border border-amber-900/10 dark:border-amber-200/10"
                  data-testid={`benefit-item-${index}`}
                >
                  <CheckCircle2 className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-600 via-amber-600 to-amber-500 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden shadow-2xl">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent)]"></div>
          
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start Measuring Your Spiritual Growth
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join believers worldwide tracking their faith journey with AI-powered insights
            </p>
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-amber-600 text-lg px-10 py-6 shadow-xl"
                data-testid="button-cta-get-started"
              >
                Get Your Flourishing Score
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-amber-900/10 dark:border-amber-200/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Harmony</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Harmony. Faith-based productivity workspace.
            </p>
          </div>
        </div>
      </footer>

      {/* Add animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from {
            width: 0%;
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
