export const conversationTitleLimit = 120;

export function titleFromQuestion(question: string) {
  const text = question.trim().replace(/\s+/g, " ");
  if (text.length <= conversationTitleLimit) return text;

  const cut = conversationTitleLimit - 1;
  const prefix = text.slice(0, cut).replace(/[\uD800-\uDBFF]$/u, "");
  const wordEnd = text[cut] === " " ? prefix.trimEnd() : prefix.replace(/ \S*$/u, "");
  return `${wordEnd || prefix}…`;
}

export function conversationTitle(saved: string | null | undefined, firstQuestion: string) {
  // Earlier auto-titles were stored as a raw 90-character slice of the first question.
  const oldAutoTitle = firstQuestion.length > 90 && saved === firstQuestion.slice(0, 90);
  return (oldAutoTitle ? "" : saved?.trim()) || titleFromQuestion(firstQuestion) || "Investigation";
}
