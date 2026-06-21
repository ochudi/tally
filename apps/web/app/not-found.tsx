import Link from "next/link";
import { FullPageMessage, primaryAction } from "../components/FullPageMessage";

// Custom 404 for any unmatched route (and notFound() calls).
export default function NotFound() {
  return (
    <FullPageMessage
      eyebrow="404"
      title="Page not found"
      body="That page does not exist. The sales are all on the home page."
    >
      <Link href="/" className={primaryAction}>
        Back to sales
      </Link>
    </FullPageMessage>
  );
}
