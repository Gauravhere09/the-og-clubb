
import { Navigation } from "@/components/Navigation";
import { PostCreator } from "@/components/PostCreator";
import { Feed } from "@/components/Feed";

const Index = () => {
  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 md:py-8 pb-20 md:pb-8">
        <h1 className="text-2xl font-semibold mb-6">Feed</h1>
        <div className="space-y-6">
          <PostCreator />
          <Feed />
        </div>
      </main>
    </div>
  );
};

export default Index;
