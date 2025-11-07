import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TaskCard } from "@/components/TaskCard";
import { TaskDialog } from "@/components/TaskDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  due_date: string | null;
  status: string;
  priority: string;
}

export default function Tasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchTasks();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({ title: "Task updated successfully!" });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{ ...taskData, user_id: user.id }]);

        if (error) throw error;
        toast({ title: "Task created successfully!" });
      }

      fetchTasks();
      setEditingTask(null);
    } catch (error: any) {
      toast({
        title: "Error saving task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: "Task deleted successfully!" });
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const filterTasks = (status?: string) => {
    if (!status) return tasks;
    return tasks.filter(task => task.status === status);
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
          <h1 className="text-3xl font-bold">Tasks</h1>
          <Button onClick={handleAddTask}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filterTasks('pending').length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({filterTasks('in_progress').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({filterTasks('completed').length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({filterTasks('overdue').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No tasks yet!</p>
                <p>Click "Add Task" to create your first task.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {['pending', 'in_progress', 'completed', 'overdue'].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {filterTasks(status).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No {status.replace('_', ' ')} tasks.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filterTasks(status).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editingTask}
          onSave={handleSaveTask}
        />
      </div>
    </Layout>
  );
}