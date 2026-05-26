import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Check, ChevronDown } from 'lucide-react';

export default function BottomSheetSelect({ value, onValueChange, options, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-left select-none min-h-[44px] hover:bg-muted/40 transition-colors"
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-muted-foreground shrink-0" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-base">{placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 space-y-1" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onValueChange(opt.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm select-none transition-colors hover:bg-muted min-h-[52px]"
              >
                <span className={value === opt.value ? 'font-medium text-primary' : 'text-foreground'}>
                  {opt.label}
                </span>
                {value === opt.value && <Check size={16} className="text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}