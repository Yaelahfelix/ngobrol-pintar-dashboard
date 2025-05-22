'use client';

import { DatePicker } from '@/components/date-picker';
import { DateTimePicker24hForm } from '@/components/datetime-picker-24h';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/types/acara';
import { db } from '@/lib/firebase';
import { uploadImage } from '@/lib/uploadImage';
import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

function formatRupiah(value: string | number): string {
  if (!value) return '';
  return 'Rp' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseRupiah(value: string): string {
  const cleaned = value.replace(/[^\d]/g, '');
  return cleaned;
}

const formSchema = z.object({
  image: z
    .any()
    .refine((files) => files?.length == 1, 'Image is required.')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  name: z.string().min(2, {
    message: 'Nama Acara must be at least 2 characters.'
  }),
  pembicara: z.string().min(2, {
    message: 'Nama Pembicara must be at least 2 characters.'
  }),
  jabatan_pembicara: z.string().min(2, {
    message: 'Jabatan Pembicara must be at least 2 characters.'
  }),
  slot: z.string(),
  tempat: z.string().min(2, {
    message: 'Tempat must be at least 2 characters.'
  }),
  tanggal: z.date({ message: 'Tanggal pelaksanaan wajib diisi' }),
  is_free: z.boolean(),
  category: z.string(),
  harga: z.string(),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  })
});

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: Product | null;
  pageTitle: string;
}) {
  const defaultValues = useMemo(
    () => ({
      name: initialData?.name || '',
      category: initialData?.category || '',
      harga: initialData?.harga || '',
      description: initialData?.description || '',
      is_free: initialData?.is_free ?? true,
      tanggal: initialData?.tanggal
        ? new Date(initialData.tanggal)
        : new Date(),
      pembicara: initialData?.pembicara || '',
      jabatan_pembicara: initialData?.jabatan_pembicara || '',
      tempat: initialData?.tempat || '',
      slot: initialData?.slot || ''
    }),
    [initialData]
  );
  const [isLoading, setIsLoading] = useState(false);
  const Router = useRouter();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const thumbnailUrl = await uploadImage(
        values.image[0],
        'thumbnail_acara'
      );
      const { image, ...rest } = values;
      await addDoc(collection(db, 'acara'), {
        ...rest,
        is_public: false,
        is_complete: false,
        thumbnailUrl,
        userId: user?.id
      });
      toast('Berhasil membuat acara!');
      Router.push('/dashboard/acara');
    } catch (err) {
      console.log(err);
      toast('Terjadi kesalahan di server!');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='w-full'>
                    <FormLabel>Poster Seminar</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={1}
                        maxSize={1 * 1024 * 1024}
                        // disabled={loading}
                        // progresses={progresses}
                        // pass the onUpload function here for direct upload
                        // onUpload={uploadFiles}
                        // disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className=''>
                    <FormLabel>Nama Acara</FormLabel>
                    <FormControl>
                      <Input placeholder='Masukkan Nama Acara' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex gap-5'>
                <FormField
                  control={form.control}
                  name='pembicara'
                  render={({ field }) => (
                    <FormItem className='w-6/12'>
                      <FormLabel>Nama Pembicara</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Masukkan Nama Pembicara'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='jabatan_pembicara'
                  render={({ field }) => (
                    <FormItem className='w-6/12'>
                      <FormLabel>Jabatan Pembicara</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Masukkan Nama Jabatan Pembicara'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Kategori Acara</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Pilih Kategori' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='seminar'>Seminar</SelectItem>
                        <SelectItem value='workshop'>Workshop</SelectItem>
                        <SelectItem value='talkshow'>Talkshow</SelectItem>
                        <SelectItem value='webinar'>Webinar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex gap-5'>
                <FormField
                  control={form.control}
                  name='tanggal'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Acara</FormLabel>
                      <FormControl>
                        <DateTimePicker24hForm
                          onSelect={(val) => field.onChange(val)}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='tempat'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempat Acara</FormLabel>
                      <FormControl>
                        <Input placeholder='Audotorium Gedung A' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='slot'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Tiket</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='30 Tiket'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex flex-col gap-3'>
                <FormField
                  control={form.control}
                  name='is_free'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acara ini gratis?</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(val) => {
                            field.onChange(val);
                            form.setValue('harga', '0');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!form.watch('is_free') && (
                  <FormField
                    control={form.control}
                    name='harga'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga Tiket</FormLabel>
                        <FormControl>
                          <Input
                            type='text'
                            inputMode='numeric'
                            placeholder='Masukkan harga tiket'
                            value={formatRupiah(field.value)}
                            onChange={(e) => {
                              const numericValue = parseRupiah(e.target.value);
                              field.onChange(numericValue);
                            }}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Masukkan deskripsi acara...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit' className='w-full' disabled={isLoading}>
              Tambah Acara
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
