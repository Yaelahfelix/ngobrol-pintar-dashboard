'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const FormSchema = z.object({
  time: z.date({
    required_error: 'A date and time is required.'
  })
});

export function DateTimePicker24hForm({
  value,
  onSelect
}: {
  value: Date;
  onSelect: (date: Date) => void;
}) {
  function handleDateSelect(date: Date | undefined) {
    if (date) {
      onSelect(date);
    }
  }

  function handleTimeChange(type: 'hour' | 'minute', val: string) {
    const currentDate = value || new Date();
    let newDate = new Date(currentDate);

    if (type === 'hour') {
      const hour = parseInt(val, 10);
      newDate.setHours(hour);
    } else if (type === 'minute') {
      newDate.setMinutes(parseInt(val, 10));
    }

    onSelect(newDate);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full pl-3 text-left font-normal',
            value && 'text-muted-foreground'
          )}
        >
          {value ? (
            format(value, 'MM/dd/yyyy HH:mm')
          ) : (
            <span>MM/DD/YYYY HH:mm</span>
          )}
          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <div className='sm:flex'>
          <Calendar
            mode='single'
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className='flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0'>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex p-2 sm:flex-col'>
                {Array.from({ length: 24 }, (_, i) => i)
                  .reverse()
                  .map((hour) => (
                    <Button
                      key={hour}
                      size='icon'
                      variant={
                        value && value.getHours() === hour ? 'default' : 'ghost'
                      }
                      className='aspect-square shrink-0 sm:w-full'
                      onClick={() => handleTimeChange('hour', hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex p-2 sm:flex-col'>
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size='icon'
                    variant={
                      value && value.getMinutes() === minute
                        ? 'default'
                        : 'ghost'
                    }
                    className='aspect-square shrink-0 sm:w-full'
                    onClick={() =>
                      handleTimeChange('minute', minute.toString())
                    }
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
