import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2, Heart, DollarSign, Target, TrendingDown, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FinancialStewardshipWindow() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/financial/dashboard']
  });

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold text-foreground">Financial Stewardship</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tithe" data-testid="tab-tithe">Tithing</TabsTrigger>
          <TabsTrigger value="generosity" data-testid="tab-generosity">Generosity</TabsTrigger>
          <TabsTrigger value="debt" data-testid="tab-debt">Debt</TabsTrigger>
          <TabsTrigger value="goals" data-testid="tab-goals">Goals</TabsTrigger>
          <TabsTrigger value="reflections" data-testid="tab-reflections">Reflections</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="dashboard" className="mt-0">
            <DashboardTab data={dashboardData} />
          </TabsContent>

          <TabsContent value="tithe" className="mt-0">
            <TitheTab />
          </TabsContent>

          <TabsContent value="generosity" className="mt-0">
            <GenerosityTab />
          </TabsContent>

          <TabsContent value="debt" className="mt-0">
            <DebtTab />
          </TabsContent>

          <TabsContent value="goals" className="mt-0">
            <GoalsTab />
          </TabsContent>

          <TabsContent value="reflections" className="mt-0">
            <ReflectionsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function DashboardTab({ data }: { data: any }) {
  const stats = data?.stats || {
    totalTithed: 0,
    totalGiven: 0,
    totalDebt: 0,
    activeGoals: 0
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tithed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-tithed">${stats.totalTithed.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Given</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-given">${stats.totalGiven.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-debt">${stats.totalDebt.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-goals">{stats.activeGoals}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stewardship Insights</CardTitle>
          <CardDescription>Biblical guidance for your financial journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            "Give, and it will be given to you. A good measure, pressed down, shaken together and running over." - Luke 6:38
          </p>
          <p className="text-sm">
            Track your tithes, celebrate generosity, manage debt wisely, and set faith-centered financial goals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TitheTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const { data: tithesData, isLoading } = useQuery({
    queryKey: ['/api/financial/tithes']
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/financial/tithe', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/tithes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flourishing'] });
      setAmount('');
      setNotes('');
      setIsDialogOpen(false);
      toast({ title: 'Tithe recorded!', description: 'Your faithful giving has been logged.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to record tithe.', variant: 'destructive' });
    }
  });

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid amount.', variant: 'destructive' });
      return;
    }
    createMutation.mutate({ amount: parseFloat(amount), date, notes });
  };

  const tithes = (tithesData as any)?.tithes || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tithing Records</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-tithe">
              <Plus className="h-4 w-4 mr-2" />
              Add Tithe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Tithe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tithe-amount">Amount ($)</Label>
                <Input
                  id="tithe-amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100.00"
                  data-testid="input-tithe-amount"
                />
              </div>
              <div>
                <Label htmlFor="tithe-date">Date</Label>
                <Input
                  id="tithe-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="input-tithe-date"
                />
              </div>
              <div>
                <Label htmlFor="tithe-notes">Notes (optional)</Label>
                <Textarea
                  id="tithe-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Monthly tithe from paycheck"
                  data-testid="input-tithe-notes"
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending}
                className="w-full"
                data-testid="button-submit-tithe"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Tithe'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tithes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tithes recorded yet. Start tracking your faithful giving!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tithes.map((tithe: any) => (
            <Card key={tithe.id} data-testid={`card-tithe-${tithe.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold" data-testid={`text-tithe-amount-${tithe.id}`}>${parseFloat(tithe.amount).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(tithe.date).toLocaleDateString()}</p>
                    {tithe.notes && <p className="text-sm mt-1">{tithe.notes}</p>}
                  </div>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function GenerosityTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('offering');
  const [notes, setNotes] = useState('');

  const { data: actsData, isLoading } = useQuery({
    queryKey: ['/api/financial/generosity']
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/financial/generosity', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/generosity'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flourishing'] });
      setRecipient('');
      setAmount('');
      setNotes('');
      setIsDialogOpen(false);
      toast({ title: 'Act of generosity recorded!', description: 'Your giving has been logged.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to record generosity.', variant: 'destructive' });
    }
  });

  const handleSubmit = () => {
    if (!recipient.trim() || !amount || parseFloat(amount) <= 0) {
      toast({ title: 'Missing information', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    createMutation.mutate({ 
      recipient, 
      amount: parseFloat(amount), 
      category,
      notes 
    });
  };

  const acts = (actsData as any)?.acts || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Acts of Generosity</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-generosity">
              <Heart className="h-4 w-4 mr-2" />
              Record Giving
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Generosity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gen-recipient">Recipient</Label>
                <Input
                  id="gen-recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Charity name or person"
                  data-testid="input-generosity-recipient"
                />
              </div>
              <div>
                <Label htmlFor="gen-amount">Amount ($)</Label>
                <Input
                  id="gen-amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50.00"
                  data-testid="input-generosity-amount"
                />
              </div>
              <div>
                <Label htmlFor="gen-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="gen-category" data-testid="select-generosity-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offering">Offering</SelectItem>
                    <SelectItem value="charity">Charity</SelectItem>
                    <SelectItem value="mission">Mission</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gen-notes">Notes (optional)</Label>
                <Textarea
                  id="gen-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Purpose or context"
                  data-testid="input-generosity-notes"
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending}
                className="w-full"
                data-testid="button-submit-generosity"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Giving'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : acts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No acts of generosity recorded yet. Celebrate your giving!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {acts.map((act: any) => (
            <Card key={act.id} data-testid={`card-generosity-${act.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{act.recipient}</p>
                    <p className="text-sm text-muted-foreground">${parseFloat(act.amount).toFixed(2)} • {act.category}</p>
                    {act.notes && <p className="text-sm mt-1">{act.notes}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(act.date).toLocaleDateString()}</p>
                  </div>
                  <Heart className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DebtTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [debtName, setDebtName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');

  const { data: debtsData, isLoading } = useQuery({
    queryKey: ['/api/financial/debts']
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/financial/debt', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/debts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/dashboard'] });
      setDebtName('');
      setTotalAmount('');
      setCurrentBalance('');
      setIsDialogOpen(false);
      toast({ title: 'Debt account added!', description: 'Track your progress toward freedom.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add debt account.', variant: 'destructive' });
    }
  });

  const handleSubmit = () => {
    if (!debtName.trim() || !totalAmount || !currentBalance) {
      toast({ title: 'Missing information', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    createMutation.mutate({ 
      debtName, 
      totalAmount: parseFloat(totalAmount), 
      currentBalance: parseFloat(currentBalance)
    });
  };

  const debts = (debtsData as any)?.debts || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Debt Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-debt">
              <Plus className="h-4 w-4 mr-2" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Debt Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="debt-name">Debt Name</Label>
                <Input
                  id="debt-name"
                  value={debtName}
                  onChange={(e) => setDebtName(e.target.value)}
                  placeholder="Credit Card, Student Loan, etc."
                  data-testid="input-debt-name"
                />
              </div>
              <div>
                <Label htmlFor="debt-total">Original Amount ($)</Label>
                <Input
                  id="debt-total"
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="5000.00"
                  data-testid="input-debt-total"
                />
              </div>
              <div>
                <Label htmlFor="debt-balance">Current Balance ($)</Label>
                <Input
                  id="debt-balance"
                  type="number"
                  step="0.01"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  placeholder="3000.00"
                  data-testid="input-debt-balance"
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending}
                className="w-full"
                data-testid="button-submit-debt"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Debt'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : debts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No debt accounts tracked. Add debts to monitor your progress!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {debts.map((debt: any) => {
            const progress = ((parseFloat(debt.totalAmount) - parseFloat(debt.currentBalance)) / parseFloat(debt.totalAmount) * 100).toFixed(1);
            return (
              <Card key={debt.id} data-testid={`card-debt-${debt.id}`}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{debt.debtName}</p>
                      <TrendingDown className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Balance: ${parseFloat(debt.currentBalance).toFixed(2)} of ${parseFloat(debt.totalAmount).toFixed(2)}
                    </p>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{progress}% paid off</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GoalsTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const { data: goalsData, isLoading } = useQuery({
    queryKey: ['/api/financial/goals']
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/financial/goal', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flourishing'] });
      setGoalName('');
      setTargetAmount('');
      setTargetDate('');
      setIsDialogOpen(false);
      toast({ title: 'Goal created!', description: 'Your financial goal has been set.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create goal.', variant: 'destructive' });
    }
  });

  const handleSubmit = () => {
    if (!goalName.trim() || !targetAmount || !targetDate) {
      toast({ title: 'Missing information', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    createMutation.mutate({ 
      goalName, 
      targetAmount: parseFloat(targetAmount), 
      targetDate 
    });
  };

  const goals = (goalsData as any)?.goals || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Financial Goals</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-goal">
              <Target className="h-4 w-4 mr-2" />
              Set Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Financial Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Emergency Fund, Mission Trip, etc."
                  data-testid="input-goal-name"
                />
              </div>
              <div>
                <Label htmlFor="goal-amount">Target Amount ($)</Label>
                <Input
                  id="goal-amount"
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="1000.00"
                  data-testid="input-goal-amount"
                />
              </div>
              <div>
                <Label htmlFor="goal-date">Target Date</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  data-testid="input-goal-date"
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending}
                className="w-full"
                data-testid="button-submit-goal"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Goal'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No financial goals set yet. Create faith-centered goals!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {goals.map((goal: any) => (
            <Card key={goal.id} data-testid={`card-goal-${goal.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{goal.goalName}</p>
                    <p className="text-sm text-muted-foreground">
                      Target: ${parseFloat(goal.targetAmount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      By {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReflectionsTab() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reflection, setReflection] = useState('');

  const { data: reflectionsData, isLoading } = useQuery({
    queryKey: ['/api/financial/reflections']
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/financial/reflection', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial/reflections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/flourishing'] });
      setReflection('');
      setIsDialogOpen(false);
      toast({ title: 'Reflection saved!', description: 'Your stewardship insights have been recorded.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save reflection.', variant: 'destructive' });
    }
  });

  const handleSubmit = () => {
    if (!reflection.trim()) {
      toast({ title: 'Empty reflection', description: 'Please write your reflection.', variant: 'destructive' });
      return;
    }
    createMutation.mutate({ reflection });
  };

  const reflections = (reflectionsData as any)?.reflections || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Stewardship Reflections</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-reflection">
              <Sparkles className="h-4 w-4 mr-2" />
              Write Reflection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stewardship Reflection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reflection">Your Reflection</Label>
                <Textarea
                  id="reflection"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="How has God been teaching you about stewardship? What are you learning about generosity, contentment, or trust in His provision?"
                  rows={6}
                  data-testid="input-reflection"
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending}
                className="w-full"
                data-testid="button-submit-reflection"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Reflection'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reflections.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No reflections yet. Share your stewardship journey!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {reflections.map((ref: any) => (
            <Card key={ref.id} data-testid={`card-reflection-${ref.id}`}>
              <CardContent className="p-4">
                <p className="text-sm whitespace-pre-wrap">{ref.reflection}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(ref.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
