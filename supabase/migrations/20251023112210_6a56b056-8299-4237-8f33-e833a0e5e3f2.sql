-- Clear cached analysis for survey to force regeneration with new prompt
DELETE FROM survey_topic_analysis 
WHERE survey_id = '3695da01-7b0e-4c91-9cf1-0609a087e04b';