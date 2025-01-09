// components/CategorySelect.tsx
'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DATA_CATEGORIES, getCategoryPrompt } from '@/lib/constants/dataPrompts';

interface CategorySelectProps {
  onSelect: (description: string) => void;
}

export function CategorySelect({ onSelect }: CategorySelectProps) {
  return (
    <Select onValueChange={(category) => onSelect(getCategoryPrompt(category as keyof typeof DATA_CATEGORIES))}>
      <SelectTrigger>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Categories</SelectLabel>
          {Object.entries(DATA_CATEGORIES).map(([key, value]) => (
            <SelectItem key={key} value={key}>
              {value.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}