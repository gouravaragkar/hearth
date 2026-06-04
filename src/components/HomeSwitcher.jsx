import { useEffect, useState } from 'react';
import { useHome } from '@/context/HomeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function HomeSwitcher() {
  const { homes, activeHome, switchHome } = useHome();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id || null));
  }, []);

  const handleSwitch = (id) => {
    switchHome(id);
    navigate('/');
  };

  // Only show homes the user owns or is an accepted member of
  const visibleHomes = userId
    ? homes.filter(h => h.created_by === userId || (Array.isArray(h.members) && h.members.includes(userId)))
    : homes;

  if (visibleHomes.length === 0) {
    return (
      <Link
        to="/homes"
        className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 rounded-full px-3 py-1 select-none hover:bg-primary/20 transition-colors"
      >
        <Plus size={11} /> Add Home
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 bg-muted hover:bg-muted/70 rounded-full px-3 py-1.5 transition-colors select-none max-w-[160px]">
          <span className="text-sm leading-none">{activeHome?.emoji || '🏠'}</span>
          <span className="text-xs font-semibold text-foreground truncate max-w-[90px]">
            {activeHome?.name || 'Home'}
          </span>
          <ChevronDown size={12} className="text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52 rounded-xl">
        {visibleHomes.map(home => (
          <DropdownMenuItem
            key={home.id}
            onClick={() => handleSwitch(home.id)}
            className="flex items-center gap-2 cursor-pointer min-h-[44px]"
          >
            <span className="text-lg">{home.emoji || '🏠'}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{home.name}</p>
              <p className="text-xs text-muted-foreground">{home.currency}</p>
            </div>
            {home.id === activeHome?.id && (
              <Check size={14} className="text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/homes" className="flex items-center gap-2 cursor-pointer min-h-[44px] text-primary text-sm">
            <Plus size={14} /> Manage Homes
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
