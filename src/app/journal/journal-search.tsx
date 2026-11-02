'use client';

import { useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from '@/components/brand-icons';
import { journalHref } from '@/lib/journal-pagination';
import styles from './journal.module.css';

export function JournalSearch({ query, topic }: { query: string; topic: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get('q') ?? '')
      .trim()
      .slice(0, 120);
    startTransition(() => router.push(journalHref({ q, topic })));
  }
  return (
    <form
      role="search"
      aria-label="Journal search"
      action="/journal#journal-stories"
      method="get"
      onSubmit={search}
      className={styles.search}
      aria-busy={pending}
    >
      <label className={styles.srOnly} htmlFor="journal-search">
        Search articles
      </label>
      <Search size={20} />
      <input
        id="journal-search"
        name="q"
        type="search"
        placeholder="Find a story…"
        defaultValue={query}
        maxLength={120}
      />
      {topic && <input type="hidden" name="topic" value={topic} />}
      {query && (
        <Link
          href={journalHref({ topic })}
          className={styles.clearSearch}
          aria-label="Clear search"
        >
          <X size={18} />
        </Link>
      )}
      <button type="submit" disabled={pending}>
        {pending ? 'Finding…' : 'Search'}
      </button>
    </form>
  );
}
