import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Sparkles, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AIUsageRecord {
  id: string;
  operation_type: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  metadata: any;
  created_at: string;
}

interface UsageSummary {
  totalOperations: number;
  totalTokens: number;
  totalCost: number;
  operationBreakdown: Record<string, number>;
}

export default function AIUsageHistory() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<AIUsageRecord[]>([]);
  const [summary, setSummary] = useState<UsageSummary>({
    totalOperations: 0,
    totalTokens: 0,
    totalCost: 0,
    operationBreakdown: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_usage_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
      
      // Calculate summary
      const totalOps = data?.length || 0;
      const totalTok = data?.reduce((sum, record) => sum + (record.total_tokens || 0), 0) || 0;
      const totalCst = data?.reduce((sum, record) => sum + parseFloat(String(record.estimated_cost || 0)), 0) || 0;
      const breakdown = data?.reduce((acc, record) => {
        acc[record.operation_type] = (acc[record.operation_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setSummary({
        totalOperations: totalOps,
        totalTokens: totalTok,
        totalCost: totalCst,
        operationBreakdown: breakdown
      });
    } catch (error) {
      console.error('Error fetching AI usage history:', error);
      toast.error('Failed to load AI usage history');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (history.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Date',
      'Operation Type',
      'Model',
      'Prompt Tokens',
      'Completion Tokens',
      'Total Tokens',
      'Estimated Cost ($)',
      'Metadata'
    ];

    const rows = history.map(record => [
      format(new Date(record.created_at), 'yyyy-MM-dd HH:mm:ss'),
      getOperationLabel(record.operation_type),
      record.model,
      record.prompt_tokens,
      record.completion_tokens,
      record.total_tokens,
      record.estimated_cost.toFixed(6),
      JSON.stringify(record.metadata)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ai-usage-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV exported successfully');
  };

  const getOperationLabel = (type: string) => {
    const labels: Record<string, string> = {
      'generate_survey_questions': 'Generate Survey',
      'analyze_open_text': 'Analyze Responses'
    };
    return labels[type] || type;
  };

  const getOperationIcon = (type: string) => {
    if (type === 'generate_survey_questions') return <Sparkles className="h-4 w-4" />;
    if (type === 'analyze_open_text') return <MessageSquare className="h-4 w-4" />;
    return null;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">AI Usage History</h1>
            <p className="text-muted-foreground mt-2">
              Track your AI operations and credit costs
            </p>
          </div>
          <Button onClick={exportToCSV} disabled={history.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalOperations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTokens.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalCost.toFixed(4)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost/Operation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${summary.totalOperations > 0 ? (summary.totalCost / summary.totalOperations).toFixed(4) : '0.0000'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
            <CardDescription>
              Detailed log of all AI operations with token usage and costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No AI usage history found. Start using AI features to see your usage here.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getOperationIcon(record.operation_type)}
                            <span>{getOperationLabel(record.operation_type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.model.split('/')[1]}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {record.total_tokens.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${record.estimated_cost.toFixed(6)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {record.operation_type === 'generate_survey_questions' && 
                            `${record.metadata.questions_generated || 0} questions`}
                          {record.operation_type === 'analyze_open_text' && 
                            `${record.metadata.response_count || 0} responses, ${record.metadata.topics_identified || 0} topics`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
