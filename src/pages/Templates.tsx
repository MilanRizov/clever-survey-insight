import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Star, 
  Users, 
  TrendingUp, 
  Heart, 
  Briefcase,
  GraduationCap,
  ShoppingCart 
} from 'lucide-react';

const templateCategories = [
  {
    id: 'customer-feedback',
    title: 'Customer Feedback',
    description: 'Gather insights from your customers',
    icon: Star,
    color: 'bg-blue-500',
    templates: [
      {
        id: 'nps-survey',
        title: 'Net Promoter Score (NPS)',
        description: 'Measure customer loyalty and satisfaction',
        questions: 12,
        estimatedTime: '3-5 min',
        popular: true
      },
      {
        id: 'customer-satisfaction',
        title: 'Customer Satisfaction Survey',
        description: 'Comprehensive feedback on products and services',
        questions: 15,
        estimatedTime: '5-7 min',
        popular: false
      }
    ]
  },
  {
    id: 'employee-engagement',
    title: 'Employee Engagement',
    description: 'Understand your workforce better',
    icon: Users,
    color: 'bg-green-500',
    templates: [
      {
        id: 'employee-satisfaction',
        title: 'Employee Satisfaction Survey',
        description: 'Measure workplace satisfaction and engagement',
        questions: 20,
        estimatedTime: '7-10 min',
        popular: true
      },
      {
        id: 'exit-interview',
        title: 'Exit Interview Survey',
        description: 'Gather feedback from departing employees',
        questions: 18,
        estimatedTime: '10-15 min',
        popular: false
      }
    ]
  },
  {
    id: 'market-research',
    title: 'Market Research',
    description: 'Understand your market and competition',
    icon: TrendingUp,
    color: 'bg-purple-500',
    templates: [
      {
        id: 'market-analysis',
        title: 'Market Analysis Survey',
        description: 'Analyze market trends and customer preferences',
        questions: 25,
        estimatedTime: '10-12 min',
        popular: false
      },
      {
        id: 'product-feedback',
        title: 'Product Feedback Survey',
        description: 'Get detailed feedback on your products',
        questions: 16,
        estimatedTime: '6-8 min',
        popular: true
      }
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Patient satisfaction and health assessments',
    icon: Heart,
    color: 'bg-red-500',
    templates: [
      {
        id: 'patient-satisfaction',
        title: 'Patient Satisfaction Survey',
        description: 'Measure patient experience and care quality',
        questions: 22,
        estimatedTime: '8-10 min',
        popular: false
      }
    ]
  },
  {
    id: 'business',
    title: 'Business',
    description: 'General business and operational surveys',
    icon: Briefcase,
    color: 'bg-orange-500',
    templates: [
      {
        id: 'vendor-evaluation',
        title: 'Vendor Evaluation Survey',
        description: 'Assess vendor performance and relationships',
        questions: 14,
        estimatedTime: '5-7 min',
        popular: false
      }
    ]
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Academic and training feedback surveys',
    icon: GraduationCap,
    color: 'bg-indigo-500',
    templates: [
      {
        id: 'course-evaluation',
        title: 'Course Evaluation Survey',
        description: 'Gather feedback on courses and training',
        questions: 18,
        estimatedTime: '6-8 min',
        popular: true
      }
    ]
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    description: 'Online shopping and customer experience',
    icon: ShoppingCart,
    color: 'bg-teal-500',
    templates: [
      {
        id: 'post-purchase',
        title: 'Post-Purchase Survey',
        description: 'Collect feedback after online purchases',
        questions: 12,
        estimatedTime: '4-6 min',
        popular: false
      }
    ]
  }
];

const Templates: React.FC = () => {
  const navigate = useNavigate();

  const handleUseTemplate = (templateId: string) => {
    // For now, navigate to create survey page
    // In the future, this would pre-populate the survey builder with template data
    navigate('/surveys/create');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Survey Templates</h1>
        <p className="text-muted-foreground">
          Choose from our professionally designed survey templates to get started quickly
        </p>
      </div>

      <div className="space-y-8">
        {templateCategories.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${category.color}`}>
                <category.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {template.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{template.questions} questions</span>
                      <span>{template.estimatedTime}</span>
                    </div>
                    
                    <Button 
                      onClick={() => handleUseTemplate(template.id)}
                      className="w-full"
                      variant="outline"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;