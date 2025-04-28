"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  CircleUserRound,
  CircleChevronDown,
  X,
  Loader2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { NAV_LINKS } from "@/constants";
import { Button } from "@/components/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/contexts/authContext";
import {
  fetchSuggestions,
  fetchSearchResults,
} from "@/lib/server-apis/search-api";
import { ISuggestion, ISearchResult, SearchPagination } from "@/types/search";
const Navbar = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();

  // Search related states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
  const [isLoading_suggestions, setIsLoading_suggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Search results modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState<ISearchResult[]>([]);
  const [searchPagination, setSearchPagination] =
    useState<SearchPagination | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const router = useRouter();
  const { scrollY } = useScroll();
  const lastYRef = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => {
    const difference = y - lastYRef.current;
    if (Math.abs(difference) > 50) {
      setIsHidden(difference > 0);
      lastYRef.current = y;
    }
    setIsScrolled(y > 10);
  });

  // Handle click outside search container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowSearchModal(false);
      }
    };

    if (showSearchModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchModal]);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestionsDebounced = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading_suggestions(true);
      try {
        const data = await fetchSuggestions(searchQuery);
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (error) {
        console.error("Search suggestion error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading_suggestions(false);
      }
    };

    // Debounce search requests
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        fetchSuggestionsDebounced();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchClick = () => {
    setIsSearchExpanded(true);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setShowSearchModal(false);
    searchInputRef.current?.focus();
  };

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoadingResults(true);
      try {
        const data = await fetchSearchResults(searchQuery.trim());
        if (data) {
          setSearchResults(data.results);
          setSearchPagination(data.pagination);
          setShowSearchModal(true);
        }
      } catch (error) {
        console.error("Search results error:", error);
      } finally {
        setIsLoadingResults(false);
      }
      setIsSearchExpanded(false);
      setShowSuggestions(false);
    }
  };

  const handleLoadMoreResults = async () => {
    if (searchPagination && searchPagination.page < searchPagination.pages) {
      setIsLoadingResults(true);
      try {
        const data = await fetchSearchResults(
          searchQuery.trim(),
          searchPagination.page + 1
        );
        if (data) {
          setSearchResults((prevResults) => [...prevResults, ...data.results]);
          setSearchPagination(data.pagination);
        }
      } catch (error) {
        console.error("Search results error:", error);
      } finally {
        setIsLoadingResults(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: ISuggestion) => {
    if (suggestion.type === "turf") {
      router.push(`/venues/${suggestion._id}`);
    } else {
      router.push(`/organizations/${suggestion._id}`);
    }
    setIsSearchExpanded(false);
    setShowSuggestions(false);
  };

  const handleCloseModal = () => {
    setShowSearchModal(false);
  };

  let userContent;

  if (isLoading) {
    userContent = (
      <span className="text-lg text-gray-700">Loading User...</span>
    );
  } else if (user) {
    userContent = (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 text-lg text-gray-700 hover:text-green-700"
        >
          <CircleUserRound className="w-8 h-8 text-gray-500" />
          {user.first_name} {user.last_name}
          <CircleChevronDown className="w-4 h-4" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white border border-gray-200">
            <Link
              href="/profile"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              View Profile
            </Link>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    );
  } else {
    userContent = (
      <Button
        href="/sign-in"
        variant="default"
        className="hidden lg:inline-flex px-7"
      >
        Sign In
      </Button>
    );
  }

  return (
    <>
      <motion.div
        animate={isHidden ? "hidden" : "visible"}
        whileHover="visible"
        onFocusCapture={() => setIsHidden(false)}
        variants={{
          hidden: { y: "-90%" },
          visible: { y: "0%" },
        }}
        transition={{ duration: 0.2 }}
        className={`fixed top-1 z-10 w-full mx-2 ${
          isScrolled ? "border border-gray-400 rounded-3xl" : ""
        } bg-white`}
      >
        <nav className="mx-auto flex items-center justify-between rounded-3xl bg-white p-4">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-2xl font-bold">
              TurfMania
            </Link>
            <div className="hidden space-x-4 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="relative px-3 py-1 text-lg text-gray-700 transition-colors duration-300 hover:text-green-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div ref={searchContainerRef} className="relative hidden lg:block">
              <motion.div
                animate={isSearchExpanded ? "expanded" : "collapsed"}
                variants={{
                  expanded: { width: "300px" },
                  collapsed: { width: "40px" },
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center"
              >
                <form onSubmit={handleSearchSubmit} className="w-full">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search turf, organization, sport..."
                    className={`w-full rounded-full border-gray-300 pl-10 pr-8 focus:border-black transition-opacity ${
                      isSearchExpanded ? "opacity-100" : "opacity-0"
                    }`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      setShowSuggestions(searchQuery.trim().length >= 2)
                    }
                  />
                </form>
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-400"
                  onClick={handleSearchClick}
                />
                {isSearchExpanded && searchQuery && (
                  <X
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-400 hover:text-gray-600"
                    size={16}
                    onClick={handleSearchClear}
                  />
                )}

                {/* Search suggestions dropdown */}
                {isSearchExpanded && showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg z-20">
                    {isLoading_suggestions ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div>
                        {suggestions.map((suggestion) => (
                          <div
                            key={`${suggestion.type}-${suggestion._id}`}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <div className="font-medium">{suggestion.name}</div>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="mr-2 rounded bg-gray-100 px-1 py-0.5 text-gray-700">
                                {suggestion.type === "turf"
                                  ? "Turf"
                                  : "Organization"}
                              </span>
                              {suggestion.location && (
                                <span>{suggestion.location}</span>
                              )}
                              {suggestion.sport && (
                                <span className="ml-2 rounded bg-green-100 px-1 py-0.5 text-green-700">
                                  {suggestion.sport}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 p-2">
                          <button
                            onClick={handleSearchSubmit}
                            className="text-sm text-green-600 hover:text-green-700 w-full text-center"
                          >
                            See all results for &quot;{searchQuery}&quot;
                          </button>
                        </div>
                      </div>
                    ) : searchQuery.trim().length >= 2 ? (
                      <div className="p-4 text-center text-gray-500">
                        No results found for &quot;{searchQuery}&quot;
                      </div>
                    ) : null}
                  </div>
                )}
              </motion.div>
            </div>
            {userContent}
            <Sheet>
              <SheetTrigger asChild>
                <Button className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Search for turfs and more</SheetDescription>
                </SheetHeader>
                {/* Mobile search */}
                <div className="mt-4 mb-6 px-4">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search..."
                        className="w-full pr-8 pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() =>
                          setShowSuggestions(searchQuery.trim().length >= 2)
                        }
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" />
                      {searchQuery && (
                        <X
                          className="absolute right-3 top-1/2 -translate-y-1/2 transform cursor-pointer text-gray-400"
                          size={16}
                          onClick={handleSearchClear}
                        />
                      )}

                      {/* Mobile search suggestions dropdown */}
                      {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg z-20">
                          {isLoading_suggestions ? (
                            <div className="p-4 text-center text-gray-500">
                              Loading...
                            </div>
                          ) : suggestions.length > 0 ? (
                            <div>
                              {suggestions.map((suggestion) => (
                                <div
                                  key={`${suggestion.type}-${suggestion._id}`}
                                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                                  onClick={() =>
                                    handleSuggestionClick(suggestion)
                                  }
                                >
                                  <div className="font-medium">
                                    {suggestion.name}
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <span className="mr-2 rounded bg-gray-100 px-1 py-0.5 text-gray-700">
                                      {suggestion.type === "turf"
                                        ? "Turf"
                                        : "Organization"}
                                    </span>
                                    {suggestion.location && (
                                      <span>{suggestion.location}</span>
                                    )}
                                    {suggestion.sport && (
                                      <span className="ml-2 rounded bg-green-100 px-1 py-0.5 text-green-700">
                                        {suggestion.sport}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <div className="border-t border-gray-100 p-2">
                                <button
                                  onClick={handleSearchSubmit}
                                  className="text-sm text-green-600 hover:text-green-700 w-full text-center"
                                >
                                  See all results for &quot;{searchQuery}&quot;
                                </button>
                              </div>
                            </div>
                          ) : searchQuery.trim().length >= 2 ? (
                            <div className="p-4 text-center text-gray-500">
                              No results found for &quote;{searchQuery}&quote;
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </form>
                </div>
                {/* Navigation links - moved outside SheetDescription */}
                <div className="flex flex-col space-y-4 px-4">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.key}
                      href={link.href}
                      className="text-lg text-gray-700 transition-colors duration-300 hover:text-green-700"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!user && (
                    <Button
                      href="/sign-in"
                      variant="default"
                      className="w-full"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </motion.div>

      {/* Search Results Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative mx-4 max-w-4xl w-full max-h-[80vh] bg-white rounded-xl shadow-xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Search Results</h3>
                  <p className="text-sm text-gray-500">
                    {searchPagination?.total || 0} results for &quote;
                    {searchQuery}&quote;
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {isLoadingResults ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
                    <p className="text-gray-500">Loading search results...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No results found</p>
                    <p className="text-gray-400 mt-2">
                      Try different keywords or filters
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {searchResults.map((result) => (
                      <div
                        key={result._id}
                        className="flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="w-1/3 h-32 bg-gray-100 relative">
                          {result.images && result.images.length > 0 ? (
                            <Image
                              src={result.images[0]}
                              alt={result.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="w-2/3 p-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 line-clamp-1">
                              {result.name}
                            </h4>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="line-clamp-1">
                                {result.organization.location.address ||
                                  result.organization.location.city}
                              </span>
                            </div>
                            {result.sports && result.sports.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.sports.slice(0, 2).map((sport) => (
                                  <span
                                    key={sport}
                                    className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded"
                                  >
                                    {sport}
                                  </span>
                                ))}
                                {result.sports.length > 2 && (
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                                    +{result.sports.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            {result.basePrice && (
                              <div className="text-green-700 font-medium">
                                ${result.basePrice}/hr
                              </div>
                            )}
                            <Link href={`/venues/${result._id}`} passHref>
                              <button className="text-xs flex items-center text-blue-600 hover:text-blue-800">
                                View <ExternalLink className="h-3 w-3 ml-1" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-center items-center">
                {searchPagination &&
                searchPagination.page < searchPagination.pages ? (
                  <button
                    onClick={handleLoadMoreResults}
                    className="text-green-600 hover:text-green-700 font-medium flex items-center"
                    disabled={isLoadingResults}
                  >
                    {isLoadingResults ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Load more"
                    )}
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
