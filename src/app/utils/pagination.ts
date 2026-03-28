export const paginate = <T>(data: T[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = data.slice(startIndex, endIndex);
  const total = data.length;
  const pages = Math.ceil(total / limit);
  
  return {
    data: results,
    total,
    page,
    limit,
    pages
  };
};
