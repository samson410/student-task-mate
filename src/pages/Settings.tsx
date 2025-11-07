import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun } from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    toast({
      title: `${newDarkMode ? 'Dark' : 'Light'} mode enabled`,
      description: `Switched to ${newDarkMode ? 'dark' : 'light'} mode.`,
    });
  };

  const handleResetData = async () => {
    if (!confirm('Are you sure you want to delete all your tasks? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "All tasks deleted",
        description: "Your task list has been cleared.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting tasks",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how TaskFlow looks for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="text-base flex items-center gap-2">
                    {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for a better viewing experience
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Email</Label>
                <p className="text-sm text-muted-foreground">
                  Manage your account settings here
                </p>
              </div>
              <div className="pt-4 border-t">
                <Button variant="destructive" onClick={handleResetData}>
                  Delete All Tasks
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  This will permanently delete all your tasks. This action cannot be undone.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About TaskFlow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TaskFlow is a modern productivity dashboard designed for freelancers and students.
                Manage your tasks, track your progress, and boost your productivity with AI-powered suggestions.
              </p>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}