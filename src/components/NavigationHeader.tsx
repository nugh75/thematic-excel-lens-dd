import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Home, BarChart3, Settings, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home
    },
    {
      path: '/analysis',
      label: 'Analisi',
      icon: BarChart3
    },
    {
      path: '/instructions',
      label: 'Guida Utente',
      icon: BookOpen
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AnaTema</h1>
              <p className="text-xs text-muted-foreground">Analisi Tematica</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/instructions')}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Aiuto
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;
