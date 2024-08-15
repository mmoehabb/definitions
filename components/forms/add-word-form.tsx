'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { addWord } from '@/lib/actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AddWordForm() {
  const [state, formAction] = useActionState(addWord, {});
  const form = useForm();

  return (
    <Form {...form}>
      <form action={formAction} className="m-4 max-w-96 space-y-8 md:min-w-72">
        <FormField
          control={form.control}
          name="word_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Word</FormLabel>
              <FormControl>
                <Input placeholder="write the word" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage>{state.errors?.word_text}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="def_content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Definition</FormLabel>
              <FormControl>
                <Textarea placeholder="write the definition" {...field} />
              </FormControl>
              <FormDescription>
                Write the definition of the word, you way copy it from your source.
              </FormDescription>
              <FormMessage>{state.errors?.def_content}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="def_reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference</FormLabel>
              <FormControl>
                <Input placeholder="write your reference" {...field} />
              </FormControl>
              <FormDescription>
                From where did you get the definition. Just write your name if it's yours :D
              </FormDescription>
              <FormMessage>{state.errors?.def_reference}</FormMessage>
            </FormItem>
          )}
        />
        <Button type="submit">Add Word</Button>
        {state.message && (
          <Alert
            variant={state.message.type == 'error' && 'destructive'}
            className={state.message.type == 'success' ? 'border-green-600 text-green-600' : ''}
          >
            <AlertDescription>{state.message.text}</AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  );
}
