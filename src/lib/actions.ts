'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({
  code: z.string().trim().min(1, { message: 'Code is required.' }),
});

export async function joinChat(prevState: { error: any } | undefined, formData: FormData) {
  const parsed = schema.safeParse({
    code: formData.get('code'),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.flatten().fieldErrors,
    };
  }

  redirect(`/chat/${parsed.data.code}`);
}
