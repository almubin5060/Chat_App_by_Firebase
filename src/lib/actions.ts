'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({
  code: z.string().trim().min(1, { message: 'Code is required.' }),
});

export async function joinChat(formData: FormData) {
  const parsed = schema.safeParse({
    code: formData.get('code'),
  });

  if (!parsed.success) {
    // In a real app, you would handle this error more gracefully, e.g., by returning an error message.
    // For this example, we will simply not redirect on failure.
    return {
      error: parsed.error.flatten().fieldErrors,
    }
  }

  redirect(`/chat/${parsed.data.code}`);
}
