export type Platform =
  | "linkedin"
  | "twitter"
  | "instagram"
  | "facebook"
  | "threads"
  | "pinterest";

export interface PostDraft {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  status: "draft" | "scheduled" | "published";
  scheduledDate?: Date;
  media: string[];
}
