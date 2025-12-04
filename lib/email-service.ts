// Email service utility
import { ContactFormData } from '@/types';

/**
 * Custom error class for email service errors
 */
export class EmailServiceError extends Error {
  constructor(
    message: string,
    public code: 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'TIMEOUT_ERROR',
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

/**
 * Sends a contact form email using the configured email service
 * This implementation uses a simple fetch to a Next.js API route
 * In production, you would configure this with Resend, EmailJS, or similar service
 */
export async function sendContactEmail(
  data: ContactFormData,
  options: { timeout?: number; retries?: number } = {}
): Promise<void> {
  const { timeout = 10000, retries = 2 } = options;
  
  // Validate the data
  if (!data.name || !data.email || !data.phone || !data.purpose) {
    throw new EmailServiceError(
      'All fields are required',
      'VALIDATION_ERROR',
      false
    );
  }

  // Attempt to send with retries
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await sendEmailWithTimeout(data, timeout);
      return; // Success
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on validation errors
      if (error instanceof EmailServiceError && !error.retryable) {
        throw error;
      }
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  // All retries failed
  throw new EmailServiceError(
    lastError?.message || 'Failed to send email after multiple attempts',
    'NETWORK_ERROR',
    false
  );
}

/**
 * Internal function to send email with timeout
 */
async function sendEmailWithTimeout(
  data: ContactFormData,
  timeout: number
): Promise<void> {
  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new EmailServiceError(
        'Request timed out',
        'TIMEOUT_ERROR',
        true
      ));
    }, timeout);
  });

  // Create send promise
  const sendPromise = (async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In production, you would do something like:
    // const response = await fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json().catch(() => ({}));
    //   throw new EmailServiceError(
    //     errorData.message || 'Failed to send email',
    //     response.status >= 500 ? 'SERVER_ERROR' : 'NETWORK_ERROR',
    //     response.status >= 500 // Retry on server errors
    //   );
    // }

    // For development, log the data
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      purpose: data.purpose,
      timestamp: data.timestamp,
    });

    // Simulate occasional network errors for testing (10% chance)
    if (Math.random() < 0.1) {
      throw new EmailServiceError(
        'Network error occurred',
        'NETWORK_ERROR',
        true
      );
    }
  })();

  // Race between send and timeout
  return Promise.race([sendPromise, timeoutPromise]);
}

/**
 * Example API route implementation for production use with Resend:
 * 
 * // app/api/contact/route.ts
 * import { Resend } from 'resend';
 * import { NextResponse } from 'next/server';
 * 
 * const resend = new Resend(process.env.RESEND_API_KEY);
 * 
 * export async function POST(request: Request) {
 *   try {
 *     const data = await request.json();
 *     
 *     await resend.emails.send({
 *       from: 'website@yourdomain.com',
 *       to: 'artist@example.com',
 *       subject: `New Contact Form Submission from ${data.name}`,
 *       html: `
 *         <h2>New Contact Form Submission</h2>
 *         <p><strong>Name:</strong> ${data.name}</p>
 *         <p><strong>Email:</strong> ${data.email}</p>
 *         <p><strong>Phone:</strong> ${data.phone}</p>
 *         <p><strong>Purpose:</strong></p>
 *         <p>${data.purpose}</p>
 *         <p><strong>Submitted:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
 *       `,
 *     });
 *     
 *     return NextResponse.json({ success: true });
 *   } catch (error) {
 *     return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
 *   }
 * }
 */
