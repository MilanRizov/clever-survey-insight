import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Question } from './SurveyBuilder';

interface AISurveyGeneratorProps {
  onSurveyGenerated: (title: string, questions: Question[]) => void;
}

export const AISurveyGenerator = ({ onSurveyGenerated }: AISurveyGeneratorProps) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please describe what kind of survey you want to create.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-survey-questions', {
        body: { prompt: prompt.trim() }
      });

      if (error) {
        throw error;
      }

      if (!data || !data.questions) {
        throw new Error('Invalid response from AI');
      }

      // Add IDs to questions
      const questionsWithIds = data.questions.map((q: Omit<Question, 'id'>, index: number) => ({
        ...q,
        id: `ai-question-${Date.now()}-${index}`,
      }));

      onSurveyGenerated(data.title, questionsWithIds);
      
      toast({
        title: 'Survey generated!',
        description: `Created ${questionsWithIds.length} questions. You can now edit and save your survey.`,
      });

      setOpen(false);
      setPrompt('');
    } catch (error: any) {
      console.error('Error generating survey:', error);
      
      let errorMessage = 'Failed to generate survey questions. Please try again.';
      if (error.message?.includes('Rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      } else if (error.message?.includes('Payment required')) {
        errorMessage = 'AI credits exhausted. Please add credits to your workspace.';
      }
      
      toast({
        title: 'Generation failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Survey Generator</DialogTitle>
          <DialogDescription>
            Describe your survey topic or goal, and AI will create 3-5 relevant questions for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              What kind of survey do you want to create?
            </label>
            <Textarea
              id="prompt"
              placeholder="Example: Customer satisfaction survey for a coffee shop, Employee engagement survey for remote teams, Product feedback survey for a mobile app..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
              disabled={isGenerating}
            />
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Survey
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
