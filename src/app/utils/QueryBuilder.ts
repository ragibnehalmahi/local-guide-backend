// utils/QueryBuilder.ts
import { Query } from "mongoose";

export class QueryBuilder<T> {
  private modelQuery: Query<T[], T>;
  private query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // Search functionality
  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(field => ({
          [field]: { $regex: searchTerm, $options: "i" }
        }))
      });
    }
    return this;
  }

  // Filter functionality
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];
    excludeFields.forEach(field => delete queryObj[field]);

    // Handle price range
    if (queryObj.minPrice || queryObj.maxPrice) {
      const priceFilter: any = {};
      if (queryObj.minPrice) {
        priceFilter.$gte = Number(queryObj.minPrice);
        delete queryObj.minPrice;
      }
      if (queryObj.maxPrice) {
        priceFilter.$lte = Number(queryObj.maxPrice);
        delete queryObj.maxPrice;
      }
      queryObj.price = priceFilter;
    }

    // Handle language filter
    if (queryObj.language) {
      queryObj.languages = { $in: [queryObj.language] };
      delete queryObj.language;
    }

    // Handle city filter
    if (queryObj.city) {
      queryObj["location.city"] = { $regex: queryObj.city, $options: "i" };
      delete queryObj.city;
    }

    this.modelQuery = this.modelQuery.find(queryObj);
    return this;
  }

  // Sort functionality
  sort() {
    const sortBy = (this.query.sort as string) || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sortBy);
    return this;
  }

  // Field selection
  fields() {
    const fields = (this.query.fields as string)?.split(",").join(" ") || "-__v";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  // Pagination
  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  // Get meta data
  async getMeta() {
    const filter = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(filter);
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  // Build and execute query
  build() {
    return this.modelQuery;
  }
}