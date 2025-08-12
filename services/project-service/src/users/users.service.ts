import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  // Hardcoded test user
  private readonly testUser = {
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

  async getUsers() {
    return {
      users: [this.testUser],
      pagination: { page: 1, limit: 1, total: 1, pages: 1 },
    };
  }

  async getUserById(id: string) {
    if (id === this.testUser.id) return this.testUser;
    throw new NotFoundException('User not found');
  }
}
