import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { ZodTypeAny, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * A wrapper around React Hook Form's useForm that applies a Zod schema resolver.
 * @param schema - Zod schema for validation
 * @param options - React Hook Form options
 */
export function useZodForm<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...options,
  });
} 