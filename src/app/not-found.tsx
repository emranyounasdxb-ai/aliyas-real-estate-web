import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export default function NotFound() {
  return (
    <section className="not-found">
      <span className="eyebrow">A DIFFERENT DIRECTION</span>
      <h1>This address wasn’t found.</h1>
      <p>There are still plenty of extraordinary places to discover.</p>
      <Link className="button button-dark" href="/projects">
        Explore the collection <ArrowUpRight size={18} />
      </Link>
    </section>
  );
}
