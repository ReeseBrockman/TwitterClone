import { FeedTitle } from "@/components/feed-title";
import { PageHeader } from "@/components/page-header";

function SkeletonPost() {
  return (
    <div className="animate-pulse border-b border-chirp-border px-5 py-4">
      <div className="flex gap-3">
        <div className="h-11 w-11 shrink-0 rounded-full bg-chirp-border" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-chirp-border" />
          <div className="h-3 w-full rounded bg-chirp-border" />
          <div className="h-3 w-4/5 rounded bg-chirp-border" />
        </div>
      </div>
    </div>
  );
}

export default function FollowingLoading() {
  return (
    <>
      <PageHeader
        title={<FeedTitle />}
        description="Posts from people you follow"
      />
      <SkeletonPost />
      <SkeletonPost />
      <SkeletonPost />
    </>
  );
}
