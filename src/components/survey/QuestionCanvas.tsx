import { useDroppable } from '@dnd-kit/core';
import { SortableQuestion } from './SortableQuestion';
import { Question } from './SurveyBuilder';

interface QuestionCanvasProps {
  questions: Question[];
  onUpdateQuestion: (id: string, updates: Partial<Question>) => void;
  onDeleteQuestion: (id: string) => void;
}

export const QuestionCanvas = ({ questions, onUpdateQuestion, onDeleteQuestion }: QuestionCanvasProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas',
  });

  return (
    <div 
      ref={setNodeRef}
      className={`min-h-96 rounded-lg border-2 border-dashed transition-colors ${
        isOver 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-border/80'
      }`}
    >
      {questions.length === 0 ? (
        <div className="flex items-center justify-center h-96 text-center">
          <div>
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">Start Building Your Survey</h3>
            <p className="text-muted-foreground">
              Drag question types from the left panel to create your survey
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {questions.map((question, index) => (
            <SortableQuestion
              key={question.id}
              question={question}
              index={index}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
            />
          ))}
        </div>
      )}
    </div>
  );
};