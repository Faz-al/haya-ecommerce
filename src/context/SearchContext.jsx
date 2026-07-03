import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const value = useMemo(
    () => ({
      isSearchOpen,
      openSearch: () => setIsSearchOpen(true),
      closeSearch: () => setIsSearchOpen(false),
    }),
    [isSearchOpen]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used inside SearchProvider");
  }

  return context;
}