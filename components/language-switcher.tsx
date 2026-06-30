'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ isCollapsed }: { isCollapsed?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(value: string) {
    router.replace(pathname, { locale: value });
  }

  return (
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className={cn("bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent h-9", isCollapsed ? "w-9 px-0 justify-center [&>svg]:hidden" : "w-full")}>
        <div className="flex items-center justify-center">
          <Globe className={cn("h-4 w-4", !isCollapsed && "mr-2 text-muted-foreground")} />
          {!isCollapsed && <SelectValue placeholder="Language" />}
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="km">ភាសាខ្មែរ</SelectItem>
      </SelectContent>
    </Select>
  );
}
