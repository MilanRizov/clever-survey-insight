import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { QuestionTypePalette } from './QuestionTypePalette';
import { QuestionCanvas } from './QuestionCanvas';
import { SortableQuestion } from './SortableQuestion';
import { Card } from '@/components/ui/card';

export interface Question {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'open-text' | 'rating' | 'date';
  title: string;
  description?: string;
  options?: string[];
  required?: boolean;
}

export const SurveyBuilder = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    
    // Check if dragging from palette or from canvas
    if (event.active.data.current?.fromPalette) {
      setActiveQuestion({
        id: `question-${Date.now()}`,
        type: event.active.id as Question['type'],
        title: `New ${event.active.id.toString().replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Question`,
        required: false,
        ...(event.active.id === 'single-choice' || event.active.id === 'multiple-choice' 
          ? { options: ['Option 1', 'Option 2'] } 
          : {})
      });
    } else {
      const question = questions.find(q => q.id === event.active.id);
      setActiveQuestion(question || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveQuestion(null);
      return;
    }

    // Adding new question from palette
    if (active.data.current?.fromPalette && over.id === 'canvas') {
      const newQuestion: Question = {
        id: `question-${Date.now()}`,
        type: active.id as Question['type'],
        title: `New ${active.id.toString().replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Question`,
        required: false,
        ...(active.id === 'single-choice' || active.id === 'multiple-choice' 
          ? { options: ['Option 1', 'Option 2'] } 
          : {})
      };
      
      setQuestions(prev => [...prev, newQuestion]);
    }
    
    // Reordering existing questions
    if (!active.data.current?.fromPalette && over.id !== 'canvas') {
      const activeIndex = questions.findIndex(q => q.id === active.id);
      const overIndex = questions.findIndex(q => q.id === over.id);
      
      if (activeIndex !== overIndex) {
        const newQuestions = [...questions];
        const [removed] = newQuestions.splice(activeIndex, 1);
        newQuestions.splice(overIndex, 0, removed);
        setQuestions(newQuestions);
      }
    }

    setActiveId(null);
    setActiveQuestion(null);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-6">
        {/* Question Types Palette */}
        <div className="w-80 shrink-0">
          <Card className="p-6 h-full">
            <h3 className="text-lg font-semibold mb-4">Question Types</h3>
            <QuestionTypePalette />
          </Card>
        </div>

        {/* Survey Canvas */}
        <div className="flex-1">
          <Card className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Survey Builder</h3>
              <div className="text-sm text-muted-foreground">
                {questions.length} question{questions.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <QuestionCanvas 
                questions={questions}
                onUpdateQuestion={updateQuestion}
                onDeleteQuestion={deleteQuestion}
              />
            </SortableContext>
          </Card>
        </div>
      </div>

      <DragOverlay>
        {activeQuestion && (
          <div className="bg-card border border-border rounded-lg p-4 shadow-lg opacity-90">
            <div className="font-medium">{activeQuestion.title}</div>
            <div className="text-sm text-muted-foreground capitalize">
              {activeQuestion.type.replace('-', ' ')} Question
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};