"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    // Search functionality
    search(searchableFields) {
        const searchTerm = this.query.searchTerm;
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
            const priceFilter = {};
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
        const sortBy = this.query.sort || "-createdAt";
        this.modelQuery = this.modelQuery.sort(sortBy);
        return this;
    }
    // Field selection
    fields() {
        const fields = this.query.fields?.split(",").join(" ") || "-__v";
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
exports.QueryBuilder = QueryBuilder;
