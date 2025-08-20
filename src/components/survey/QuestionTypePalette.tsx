import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { 
  Circle, 
  CheckSquare, 
  FileText, 
  Star, 
  Calendar,
  GripVertical 
} from 'lucide-react';

interface QuestionTypeItemProps {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const QuestionTypeItem = ({ id, title, description, icon: Icon }: QuestionTypeItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { fromPalette: true }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-5 w-5" />
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export const QuestionTypePalette = () => {
  const questionTypes = [
    {
      id: 'single-choice',
      title: 'Single Choice',
      description: 'Select one option from multiple choices',
      icon: Circle
    },
    {
      id: 'multiple-choice',
      title: 'Multiple Choice',
      description: 'Select multiple options from a list',
      icon: CheckSquare
    },
    {
      id: 'open-text',
      title: 'Open Text',
      description: 'Free text response field',
      icon: FileText
    },
    {
      id: 'rating',
      title: 'Rating',
      description: 'Star or numeric rating scale',
      icon: Star
    },
    {
      id: 'date',
      title: 'Date',
      description: 'Date picker for temporal data',
      icon: Calendar
    }
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop question types to build your survey
      </p>
      {questionTypes.map((type) => (
        <QuestionTypeItem
          key={type.id}
          id={type.id}
          title={type.title}
          description={type.description}
          icon={type.icon}
        />
      ))}
    </div>
  );
};