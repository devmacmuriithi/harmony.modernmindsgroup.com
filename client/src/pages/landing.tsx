import { Link } from 'wouter';
import { Book, Heart, MessageSquare, TrendingUp, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
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
        {/* Dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#c9a961_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f5f1e8]/50 to-[#f5f1e8] dark:via-[#1a1410]/50 dark:to-[#1a1410]"></div>

        <div className="relative">
          {/* Navigation */}
          <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
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
                <Button className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="button-nav-register">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="container mx-auto px-6 py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                Your Faith-Based
                <span className="block bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                  Productivity Workspace
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Harmony combines spiritual growth with modern productivity. Track prayers, read Scripture, 
                and grow in faith—all in one beautiful desktop-inspired workspace.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button 
                    size="lg" 
                    className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8 py-6"
                    data-testid="button-hero-get-started"
                  >
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="text-lg px-8 py-6 border-amber-300 dark:border-amber-700"
                    data-testid="button-hero-sign-in"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Available On Harmony
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover powerful faith-based apps designed to nurture your spiritual growth
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-amber-900/10 dark:border-amber-200/10 hover:-translate-y-1 transition-all duration-200 hover:shadow-xl"
              data-testid={`feature-card-${index}`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
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
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-12 md:p-16 text-white relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]"></div>
          
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Begin Your Faith Journey Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of believers growing in faith with Harmony's AI-powered spiritual tools
            </p>
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-10 py-6"
                data-testid="button-cta-get-started"
              >
                Get Started for Free
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
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
    </div>
  );
}
