"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
const paginate = (data, page, limit) => {
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
exports.paginate = paginate;
