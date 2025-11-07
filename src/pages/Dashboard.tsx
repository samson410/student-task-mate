import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, AlertCircle, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0,
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats
      const stats = {
        total: tasks?.length || 0,
        pending: tasks?.filter(t => t.status === 'pending').length || 0,
        in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
        completed: tasks?.filter(t => t.status === 'completed').length || 0,
        overdue: tasks?.filter(t => t.status === 'overdue').length || 0,
      };

      setStats(stats);
      setRecentTasks(tasks?.slice(0, 5) || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'completed');

      const { data, error } = await supabase.functions.invoke('suggest-tasks', {
        body: { tasks }
      });

      if (error) throw error;

      setSuggestions(data.suggestions);
      toast({
        title: "AI Suggestions Ready!",
        description: `Generated ${data.suggestions.length} personalized suggestions.`,
      });
    } catch (error: any) {
      toast({
        title: "Error getting suggestions",
        description: error.message || "Failed to generate AI suggestions.",
        variant: "destructive",
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleGetSuggestions} disabled={loadingSuggestions}>
            {loadingSuggestions ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Suggestions
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.in_progress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{suggestion.title}</h4>
                      <Badge variant="outline">{suggestion.priority}</Badge>
                      <Badge variant="secondary">{suggestion.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tasks yet. Create your first task to get started!
              </p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.category}</p>
                    </div>
                    <Badge>{task.status.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/tasks')}
            >
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}