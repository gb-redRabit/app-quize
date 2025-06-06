export function getRandomUniqueQuestions(allQuestions, count) {
  const filtered = allQuestions.filter((q) => q.question);
  const shuffled = filtered
    .map((q) => ({ q, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ q }) => q);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
