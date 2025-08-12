"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
let UsersService = class UsersService {
    constructor() {
        this.testUser = {
            id: 'test-id',
            email: 'testuser@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            role: 'TEST',
            isActive: true,
            isVerified: true,
            createdAt: new Date(),
            lastLoginAt: new Date(),
        };
    }
    async getUsers() {
        return {
            users: [this.testUser],
            pagination: { page: 1, limit: 1, total: 1, pages: 1 },
        };
    }
    async getUserById(id) {
        if (id === this.testUser.id)
            return this.testUser;
        throw new common_1.NotFoundException('User not found');
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map