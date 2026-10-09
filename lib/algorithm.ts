import { Category, InteractionType, Post, ScoredPost, UserInterests } from "../types";

export const INTERACTION_WEIGHTS: Record<InteractionType, number> = { view: 1, watch: 3, like: 5, save: 8, share: 10, comment: 7, ignore: -8 };
export const SCORE_WEIGHTS = { interest: 0.45, behavior: 0.15, recency: 0.15, popularity: 0.1, engagement: 0.1, exploration: 0.05 } as const;
export type SignalsByPost = Record<string, InteractionType[]>;

export function signalWeight(type: InteractionType, previousCount = 0): number {
  return Number((INTERACTION_WEIGHTS[type] * Math.pow(0.65, previousCount)).toFixed(2));
}

export function registerInteraction(interests: UserInterests, post: Post, type: InteractionType, previousCount = 0, direction: 1 | -1 = 1): UserInterests {
  const next = { ...interests };
  next[post.category] = Math.max(0, Math.min(100, next[post.category] + signalWeight(type, previousCount) * direction));
  return next;
}

export function calculatePostScore(post: Post, interests: UserInterests, signals: SignalsByPost = {}): ScoredPost {
  const history = signals[post.id] || [];
  const rawBehavior = history.reduce((total, type, index) => total + signalWeight(type, index), 0);
  const behavior = Math.max(0, Math.min(100, 50 + rawBehavior * 2.5));
  const breakdown = { interest: interests[post.category], behavior, recency: post.recency, popularity: post.popularity, engagement: post.engagement };
  const score = breakdown.interest * SCORE_WEIGHTS.interest + breakdown.behavior * SCORE_WEIGHTS.behavior + breakdown.recency * SCORE_WEIGHTS.recency + breakdown.popularity * SCORE_WEIGHTS.popularity + breakdown.engagement * SCORE_WEIGHTS.engagement + post.recency * SCORE_WEIGHTS.exploration;
  const reasons = [
    `interesse em ${post.category}: ${breakdown.interest}/100`,
    history.length ? `seus sinais neste post: ${history.join(", ")}` : "há espaço para explorar um tema novo",
    `conteúdo ${post.format} com ${post.duration} min`,
  ];
  return { ...post, score, breakdown, reasons };
}

export function calculateFeed(posts: Post[], interests: UserInterests, signals: SignalsByPost = {}): ScoredPost[] {
  const ranked = posts.map((post) => calculatePostScore(post, interests, signals)).sort((a, b) => b.score - a.score);
  const categoryCount: Partial<Record<Category, number>> = {};
  const remaining = [...ranked];
  const feed: ScoredPost[] = [];
  while (remaining.length) {
    let bestIndex = 0;
    remaining.forEach((candidate, index) => {
      const candidateValue = candidate.score - (categoryCount[candidate.category] || 0) * 1.5;
      const bestValue = remaining[bestIndex].score - (categoryCount[remaining[bestIndex].category] || 0) * 1.5;
      if (candidateValue > bestValue) bestIndex = index;
    });
    const [next] = remaining.splice(bestIndex, 1);
    categoryCount[next.category] = (categoryCount[next.category] || 0) + 1;
    feed.push(next);
  }
  return feed;
}

export function categoryColor(category: Category): string {
  return { "Programação": "#6657e8", "Tecnologia": "#159c91", "Jogos": "#e36888", "Futebol": "#3b9b68", "Música": "#d9943a", "Ciência": "#5572ce", "Entretenimento": "#b05aa5" }[category];
}
