"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guideEarningsValidation = void 0;
const zod_1 = require("zod");
exports.guideEarningsValidation = {
    getHistory: zod_1.z.object({
        query: zod_1.z.object({
            page: zod_1.z.string().optional().default("1"),
            limit: zod_1.z.string().optional().default("10"),
            startDate: zod_1.z.string().optional(),
            endDate: zod_1.z.string().optional()
        })
    })
};
