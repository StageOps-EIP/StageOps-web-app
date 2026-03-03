import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  action?: ReactNode;
}

export function MobileHeader({ title, showBack = false, action }: MobileHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 bg-[#131316] border-b border-[#27272e] z-40 safe-area-top">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-[#a1a1aa] hover:text-[#f5f5f7] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-xl font-semibold text-[#f5f5f7]">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
