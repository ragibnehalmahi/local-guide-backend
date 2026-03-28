"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["TOURIST"] = "tourist";
    UserRole["GUIDE"] = "guide";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["BLOCKED"] = "BLOCKED";
    UserStatus["DELETED"] = "DELETED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
