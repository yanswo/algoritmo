export const CATEGORIES = ["Programação", "Tecnologia", "Jogos", "Futebol", "Música", "Ciência", "Entretenimento"] as const;
export type Category = (typeof CATEGORIES)[number];
export type InteractionType = "view" | "watch" | "like" | "save" | "share" | "comment" | "ignore";

export type Post = {
  id: string;
  title: string;
  description: string;
  category: Category;
  author: string;
  initials: string;
  gradient: string;
  icon: string;
  recency: number;
  popularity: number;
  engagement: number;
  format: "vídeo" | "carrossel" | "texto";
  duration: number;
  tags: string[];
};

export type UserInterests = Record<Category, number>;
export type Interaction = { postId: string; type: InteractionType; at: number };
export type ScoredPost = Post & {
  score: number;
  breakdown: { interest: number; behavior: number; recency: number; popularity: number; engagement: number };
  reasons: string[];
};
