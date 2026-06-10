export const calculateEqualMarks = (totalMarks, numberOfQuestions) => {
  const total = Number(totalMarks);
  const count = Number(numberOfQuestions);

  if (!Number.isFinite(total) || !Number.isInteger(total) || total <= 0) {
    return null;
  }

  if (!Number.isFinite(count) || !Number.isInteger(count) || count <= 0) {
    return null;
  }

  if (total % count !== 0) {
    return null;
  }

  return total / count;
};

export const formatMarks = (value) => {
  const marks = Number(value);

  if (!Number.isFinite(marks)) {
    return '0';
  }

  return Number.isInteger(marks) ? String(marks) : marks.toFixed(2);
};
