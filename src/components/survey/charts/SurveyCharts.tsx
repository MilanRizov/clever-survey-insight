import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsAccessibility from 'highcharts/modules/accessibility';

// Enable additional modules for better charts
require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/accessibility')(Highcharts);

// Apply Highcharts license key if available
if (process.env.HIGHCHARTS_LICENSE_KEY) {
  Highcharts.setOptions({
    credits: {
      enabled: false
    }
  });
}

interface ChartData {
  name: string;
  value: number;
  percentage: number;
}

interface TopicAnalysis {
  topic: string;
  count: number;
  responses: {
    text: string;
    responseId: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
}

interface SurveyChartsProps {
  questionType: string;
  questionTitle: string;
  chartData: ChartData[];
  topicAnalysis?: TopicAnalysis[];
}

export const SurveyCharts: React.FC<SurveyChartsProps> = ({
  questionType,
  questionTitle,
  chartData,
  topicAnalysis
}) => {
  // Bar chart for multiple choice questions
  const getBarChartOptions = () => ({
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'inherit'
      }
    },
    title: {
      text: null
    },
    xAxis: {
      categories: chartData.map(item => item.name),
      title: {
        text: 'Response Options'
      }
    },
    yAxis: {
      title: {
        text: 'Number of Responses'
      },
      allowDecimals: false
    },
    plotOptions: {
      column: {
        colorByPoint: true,
        colors: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']
      }
    },
    series: [{
      name: 'Responses',
      data: chartData.map(item => ({
        name: item.name,
        y: item.value,
        custom: {
          percentage: item.percentage
        }
      })),
      showInLegend: false
    }],
    tooltip: {
      formatter: function() {
        return `<b>${this.point.name}</b><br/>
                Responses: ${this.y}<br/>
                Percentage: ${this.point.options.custom?.percentage || 0}%`;
      }
    },
    credits: { enabled: false },
    accessibility: {
      enabled: true,
      description: `Bar chart showing response distribution for: ${questionTitle}`
    }
  });

  // Pie chart for better visualization of proportions
  const getPieChartOptions = () => ({
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'inherit'
      }
    },
    title: {
      text: null
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%'
        },
        colors: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']
      }
    },
    series: [{
      name: 'Responses',
      data: chartData.map(item => ({
        name: item.name,
        y: item.value
      }))
    }],
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)'
    },
    credits: { enabled: false },
    accessibility: {
      enabled: true,
      description: `Pie chart showing response distribution for: ${questionTitle}`
    }
  });

  // Sentiment analysis chart for topic analysis
  const getSentimentChartOptions = () => {
    if (!topicAnalysis || topicAnalysis.length === 0) return null;

    const sentimentData: { [key: string]: { positive: number; neutral: number; negative: number } } = {};
    
    topicAnalysis.forEach(topic => {
      sentimentData[topic.topic] = { positive: 0, neutral: 0, negative: 0 };
      topic.responses.forEach(response => {
        sentimentData[topic.topic][response.sentiment]++;
      });
    });

    const categories = Object.keys(sentimentData);
    
    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'inherit'
        }
      },
      title: {
        text: 'Sentiment Analysis by Topic'
      },
      xAxis: {
        categories: categories,
        title: {
          text: 'Topics'
        }
      },
      yAxis: {
        title: {
          text: 'Number of Responses'
        },
        allowDecimals: false,
        stackLabels: {
          enabled: true
        }
      },
      plotOptions: {
        column: {
          stacking: 'normal'
        }
      },
      series: [
        {
          name: 'Positive',
          data: categories.map(topic => sentimentData[topic].positive),
          color: '#22c55e'
        },
        {
          name: 'Neutral',
          data: categories.map(topic => sentimentData[topic].neutral),
          color: '#eab308'
        },
        {
          name: 'Negative',
          data: categories.map(topic => sentimentData[topic].negative),
          color: '#ef4444'
        }
      ],
      tooltip: {
        headerFormat: '<b>Topic: {point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },
      credits: { enabled: false },
      accessibility: {
        enabled: true,
        description: `Stacked column chart showing sentiment distribution across topics for: ${questionTitle}`
      }
    };
  };

  // Topic frequency chart
  const getTopicFrequencyOptions = () => {
    if (!topicAnalysis || topicAnalysis.length === 0) return null;

    return {
      chart: {
        type: 'bar',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'inherit'
        }
      },
      title: {
        text: 'Topic Frequency'
      },
      xAxis: {
        categories: topicAnalysis.map(topic => topic.topic),
        title: {
          text: null
        }
      },
      yAxis: {
        title: {
          text: 'Number of Responses'
        },
        allowDecimals: false
      },
      plotOptions: {
        bar: {
          colorByPoint: true,
          colors: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d']
        }
      },
      series: [{
        name: 'Topic Frequency',
        data: topicAnalysis.map(topic => ({
          name: topic.topic,
          y: topic.count
        })),
        showInLegend: false
      }],
      tooltip: {
        pointFormat: 'Responses: <b>{point.y}</b>'
      },
      credits: { enabled: false },
      accessibility: {
        enabled: true,
        description: `Horizontal bar chart showing topic frequency for: ${questionTitle}`
      }
    };
  };

  if (questionType === 'open-text') {
    return (
      <div className="space-y-6">
        {topicAnalysis && topicAnalysis.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-card rounded-lg p-4">
                <HighchartsReact 
                  highcharts={Highcharts} 
                  options={getTopicFrequencyOptions()} 
                />
              </div>
              <div className="bg-card rounded-lg p-4">
                <HighchartsReact 
                  highcharts={Highcharts} 
                  options={getSentimentChartOptions()} 
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No responses yet for this question
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-card rounded-lg p-4">
        <h4 className="text-sm font-medium mb-4 text-center">Response Distribution (Bar Chart)</h4>
        <HighchartsReact 
          highcharts={Highcharts} 
          options={getBarChartOptions()} 
        />
      </div>
      <div className="bg-card rounded-lg p-4">
        <h4 className="text-sm font-medium mb-4 text-center">Response Distribution (Pie Chart)</h4>
        <HighchartsReact 
          highcharts={Highcharts} 
          options={getPieChartOptions()} 
        />
      </div>
    </div>
  );
};