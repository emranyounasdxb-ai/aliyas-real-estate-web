import { redirect } from 'next/navigation';
import type { Article } from '@/lib/content';

export function PlannedArticle({ article }: { article: Article }) {
  void article;
  redirect('/journal');
}
