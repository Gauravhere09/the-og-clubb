
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const SearchBar = ({ searchQuery, onSearchChange }: SearchBarProps) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-neutral-800">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          id="search-messages"
          name="search-messages"
          placeholder="Buscar o empezar un nuevo chat"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111] rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none border border-gray-200 dark:border-neutral-800"
        />
      </div>
    </div>
  );
};
