export const syncUrlWithState = (searchParams, setSearchParams, query, filter, page) => {
  // Only update URL if values actually changed
  const currentQuery = searchParams.get("q") || "";
  const currentFilter = searchParams.get("filter") || "all";
  const currentPage = parseInt(searchParams.get("page")) || 1;

  if (query === currentQuery && filter === currentFilter && page === currentPage) {
    return;
  }

  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (filter && filter !== "all") params.set("filter", filter);
  if (page && page > 1) params.set("page", page.toString());
  setSearchParams(params);
};

export const getStateFromUrl = (searchParams) => {
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";
  const page = parseInt(searchParams.get("page")) || 1;
  const showResults = Boolean(query);
  return { query, filter, page, showResults };
};
