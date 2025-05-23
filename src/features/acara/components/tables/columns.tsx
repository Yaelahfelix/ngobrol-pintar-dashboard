'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';
import { Product } from '@/types/acara';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'thumbnailUrl',
    header: 'IMAGE',
    cell: ({ row }) => {
      return (
        <div className='relative aspect-square'>
          <Image
            src={row.getValue('thumbnailUrl')}
            alt={row.getValue('name')}
            fill
            className='rounded-lg'
          />
        </div>
      );
    }
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name Acara' />
    ),
    cell: ({ cell }) => <div>{cell.getValue<Product['name']>()}</div>,
    meta: {
      label: 'Name',
      placeholder: 'Cari acara...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Product['category']>();

      return (
        <Badge variant='outline' className='capitalize'>
          {status}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'categories',
      variant: 'multiSelect',
      options: CATEGORY_OPTIONS
    }
  },

  {
    accessorKey: 'harga',
    header: 'PRICE',
    cell: ({ row }) => {
      const isFree = row.original.is_free;

      const price = row.original.harga;
      return (
        <div className=''>
          {isFree ? (
            <Badge variant='default' className='capitalize' color='#86fb7a'>
              Gratis
            </Badge>
          ) : (
            <Badge variant='outline' className='capitalize'>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
              }).format(parseInt(price))}
            </Badge>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'description',
    header: 'DESCRIPTION',
    cell: ({ cell }) => {
      const description = cell.getValue<Product['description']>();
      return (
        <div className='text-muted-foreground max-w-[300px] truncate text-sm'>
          {description}
        </div>
      );
    }
  },

  {
    id: 'is_public',
    accessorKey: 'is_public',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Product['is_public']>();

      return (
        <Badge
          variant={status ? 'destructive' : 'default'}
          className='capitalize'
        >
          {status ? 'Aktif' : 'Non-Aktif'}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
