import { Controller, Get, Post, Body, Query, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // VULNERABILITY #1: A03:2021 – Injection (SQL Injection)
  // Deliberately vulnerable endpoint that concatenates user input into SQL query
  @Get('users')
  getUsers(@Query('id') id: string): Record<string, unknown> {
    // VULNERABLE: Direct string interpolation in SQL query
    const query = `SELECT * FROM users WHERE id = ${id}`;
    return this.appService.executeQuery(query);
  }

  // VULNERABILITY #2: A01:2021 – Broken Access Control
  // Missing authorization check - allows any user to access admin endpoints
  @Get('admin/users')
  getAllUsers(): Record<string, unknown>[] {
    // VULNERABLE: No authorization check - anyone can access admin endpoint
    return this.appService.getAllUsers();
  }

  @Post('admin/delete-user')
  deleteUser(@Body('userId') userId: string): Record<string, unknown> {
    // VULNERABLE: No authorization check - allows unauthorized user deletion
    return this.appService.deleteUser(userId);
  }

  // VULNERABILITY #3: A02:2021 – Cryptographic Failures
  // Weak password hashing using MD5 (deprecated and insecure)
  @Post('register')
  register(
    @Body('username') username: string,
    @Body('password') password: string,
  ): Record<string, unknown> {
    // VULNERABLE: Using MD5 for password hashing (cryptographically broken)
    const hashedPassword = crypto
      .createHash('md5')
      .update(password)
      .digest('hex');
    return this.appService.createUser(username, hashedPassword);
  }

  // VULNERABILITY #4: A07:2021 – Identification and Authentication Failures
  // Weak session management - storing sensitive data in cookies without proper security
  @Post('login')
  login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    // VULNERABLE: Setting cookie without HttpOnly, Secure, or SameSite flags
    res.cookie('session', 'user=' + username + '&role=admin', {
      // Missing HttpOnly flag allows XSS attacks
      // Missing Secure flag allows transmission over HTTP
      // Missing SameSite flag allows CSRF attacks
    });
    return { success: true };
  }

  // VULNERABILITY #5: A05:2021 – Security Misconfiguration
  // Exposing sensitive information in error messages and debug endpoints
  @Get('debug/info')
  getDebugInfo(@Req() req: Request) {
    // VULNERABLE: Exposing sensitive system information
    return {
      environment: process.env,
      headers: req.headers,
      databasePassword: process.env.DB_PASSWORD || 'default_password_123',
      apiKeys: {
        stripe: process.env.STRIPE_KEY || 'sk_test_exposed_key',
        aws: process.env.AWS_SECRET || 'AKIAIOSFODNN7EXAMPLE',
      },
    };
  }
}
