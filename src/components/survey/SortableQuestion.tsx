import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  GripVertical, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Plus,
  Circle,
  CheckSquare,
  FileText,
  Star,
  Calendar
} from 'lucide-react';
import { Question } from './SurveyBuilder';

interface SortableQuestionProps {
  question: Question;
  index: number;
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onDelete: (id: string) => void;
}

const getQuestionIcon = (type: Question['type']) => {
  switch (type) {
    case 'single-choice': return Circle;
    case 'multiple-choice': return CheckSquare;
    case 'open-text': return FileText;
    case 'rating': return Star;
    case 'date': return Calendar;
    default: return FileText;
  }
};

export const SortableQuestion = ({ question, index, onUpdate, onDelete }: SortableQuestionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [editDescription, setEditDescription] = useState(question.description || '');
  const [editOptions, setEditOptions] = useState(question.options || []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = getQuestionIcon(question.type);

  const handleSave = () => {
    onUpdate(question.id, {
      title: editTitle,
      description: editDescription,
      ...(question.options ? { options: editOptions } : {})
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(question.title);
    setEditDescription(question.description || '');
    setEditOptions(question.options || []);
    setIsEditing(false);
  };

  const addOption = () => {
    setEditOptions([...editOptions, `Option ${editOptions.length + 1}`]);
  };

  const updateOption = (index: number, value: string) => {
    setEditOptions(editOptions.map((opt, i) => i === index ? value : opt));
  };

  const removeOption = (index: number) => {
    setEditOptions(editOptions.filter((_, i) => i !== index));
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div 
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 text-muted-foreground cursor-grab active:cursor-grabbing mt-1"
        >
          <div className="bg-muted rounded px-2 py-1 text-xs font-medium">
            {index + 1}
          </div>
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Question Icon */}
        <div className="mt-1">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Question title"
                className="font-medium"
              />
              
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Question description (optional)"
                rows={2}
              />

              {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Options</Label>
                  {editOptions.map((option, optIndex) => (
                    <div key={optIndex} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        className="flex-1"
                      />
                      {editOptions.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(optIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addOption} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={question.required}
                  onCheckedChange={(checked) => onUpdate(question.id, { required: checked })}
                />
                <Label className="text-sm">Required question</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{question.title}</h4>
                  {question.description && (
                    <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                  )}
                  
                  {/* Question Preview */}
                  <div className="mt-3 text-sm">
                    {question.type === 'single-choice' && question.options && (
                      <div className="space-y-1">
                        {question.options.map((option, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-border"></div>
                            <span className="text-muted-foreground">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'multiple-choice' && question.options && (
                      <div className="space-y-1">
                        {question.options.map((option, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded border border-border"></div>
                            <span className="text-muted-foreground">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'open-text' && (
                      <div className="w-full h-20 rounded border border-border bg-muted/20"></div>
                    )}
                    
                    {question.type === 'rating' && (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 text-muted-foreground" />
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'date' && (
                      <div className="w-40 h-10 rounded border border-border bg-muted/20 flex items-center px-3 text-muted-foreground">
                        Select date...
                      </div>
                    )}
                  </div>
                  
                  {question.required && (
                    <div className="text-xs text-destructive mt-2">* Required</div>
                  )}
                </div>

                <div className="flex gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};