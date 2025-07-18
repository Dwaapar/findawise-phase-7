import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalization } from '@/hooks/useLocalization';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { 
  Globe, 
  Languages, 
  Settings, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit,
  Save,
  X
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Language {
  code: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
  completeness: number;
}

interface TranslationKey {
  id: string;
  keyPath: string;
  defaultValue: string;
  category?: string;
  context?: string;
}

interface Translation {
  id: string;
  keyId: string;
  languageCode: string;
  translatedValue: string;
  isAutoTranslated: boolean;
  quality: number;
}

const LocalizationDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [editingTranslation, setEditingTranslation] = useState<string | null>(null);
  const [newTranslationValue, setNewTranslationValue] = useState('');
  const [bulkTranslateLanguage, setBulkTranslateLanguage] = useState('');
  
  const { translate, currentLanguage, isRTL, textDirection } = useLocalization();
  const queryClient = useQueryClient();

  // Fetch languages
  const { data: languagesResponse, isLoading: isLoadingLanguages } = useQuery({
    queryKey: ['/api/languages'],
  });
  
  const languages = Array.isArray(languagesResponse?.data) ? languagesResponse.data : [];

  // Fetch translation keys
  const { data: keysResponse, isLoading: isLoadingKeys } = useQuery({
    queryKey: ['/api/translation-keys'],
  });
  
  const translationKeys = Array.isArray(keysResponse?.data) ? keysResponse.data : [];

  // Fetch translations for selected language
  const { data: translationsResponse, isLoading: isLoadingTranslations } = useQuery({
    queryKey: ['/api/translations', selectedLanguage],
    enabled: !!selectedLanguage,
  });
  
  const translations = Array.isArray(translationsResponse?.data) ? translationsResponse.data : [];

  // Fetch localization analytics
  const { data: analytics = [], isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['/api/analytics/localization'],
  });

  // Fetch language usage stats
  const { data: usageStats, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['/api/analytics/language-usage'],
  });

  // Auto-translate mutation
  const autoTranslateMutation = useMutation({
    mutationFn: async (targetLanguage: string) => {
      return apiRequest(`/api/translations/bulk-translate/${targetLanguage}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/translations'] });
    },
  });

  // Update translation mutation
  const updateTranslationMutation = useMutation({
    mutationFn: async ({ 
      keyId, 
      languageCode, 
      translatedValue 
    }: { 
      keyId: string; 
      languageCode: string; 
      translatedValue: string; 
    }) => {
      return apiRequest('/api/translations', {
        method: 'POST',
        body: JSON.stringify({
          keyId,
          languageCode,
          translatedValue,
          isAutoTranslated: false,
          quality: 100,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/translations'] });
      setEditingTranslation(null);
      setNewTranslationValue('');
    },
  });

  const handleBulkTranslate = async () => {
    if (!bulkTranslateLanguage) return;
    await autoTranslateMutation.mutateAsync(bulkTranslateLanguage);
    setBulkTranslateLanguage('');
  };

  const handleUpdateTranslation = async (keyId: string) => {
    if (!newTranslationValue.trim()) return;
    
    await updateTranslationMutation.mutateAsync({
      keyId,
      languageCode: selectedLanguage,
      translatedValue: newTranslationValue,
    });
  };

  const startEditing = (translation: Translation) => {
    setEditingTranslation(translation.id);
    setNewTranslationValue(translation.translatedValue);
  };

  const cancelEditing = () => {
    setEditingTranslation(null);
    setNewTranslationValue('');
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Language Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translate('dashboard.localization.totalLanguages', {}, 'Total Languages')}
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languages.length}</div>
            <p className="text-xs text-muted-foreground">
              {languages.filter((lang: Language) => lang.isActive).length} {translate('dashboard.localization.active', {}, 'active')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translate('dashboard.localization.translationKeys', {}, 'Translation Keys')}
            </CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{translationKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              {translate('dashboard.localization.acrossAllCategories', {}, 'across all categories')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translate('dashboard.localization.completeness', {}, 'Avg Completeness')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {languages.length > 0 
                ? Math.round(languages.reduce((sum: number, lang: Language) => sum + lang.completeness, 0) / languages.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {translate('dashboard.localization.averageAcrossLanguages', {}, 'average across languages')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {translate('dashboard.localization.activeUsers', {}, 'Active Users')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageStats?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {translate('dashboard.localization.last30Days', {}, 'last 30 days')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Language Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{translate('dashboard.localization.languageStatus', {}, 'Language Status')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((language: Language) => (
              <div 
                key={language.code} 
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{language.name}</h3>
                    {language.isDefault && (
                      <Badge variant="secondary">
                        {translate('dashboard.localization.default', {}, 'Default')}
                      </Badge>
                    )}
                  </div>
                  <Badge variant={language.isActive ? 'default' : 'secondary'}>
                    {language.isActive 
                      ? translate('dashboard.localization.active', {}, 'Active')
                      : translate('dashboard.localization.inactive', {}, 'Inactive')
                    }
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{translate('dashboard.localization.completeness', {}, 'Completeness')}</span>
                    <span>{language.completeness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${language.completeness}%` }}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedLanguage(language.code)}
                  >
                    {translate('dashboard.localization.view', {}, 'View')}
                  </Button>
                  {language.completeness < 100 && (
                    <Button
                      size="sm"
                      onClick={() => setBulkTranslateLanguage(language.code)}
                      disabled={autoTranslateMutation.isPending}
                    >
                      {translate('dashboard.localization.autoTranslate', {}, 'Auto-translate')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTranslationsTab = () => (
    <div className="space-y-6">
      {/* Language Selector and Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <Label htmlFor="language-select">
            {translate('dashboard.localization.selectLanguage', {}, 'Select Language')}:
          </Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang: Language) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={bulkTranslateLanguage} onValueChange={setBulkTranslateLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={translate('dashboard.localization.selectForBulkTranslate', {}, 'Select for bulk translate')} />
            </SelectTrigger>
            <SelectContent>
              {languages
                .filter((lang: Language) => lang.code !== 'en')
                .map((lang: Language) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleBulkTranslate}
            disabled={!bulkTranslateLanguage || autoTranslateMutation.isPending}
          >
            {autoTranslateMutation.isPending 
              ? translate('dashboard.localization.translating', {}, 'Translating...') 
              : translate('dashboard.localization.bulkTranslate', {}, 'Bulk Translate')
            }
          </Button>
        </div>
      </div>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {translate('dashboard.localization.translationsFor', { language: selectedLanguage }, `Translations for ${selectedLanguage.toUpperCase()}`)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {translationKeys.map((key: TranslationKey) => {
              const translation = translations.find((t: Translation) => t.keyId === key.id);
              const isEditing = editingTranslation === translation?.id;

              return (
                <div key={key.id} className="border rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{key.keyPath}</p>
                        {key.category && (
                          <Badge variant="outline" className="text-xs">
                            {key.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {translation?.isAutoTranslated && (
                          <Badge variant="secondary" className="text-xs">
                            {translate('dashboard.localization.autoTranslated', {}, 'Auto-translated')}
                          </Badge>
                        )}
                        {translation && !isEditing && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(translation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {translate('dashboard.localization.original', {}, 'Original (EN)')}
                        </Label>
                        <p className="text-sm bg-gray-50 p-2 rounded border">
                          {key.defaultValue}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {translate('dashboard.localization.translation', {}, 'Translation')}
                        </Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Textarea
                              value={newTranslationValue}
                              onChange={(e) => setNewTranslationValue(e.target.value)}
                              className="text-sm"
                              rows={2}
                            />
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateTranslation(key.id)}
                                disabled={updateTranslationMutation.isPending}
                              >
                                <Save className="h-4 w-4 mr-1" />
                                {translate('dashboard.localization.save', {}, 'Save')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                              >
                                <X className="h-4 w-4 mr-1" />
                                {translate('dashboard.localization.cancel', {}, 'Cancel')}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className={`text-sm p-2 rounded border ${
                            translation 
                              ? 'bg-white' 
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {translation?.translatedValue || 
                             translate('dashboard.localization.missingTranslation', {}, 'Missing translation')}
                          </p>
                        )}
                      </div>
                    </div>

                    {key.context && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {translate('dashboard.localization.context', {}, 'Context')}
                        </Label>
                        <p className="text-xs text-gray-600">{key.context}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoadingLanguages || isLoadingKeys) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 p-6"
      dir={textDirection}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {translate('dashboard.localization.title', {}, 'Localization Dashboard')}
            </h1>
            <p className="text-slate-600">
              {translate('dashboard.localization.subtitle', {}, 'Manage translations and multi-language content')}
            </p>
          </div>
          <div className={`flex items-center space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {translate('dashboard.localization.overview', {}, 'Overview')}
            </button>
            <button
              onClick={() => setActiveTab('translations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'translations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {translate('dashboard.localization.translations', {}, 'Translations')}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'translations' && renderTranslationsTab()}
      </div>
    </div>
  );
};

export default LocalizationDashboard;