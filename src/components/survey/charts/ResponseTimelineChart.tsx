import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Apply Highcharts license key if available
if (process.env.HIGHCHARTS_LICENSE_KEY) {
  Highcharts.setOptions({
    credits: {
      enabled: false
    }
  });
}

interface TimelineData {
  date: string;
  responses: number;
}

interface ResponseTimelineChartProps {
  timelineData: TimelineData[];
}

export const ResponseTimelineChart: React.FC<ResponseTimelineChartProps> = ({ timelineData }) => {
  const getTimelineOptions = () => ({
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'inherit'
      }
    },
    title: {
      text: 'Response Timeline (Last 14 Days)'
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: 'Number of Responses'
      },
      allowDecimals: false,
      min: 0
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          radius: 5
        },
        color: 'hsl(var(--primary))'
      }
    },
    series: [{
      name: 'Daily Responses',
      data: timelineData.map(item => [
        new Date(item.date).getTime(),
        item.responses
      ]),
      showInLegend: false
    }],
    tooltip: {
      formatter: function() {
        return `<b>${Highcharts.dateFormat('%A, %b %e, %Y', this.x)}</b><br/>
                Responses: ${this.y}`;
      }
    },
    credits: { enabled: false },
    accessibility: {
      enabled: true,
      description: 'Line chart showing daily response counts over the last 14 days'
    }
  });

  if (timelineData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No timeline data available
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6">
      <HighchartsReact 
        highcharts={Highcharts} 
        options={getTimelineOptions()} 
      />
    </div>
  );
};