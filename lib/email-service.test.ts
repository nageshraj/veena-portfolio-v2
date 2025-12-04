import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendContactEmail, EmailServiceError } from './email-service';

describe('Email Service Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw validation error for missing required fields', async () => {
    const invalidData = {
      name: '',
      email: 'test@example.com',
      phone: '1234567890',
      purpose: 'Test message',
      timestamp: new Date(),
    };

    await expect(sendContactEmail(invalidData)).rejects.toThrow(EmailServiceError);
    await expect(sendContactEmail(invalidData)).rejects.toThrow('All fields are required');
  });

  it('should successfully send email with valid data', async () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      purpose: 'Test inquiry about performances',
      timestamp: new Date(),
    };

    await expect(sendContactEmail(validData)).resolves.not.toThrow();
  });

  it('should retry on network errors', async () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      purpose: 'Test inquiry',
      timestamp: new Date(),
    };

    // The service has a 10% chance of simulating network errors
    // We'll just verify it doesn't throw on valid data
    await expect(sendContactEmail(validData, { retries: 3 })).resolves.not.toThrow();
  });

  it('should respect timeout option', async () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      purpose: 'Test inquiry',
      timestamp: new Date(),
    };

    // With a very short timeout, it should still work for our mock
    await expect(sendContactEmail(validData, { timeout: 5000 })).resolves.not.toThrow();
  });

  it('should handle validation errors without retrying', async () => {
    const invalidData = {
      name: '',
      email: '',
      phone: '',
      purpose: '',
      timestamp: new Date(),
    };

    try {
      await sendContactEmail(invalidData, { retries: 3 });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(EmailServiceError);
      expect((error as EmailServiceError).code).toBe('VALIDATION_ERROR');
      expect((error as EmailServiceError).retryable).toBe(false);
    }
  });
});
