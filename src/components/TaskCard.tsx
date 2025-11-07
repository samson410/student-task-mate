import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, FolderOpen } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  due_date: string | null;
  status: string;
  priority: string;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  pending: "bg-muted",
  in_progress: "bg-warning",
  completed: "bg-success",
  overdue: "bg-destructive",
};

const priorityColors = {
  low: "border-muted",
  medium: "border-warning",
  high: "border-destructive",
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className={`${priorityColors[task.priority as keyof typeof priorityColors]} border-l-4 hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription className="mt-1">
              {task.description || "No description"}
            </CardDescription>
          </div>
          <Badge className={`${statusColors[task.status as keyof typeof statusColors]} text-white`}>
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <FolderOpen className="h-4 w-4 mr-1" />
            {task.category}
          </div>
          {task.due_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(task.due_date), 'MMM dd, yyyy')}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(task.id)}>
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}