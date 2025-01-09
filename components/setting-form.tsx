'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';

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

// Validasi schema menggunakan Zod
const formSchema = z.object({
  ip_controller: z
    .string()
    .regex(
      /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/,
      { message: 'Invalid IP address format.' }
    ),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
});

export default function SettingForm() {
  const [isEdit, setIsEdit] = useState(false); // State untuk mode Add/Update
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ip_controller: '',
      name: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/settings/ip');
        const data = await response.json();
        if (data.ip_controller) {
          form.reset({
            ip_controller: data.ip_controller,
            name: data.name,
          });
          setIsEdit(true); // Berubah ke mode Update jika IP ditemukan
        }
      } catch {
        console.error('Failed to fetch IP data');
      }
    };

    fetchData();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/settings/ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.message) {
        alert(data.message);
        setIsEdit(true); // Ubah ke mode Update setelah berhasil menyimpan
      } else {
        alert('Failed to save settings.');
      }
    } catch {
      alert('Error saving settings.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* IP Controller Field */}
        <FormField
          control={form.control}
          name="ip_controller"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Controller IP</FormLabel>
              <FormControl>
                <Input placeholder="192.168.x.x" {...field} />
              </FormControl>
              <FormDescription>
                Enter the IP address of your controller.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Controller Name</FormLabel>
              <FormControl>
                <Input placeholder="Controller Name" {...field} />
              </FormControl>
              <FormDescription>
                Enter a name for your controller.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {isEdit ? 'Update Settings' : 'Add Settings'}
        </Button>
      </form>
    </Form>
  );
}
