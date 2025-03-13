import React from 'react';
import { Box, Typography } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

// New subcomponent for overall performance message
const OverallPerformanceMessage = ({
  score,
  prevBestRawBeforeUpdate,
  prevBestAttemptBeforeUpdate
}) => {
  const currentRaw = score;
  const oldBest = prevBestRawBeforeUpdate !== null ? prevBestRawBeforeUpdate : currentRaw;

  if (oldBest === 0 && currentRaw > 0) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1">
          This is your first recorded score.
        </Typography>
      </Box>
    );
  } else if (currentRaw > oldBest) {
    const improvementPercent = Math.round(((currentRaw - oldBest) / oldBest) * 100);
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1">
          Previously you got {oldBest} out of {prevBestAttemptBeforeUpdate || currentRaw} correct.
        </Typography>
        <Typography variant="subtitle2" color="primary">
          Your score improved by {improvementPercent}% based on your last raw score.
        </Typography>
      </Box>
    );
  } else if (currentRaw === oldBest) {
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1">
          Your best performance so far was {oldBest} correct answers (on {prevBestAttemptBeforeUpdate || currentRaw} questions).
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          You got the same raw score as your previous best.
        </Typography>
      </Box>
    );
  } else {
    const decreasePercent = Math.round(((oldBest - currentRaw) / oldBest) * 100);
    return (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1">
          Your best performance so far was {oldBest} correct answers (on {prevBestAttemptBeforeUpdate || currentRaw} questions).
        </Typography>
        <Typography variant="subtitle2" color="secondary">
          Your score decreased by {decreasePercent}% based on your last raw score.
        </Typography>
      </Box>
    );
  }
};

const PerformanceBreakdown = ({
  flashcards,
  userAnswers,
  topicColors,
  category,
  score,
  prevBestRawBeforeUpdate,      
  prevBestAttemptBeforeUpdate
}) => {
  // Use Object.keys for determining if userAnswers has any content
  const hasUserAnswers = Object.keys(userAnswers).length > 0;
  
  const topicBreakdown =
    category === 'Random' &&
    flashcards.length > 0 &&
    hasUserAnswers && (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          Topic Breakdown:
        </Typography>
        {['Events', 'People', 'Procedures', 'Quality'].map((topic) => {
          const topicQuestions = flashcards.filter((q) => q.category === topic);
          if (topicQuestions.length === 0) return null;
          const topicCorrect = flashcards.reduce((acc, q) => {
            if (q.category === topic) {
              let corr = false;
              if (userAnswers[q.id]) {
                if (q.correct_order.length > 0) {
                  corr = JSON.stringify(userAnswers[q.id]) === JSON.stringify(q.correct_order);
                } else if (q.pairs.length > 0) {
                  corr = q.pairs.every((pair) =>
                    userAnswers[q.id].some(
                      (answer) => answer.term === pair.term && answer.definition === pair.definition
                    )
                  );
                } else {
                  corr =
                    q.ans.every((ans) => userAnswers[q.id].includes(ans)) &&
                    userAnswers[q.id].length === q.ans.length;
                }
              }
              return acc + (corr ? 1 : 0);
            }
            return acc;
          }, 0);
          const percentage = topicQuestions.length > 0 ? Math.round((topicCorrect / topicQuestions.length) * 100) : 0;
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
                width: '100%',
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

  const detailedBreakdown = flashcards.map((q) => {
    let correct = false;
    const userAnswer = userAnswers[q.id] || [];
    if (userAnswer.length) {
      if (q.correct_order.length > 0) {
        correct = arraysEqual(userAnswer, q.correct_order);
      } else if (q.pairs.length > 0) {
        correct = q.pairs.every((pair) =>
          userAnswer.some(
            (answer) => answer.term === pair.term && answer.definition === pair.definition
          )
        );
      } else {
        correct = arraysEqual(userAnswer, q.ans);
      }
    }
    return (
      <Box key={q.id} sx={{ mt: 2, p: 1, border: '1px solid #eee', borderRadius: '4px' }}>
        <Typography variant="subtitle1">
          <strong>Question:</strong> {q.question}
        </Typography>
        {q.image_link && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
            <img src={q.image_link} alt={`Question ${q.id}`} style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </Box>
        )}
        <Typography variant="body2" color={correct ? 'green' : 'red'}>
          {correct ? 'Correct' : 'Incorrect'}
        </Typography>
        <Typography variant="body2">
          <strong>Your answer:</strong>{' '}
          {userAnswer.length
            ? q.type === 'matching'
              ? userAnswer.map((answer) => `${answer.term}: ${answer.definition}`).join('; ')
              : userAnswer.join(', ')
            : 'No answer provided'}
        </Typography>
        {!correct && (
          <>
            <Typography variant="body2">
              <strong>Correct answer:</strong>{' '}
              {q.type === 'matching'
                ? q.pairs.map((pair) => `${pair.term}: ${pair.definition}`).join('; ')
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
      <OverallPerformanceMessage
        score={score}
        flashcardsLength={flashcards.length}
        prevBestRawBeforeUpdate={prevBestRawBeforeUpdate}
        prevBestAttemptBeforeUpdate={prevBestAttemptBeforeUpdate}
      />
      <Typography variant="h6" sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
        Detailed Breakdown:
      </Typography>
      {detailedBreakdown}
    </Box>
  );
};

const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};

export default PerformanceBreakdown;