//// filepath: /c:/Users/kalvi/OneDrive/Desktop/Main/src/components/PerformanceBreakdown.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

const PerformanceBreakdown = ({ flashcards, userAnswers, topicColors, category, score, bestScore, bestAttemptCount }) => {
  // Render the topic breakdown section (only for random quizzes)
  const topicBreakdown =
    category === 'Random' && flashcards.length > 0 && userAnswers.length > 0 && (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          Topic Breakdown:
        </Typography>
        {['Events', 'People', 'Procedures', 'Quality'].map((topic) => {
          const topicQuestions = flashcards.filter(q => q.category === topic);
          if (topicQuestions.length === 0) return null;
          const topicCorrect = flashcards.reduce((acc, q, i) => {
            if (q.category === topic) {
              let corr = false;
              if (userAnswers[i]) {
                if (q.correct_order.length > 0) {
                  corr = JSON.stringify(userAnswers[i]) === JSON.stringify(q.correct_order);
                } else if (q.pairs.length > 0) {
                  corr = q.pairs.every(pair =>
                    userAnswers[i].some(answer => answer.term === pair.term && answer.definition === pair.definition)
                  );
                } else {
                  corr =
                    q.ans.every(ans => userAnswers[i].includes(ans)) &&
                    userAnswers[i].length === q.ans.length;
                }
              }
              return acc + (corr ? 1 : 0);
            }
            return acc;
          }, 0);
          const percentage = topicQuestions.length > 0 ? Math.round((topicCorrect / topicQuestions.length) * 100) : 0;
          // Change gauge color for Events to red, otherwise use the provided topicColor.
          const topicColor = topic === 'Events' ? '#FF0000' : topicColors[topic];
          return (
            <Box
              key={topic}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 2,
                height: '100px',
                width: '100%', // ensures full container width for centering
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  minWidth: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center',
                }}
              >
                {topic} ({topicQuestions.length} questions)
              </Typography>
              <Box
                sx={{
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Gauge
                  value={percentage}
                  startAngle={-110}
                  endAngle={110}
                  sx={{
                    [`& .${gaugeClasses.valueText}`]: {
                      fontSize: 20,
                      transform: 'translate(0px, 0px)',
                      color: topicColor,
                    },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: topicColor,
                    },
                    [`& .${gaugeClasses.referenceArc}`]: {
                      fill: '#ddd',
                    },
                  }}
                  style={{ width: '100px', height: '100px' }}
                  text={({ value }) => `${value}%`}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    );

  // Render the detailed breakdown for each flashcard.
  const detailedBreakdown = flashcards.map((q, i) => {
    let correct = false;
    if (userAnswers[i]) {
      if (q.correct_order.length > 0) {
        correct = JSON.stringify(userAnswers[i]) === JSON.stringify(q.correct_order);
      } else if (q.pairs.length > 0) {
        correct = q.pairs.every(pair =>
          userAnswers[i].some(answer => answer.term === pair.term && answer.definition === pair.definition)
        );
      } else {
        correct =
          q.ans.every(answer => userAnswers[i].includes(answer)) &&
          userAnswers[i].length === q.ans.length;
      }
    }
    return (
      <Box key={i} sx={{ mt: 2, p: 1, border: '1px solid #eee', borderRadius: '4px' }}>
        <Typography variant="subtitle1">
          <strong>Question {i + 1}:</strong> {q.question}
        </Typography>
        {q.image_link && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <img
              src={q.image_link}
              alt={`Question ${i + 1}`}
              style={{ maxWidth: '100%', maxHeight: '200px' }}
            />
          </Box>
        )}
        <Typography variant="body2" color={correct ? 'green' : 'red'}>
          {correct ? 'Correct' : 'Incorrect'}
        </Typography>
        <Typography variant="body2">
          <strong>Your answer:</strong>{' '}
          {userAnswers[i]
            ? q.type === 'matching'
              ? userAnswers[i].map(answer => `${answer.term}: ${answer.definition}`).join('; ')
              : userAnswers[i].join(', ')
            : 'No answer provided'}
        </Typography>
        {!correct && (
          <>
            <Typography variant="body2">
              <strong>Correct answer:</strong>{' '}
              {q.type === 'matching'
                ? q.pairs.map(pair => `${pair.term}: ${pair.definition}`).join('; ')
                : q.type === 'sorting'
                  ? q.correct_order.join(', ')
                  : q.ans.join(', ')}
            </Typography>
            {q.reasoning && (
              <Typography variant="body2">
                <strong>Explanation:</strong> {q.reasoning}
              </Typography>
            )}
          </>
        )}
      </Box>
    );
  });

  return (
    <Box sx={{ width: '100%', mt: 3, p: 2, borderTop: '1px solid #ccc' }}>
      {topicBreakdown}
      <Typography variant="h6" sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
        Detailed Breakdown:
      </Typography>
      {detailedBreakdown}
    </Box>
  );
};

export default PerformanceBreakdown;