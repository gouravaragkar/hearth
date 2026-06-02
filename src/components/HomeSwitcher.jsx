import { useHome } from '@/context/HomeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function HomeSwitcher() {
  const { homes, activeHome, switchHome } = useHome();
  const navigate = useNavigate();

  const handleSwitch = (id) => {
    switchHome(id);
    navigate('/');
  };

  if (homes.length === 0) {
    return (
      <Link to="/homes" className="flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-1.5 select-none hover:bg-muted/80 transition-colors">
        <Plus size={12} /> Add Home
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 rounded-xl px-3 py-1.5 text-sm font-medium text-foreground transition-colors select-none">
          <span>{activeHome?.emoji || '🏠'}</span>
          <span className="max-w-[80px] truncate">{activeHome?.name || 'Select Home'}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">{activeHome?.currency}</span>
          <ChevronDown size={13} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-52 rounded-xl">
        {homes.map(home => (
          <DropdownMenuItem
            key={home.id}
            onClick={() => handleSwitch(home.id)}
            className={`flex items-center gap-2 cursor-pointer min-h-[44px] ${home.id === activeHome?.id ? 'text-primary font-semibold' : ''}`}
          >
            <span>{home.emoji || '🏠'}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate">{home.name}</p>
              <p className="text-xs text-muted-foreground">{home.currency}</p>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/homes" className="flex items-center gap-2 cursor-pointer min-h-[44px] text-primary">
            <Plus size={14} /> Manage Homes
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}