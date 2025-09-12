import { Question } from '@/components/survey/SurveyBuilder';

export interface Template {
  id: string;
  title: string;
  questions: Question[];
}

export const templateData: Record<string, Template> = {
  'nps-survey': {
    id: 'nps-survey',
    title: 'Net Promoter Score (NPS)',
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'How likely are you to recommend our product/service to a friend or colleague?',
        description: 'Please rate from 0 (not at all likely) to 10 (extremely likely)',
        required: true
      },
      {
        id: '2',
        type: 'open-text',
        title: 'What is the primary reason for your score?',
        description: 'Please explain what influenced your rating',
        required: false
      },
      {
        id: '3',
        type: 'multiple-choice',
        title: 'Which of the following best describes you?',
        options: ['New customer', 'Returning customer', 'Long-time customer', 'First-time user'],
        required: true
      },
      {
        id: '4',
        type: 'single-choice',
        title: 'How did you first hear about us?',
        options: ['Search engine', 'Social media', 'Word of mouth', 'Advertisement', 'Other'],
        required: false
      }
    ]
  },
  'customer-satisfaction': {
    id: 'customer-satisfaction',
    title: 'Customer Satisfaction Survey',
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'Overall, how satisfied are you with our product/service?',
        description: 'Rate from 1 (very dissatisfied) to 5 (very satisfied)',
        required: true
      },
      {
        id: '2',
        type: 'rating',
        title: 'How would you rate the quality of our product/service?',
        required: true
      },
      {
        id: '3',
        type: 'rating',
        title: 'How responsive have we been to your questions or concerns?',
        required: true
      },
      {
        id: '4',
        type: 'single-choice',
        title: 'How likely are you to purchase from us again?',
        options: ['Very likely', 'Likely', 'Neutral', 'Unlikely', 'Very unlikely'],
        required: true
      },
      {
        id: '5',
        type: 'open-text',
        title: 'What could we do to improve your experience?',
        required: false
      }
    ]
  },
  'product-discovery': {
    id: 'product-discovery',
    title: 'Product Discovery Survey',
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        title: 'What challenges are you currently facing in this area?',
        description: 'Select all that apply',
        options: ['Time management', 'Cost efficiency', 'Quality control', 'Team coordination', 'Other'],
        required: true
      },
      {
        id: '2',
        type: 'single-choice',
        title: 'How do you currently solve this problem?',
        options: ['Manual process', 'Existing software', 'Third-party service', 'Not solving it yet'],
        required: true
      },
      {
        id: '3',
        type: 'rating',
        title: 'How important is solving this problem for you?',
        description: 'Rate from 1 (not important) to 5 (extremely important)',
        required: true
      },
      {
        id: '4',
        type: 'single-choice',
        title: 'What would be the most valuable feature for you?',
        options: ['Automation', 'Real-time tracking', 'Team collaboration', 'Reporting & analytics', 'Integration'],
        required: true
      },
      {
        id: '5',
        type: 'single-choice',
        title: 'What is your budget range for this solution?',
        options: ['Under $50/month', '$50-150/month', '$150-500/month', 'Over $500/month'],
        required: false
      },
      {
        id: '6',
        type: 'single-choice',
        title: 'How soon would you need this solution?',
        options: ['Immediately', 'Within 1 month', 'Within 3 months', 'Within 6 months', 'No timeline'],
        required: false
      },
      {
        id: '7',
        type: 'open-text',
        title: 'Any additional feedback or specific requirements?',
        required: false
      }
    ]
  },
  'employee-satisfaction': {
    id: 'employee-satisfaction',
    title: 'Employee Satisfaction Survey',
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'How satisfied are you with your current role?',
        description: 'Rate from 1 (very dissatisfied) to 5 (very satisfied)',
        required: true
      },
      {
        id: '2',
        type: 'rating',
        title: 'How would you rate your work-life balance?',
        required: true
      },
      {
        id: '3',
        type: 'single-choice',
        title: 'Do you feel valued and recognized for your contributions?',
        options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
        required: true
      },
      {
        id: '4',
        type: 'rating',
        title: 'How satisfied are you with communication from management?',
        required: true
      },
      {
        id: '5',
        type: 'open-text',
        title: 'What would improve your job satisfaction?',
        required: false
      }
    ]
  },
  'market-analysis': {
    id: 'market-analysis',
    title: 'Market Analysis Survey',
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        title: 'Which products/services do you currently use in this category?',
        description: 'Select all that apply',
        options: ['Product A', 'Product B', 'Product C', 'Product D', 'None'],
        required: true
      },
      {
        id: '2',
        type: 'rating',
        title: 'How satisfied are you with your current solution?',
        required: true
      },
      {
        id: '3',
        type: 'single-choice',
        title: 'What is the most important factor when choosing a product in this category?',
        options: ['Price', 'Quality', 'Brand reputation', 'Features', 'Customer support'],
        required: true
      },
      {
        id: '4',
        type: 'single-choice',
        title: 'How often do you purchase products in this category?',
        options: ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'Rarely'],
        required: true
      },
      {
        id: '5',
        type: 'open-text',
        title: 'What features are missing from current market offerings?',
        required: false
      }
    ]
  },
  'exit-interview': {
    id: 'exit-interview', 
    title: 'Exit Interview Survey',
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'How satisfied were you with your overall experience working here?',
        required: true
      },
      {
        id: '2',
        type: 'single-choice',
        title: 'What is the primary reason for leaving?',
        options: ['Career advancement', 'Better compensation', 'Work-life balance', 'Management issues', 'Other'],
        required: true
      },
      {
        id: '3',
        type: 'rating',
        title: 'How would you rate your relationship with your direct supervisor?',
        required: true
      },
      {
        id: '4',
        type: 'open-text',
        title: 'What could the company have done to retain you?',
        required: false
      },
      {
        id: '5',
        type: 'single-choice',
        title: 'Would you recommend this company as a place to work?',
        options: ['Definitely yes', 'Probably yes', 'Neutral', 'Probably no', 'Definitely no'],
        required: true
      }
    ]
  },
  'product-feedback': {
    id: 'product-feedback',
    title: 'Product Feedback Survey', 
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'How would you rate the overall quality of our product?',
        required: true
      },
      {
        id: '2',
        type: 'multiple-choice',
        title: 'Which features do you use most frequently?',
        description: 'Select all that apply',
        options: ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Feature E'],
        required: true
      },
      {
        id: '3',
        type: 'single-choice',
        title: 'How easy is our product to use?',
        options: ['Very easy', 'Easy', 'Neutral', 'Difficult', 'Very difficult'],
        required: true
      },
      {
        id: '4',
        type: 'open-text',
        title: 'What new features would you like to see added?',
        required: false
      },
      {
        id: '5',
        type: 'rating',
        title: 'How likely are you to continue using our product?',
        required: true
      }
    ]
  },
  'patient-satisfaction': {
    id: 'patient-satisfaction',
    title: 'Patient Satisfaction Survey',
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'How would you rate your overall experience with our healthcare facility?',
        required: true
      },
      {
        id: '2',
        type: 'rating',
        title: 'How satisfied were you with the quality of care you received?',
        required: true
      },
      {
        id: '3',
        type: 'single-choice',
        title: 'How long did you wait to be seen?',
        options: ['Less than 15 minutes', '15-30 minutes', '30-60 minutes', 'More than 1 hour'],
        required: true
      },
      {
        id: '4',
        type: 'rating',
        title: 'How would you rate the courtesy and helpfulness of our staff?',
        required: true
      },
      {
        id: '5',
        type: 'open-text',
        title: 'Any additional comments or suggestions for improvement?',
        required: false
      }
    ]
  },
  'vendor-evaluation': {
    id: 'vendor-evaluation',
    title: 'Vendor Evaluation Survey',
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'How would you rate the overall quality of products/services provided?',
        required: true
      },
      {
        id: '2',
        type: 'rating',
        title: 'How satisfied are you with delivery times and reliability?',
        required: true
      },
      {
        id: '3',
        type: 'rating',
        title: 'How would you rate the vendor\'s communication and responsiveness?',
        required: true
      },
      {
        id: '4',
        type: 'single-choice',
        title: 'How competitive is the vendor\'s pricing?',
        options: ['Very competitive', 'Competitive', 'Average', 'Expensive', 'Very expensive'],
        required: true
      },
      {
        id: '5',
        type: 'open-text',
        title: 'What areas could the vendor improve?',
        required: false
      }
    ]
  },
  'course-evaluation': {
    id: 'course-evaluation',
    title: 'Course Evaluation Survey',
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'How would you rate the overall quality of this course?',
        required: true
      },
      {
        id: '2',
        type: 'rating',
        title: 'How clear and organized was the course content?',
        required: true
      },
      {
        id: '3',
        type: 'rating',
        title: 'How effective was the instructor in teaching the material?',
        required: true
      },
      {
        id: '4',
        type: 'single-choice',
        title: 'Was the course difficulty level appropriate?',
        options: ['Too easy', 'Slightly easy', 'Just right', 'Slightly difficult', 'Too difficult'],
        required: true
      },
      {
        id: '5',
        type: 'single-choice',
        title: 'Would you recommend this course to others?',
        options: ['Definitely yes', 'Probably yes', 'Neutral', 'Probably no', 'Definitely no'],
        required: true
      },
      {
        id: '6',
        type: 'open-text',
        title: 'What did you like most about this course?',
        required: false
      },
      {
        id: '7',
        type: 'open-text',
        title: 'What suggestions do you have for improving this course?',
        required: false
      }
    ]
  },
  'post-purchase': {
    id: 'post-purchase',
    title: 'Post-Purchase Survey',
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'How satisfied are you with your recent purchase?',
        required: true
      },
      {
        id: '2',
        type: 'rating',
        title: 'How would you rate the quality of the product?',
        required: true
      },
      {
        id: '3',
        type: 'single-choice',
        title: 'How was your checkout experience?',
        options: ['Excellent', 'Good', 'Average', 'Poor', 'Very poor'],
        required: true
      },
      {
        id: '4',
        type: 'rating',
        title: 'How satisfied were you with the delivery speed?',
        required: true
      },
      {
        id: '5',
        type: 'single-choice',
        title: 'How likely are you to shop with us again?',
        options: ['Very likely', 'Likely', 'Neutral', 'Unlikely', 'Very unlikely'],
        required: true
      },
      {
        id: '6',
        type: 'open-text',
        title: 'Any additional feedback or suggestions?',
        required: false
      }
    ]
  }
};

export const getTemplateById = (id: string): Template | null => {
  return templateData[id] || null;
};