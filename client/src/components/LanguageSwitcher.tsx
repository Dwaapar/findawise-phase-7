import React from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useLanguagePreference, useLocalization } from '@/hooks/useLocalization';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function LanguageSwitcher({ 
  showLabel = true, 
  size = 'md',
  variant = 'outline',
  className 
}: LanguageSwitcherProps) {
  const { currentLanguage, availableLanguages, changeLanguage, isChanging } = useLanguagePreference();
  const { translate, languageInfo, isRTL } = useLocalization();

  const handleLanguageChange = (languageCode: string) => {
    if (languageCode !== currentLanguage && !isChanging) {
      changeLanguage(languageCode);
    }
  };

  const currentLangInfo = languageInfo || availableLanguages.find(lang => lang.code === currentLanguage);
  
  const buttonSizeClass = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-9 px-3',
    lg: 'h-10 px-4 text-base',
  }[size];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            'gap-2',
            buttonSizeClass,
            isRTL && 'flex-row-reverse',
            className
          )}
          disabled={isChanging}
        >
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {currentLangInfo?.nativeName || currentLanguage.toUpperCase()}
            </span>
          )}
          <span className="sm:hidden">
            {currentLanguage.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align={isRTL ? 'start' : 'end'} 
        className="w-56"
        sideOffset={4}
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {translate('ui.common.selectLanguage', {}, 'Select Language')}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              'flex items-center justify-between cursor-pointer',
              isRTL && 'flex-row-reverse',
              currentLanguage === language.code && 'bg-accent'
            )}
            disabled={isChanging}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  {language.name}
                  {language.region && ` (${language.region})`}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {language.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  {translate('ui.common.default', {}, 'Default')}
                </Badge>
              )}
              {currentLanguage === language.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-xs text-muted-foreground justify-center">
          {translate('ui.common.autoDetected', {}, 'Language auto-detected')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile/small spaces
export function CompactLanguageSwitcher({ className }: { className?: string }) {
  return (
    <LanguageSwitcher
      showLabel={false}
      size="sm"
      variant="ghost"
      className={className}
    />
  );
}

// Inline language switcher for forms and content
export function InlineLanguageSwitcher({ 
  onLanguageChange,
  className 
}: { 
  onLanguageChange?: (language: string) => void;
  className?: string;
}) {
  const { currentLanguage, availableLanguages } = useLanguagePreference();
  const { translate, isRTL } = useLocalization();

  const handleChange = (languageCode: string) => {
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
  };

  return (
    <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse', className)}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={currentLanguage}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          'text-sm border-0 bg-transparent focus:outline-none focus:ring-0',
          'text-muted-foreground hover:text-foreground transition-colors',
          isRTL && 'text-right'
        )}
      >
        {availableLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}