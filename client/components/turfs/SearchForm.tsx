import { Search } from "lucide-react";
import { Button } from "@/components/Button";


export const SearchForm = () => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
      <form
        className="flex flex-col sm:flex-row gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search for turfs near you..."
            className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
          />
        </div>
        <Button variant="default" className="rounded-lg">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>
    </div>
  );
};
