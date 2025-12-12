import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  // Supporting methods for vulnerable endpoints
  executeQuery(query: string): Record<string, unknown> {
    // VULNERABLE: This simulates executing raw SQL queries without parameterization
    // In real code, this would connect to a database and execute the query
    console.log('Executing query:', query);
    return { message: 'Query executed (vulnerable to SQL injection)', query };
  }

  getAllUsers(): Record<string, unknown>[] {
    // Simulated user data
    return [
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
      { id: 2, username: 'user1', email: 'user1@example.com', role: 'user' },
      { id: 3, username: 'user2', email: 'user2@example.com', role: 'user' },
    ];
  }

  deleteUser(userId: string): Record<string, unknown> {
    // VULNERABLE: No authorization check before deletion
    return { message: `User ${userId} deleted (no authorization check)` };
  }

  createUser(
    username: string,
    hashedPassword: string,
  ): Record<string, unknown> {
    // VULNERABLE: Storing MD5 hashed passwords
    return {
      message: 'User created',
      username,
      passwordHash: hashedPassword, // Exposing password hash in response
    };
  }
}
