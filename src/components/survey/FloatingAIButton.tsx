import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Question } from './SurveyBuilder';

interface FloatingAIButtonProps {
  onSurveyGenerated: (title: string, questions: Question[]) => void;
}

export const FloatingAIButton = ({ onSurveyGenerated }: FloatingAIButtonProps) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Answer required',
        description: 'Please describe what findings you are looking to get.',
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
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 p-0"
        title="Generate with AI"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Survey with AI
            </DialogTitle>
            <DialogDescription>
              Tell us what you want to learn from your audience, and AI will create the perfect questions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                What findings you are looking to get via your Survey?
              </label>
              <Textarea
                id="prompt"
                placeholder="Example: I want to understand customer satisfaction with our new mobile app, identify pain points in the checkout process, measure brand perception among millennials..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[140px]"
                disabled={isGenerating}
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Survey...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Survey Questions
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
