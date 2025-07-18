// Initial translation data for seeding the localization system
export const initialTranslationKeys = [
  // UI Common
  { keyPath: 'ui.common.siteName', defaultValue: 'Findawise Empire', category: 'ui' },
  { keyPath: 'ui.common.allRightsReserved', defaultValue: 'All rights reserved.', category: 'ui' },
  { keyPath: 'ui.common.loading', defaultValue: 'Loading...', category: 'ui' },
  { keyPath: 'ui.common.error', defaultValue: 'An error occurred', category: 'ui' },
  { keyPath: 'ui.common.success', defaultValue: 'Success!', category: 'ui' },
  { keyPath: 'ui.common.save', defaultValue: 'Save', category: 'ui' },
  { keyPath: 'ui.common.cancel', defaultValue: 'Cancel', category: 'ui' },
  { keyPath: 'ui.common.edit', defaultValue: 'Edit', category: 'ui' },
  { keyPath: 'ui.common.delete', defaultValue: 'Delete', category: 'ui' },
  { keyPath: 'ui.common.view', defaultValue: 'View', category: 'ui' },
  { keyPath: 'ui.common.niche', defaultValue: 'Niche', category: 'ui' },
  { keyPath: 'ui.common.emotion', defaultValue: 'Emotion', category: 'ui' },

  // Navigation
  { keyPath: 'nav.dashboard', defaultValue: 'Dashboard', category: 'navigation' },
  { keyPath: 'nav.analytics', defaultValue: 'Analytics', category: 'navigation' },
  { keyPath: 'nav.experiments', defaultValue: 'A/B Testing', category: 'navigation' },
  { keyPath: 'nav.leads', defaultValue: 'Lead Management', category: 'navigation' },
  { keyPath: 'nav.crossDevice', defaultValue: 'Cross-Device Analytics', category: 'navigation' },
  { keyPath: 'nav.localization', defaultValue: 'Localization', category: 'navigation' },

  // Dashboard Localization
  { keyPath: 'dashboard.localization.title', defaultValue: 'Localization Dashboard', category: 'dashboard' },
  { keyPath: 'dashboard.localization.subtitle', defaultValue: 'Manage translations and multi-language content', category: 'dashboard' },
  { keyPath: 'dashboard.localization.totalLanguages', defaultValue: 'Total Languages', category: 'dashboard' },
  { keyPath: 'dashboard.localization.translationKeys', defaultValue: 'Translation Keys', category: 'dashboard' },
  { keyPath: 'dashboard.localization.completeness', defaultValue: 'Completeness', category: 'dashboard' },
  { keyPath: 'dashboard.localization.activeUsers', defaultValue: 'Active Users', category: 'dashboard' },
  { keyPath: 'dashboard.localization.overview', defaultValue: 'Overview', category: 'dashboard' },
  { keyPath: 'dashboard.localization.translations', defaultValue: 'Translations', category: 'dashboard' },
  { keyPath: 'dashboard.localization.active', defaultValue: 'Active', category: 'dashboard' },
  { keyPath: 'dashboard.localization.inactive', defaultValue: 'Inactive', category: 'dashboard' },
  { keyPath: 'dashboard.localization.default', defaultValue: 'Default', category: 'dashboard' },
  { keyPath: 'dashboard.localization.autoTranslate', defaultValue: 'Auto-translate', category: 'dashboard' },
  { keyPath: 'dashboard.localization.bulkTranslate', defaultValue: 'Bulk Translate', category: 'dashboard' },
  { keyPath: 'dashboard.localization.translating', defaultValue: 'Translating...', category: 'dashboard' },
  { keyPath: 'dashboard.localization.selectLanguage', defaultValue: 'Select Language', category: 'dashboard' },
  { keyPath: 'dashboard.localization.selectForBulkTranslate', defaultValue: 'Select for bulk translate', category: 'dashboard' },
  { keyPath: 'dashboard.localization.translationsFor', defaultValue: 'Translations for {language}', category: 'dashboard' },
  { keyPath: 'dashboard.localization.autoTranslated', defaultValue: 'Auto-translated', category: 'dashboard' },
  { keyPath: 'dashboard.localization.original', defaultValue: 'Original (EN)', category: 'dashboard' },
  { keyPath: 'dashboard.localization.translation', defaultValue: 'Translation', category: 'dashboard' },
  { keyPath: 'dashboard.localization.missingTranslation', defaultValue: 'Missing translation', category: 'dashboard' },
  { keyPath: 'dashboard.localization.context', defaultValue: 'Context', category: 'dashboard' },
  { keyPath: 'dashboard.localization.save', defaultValue: 'Save', category: 'dashboard' },
  { keyPath: 'dashboard.localization.cancel', defaultValue: 'Cancel', category: 'dashboard' },
  { keyPath: 'dashboard.localization.languageStatus', defaultValue: 'Language Status', category: 'dashboard' },
  { keyPath: 'dashboard.localization.acrossAllCategories', defaultValue: 'across all categories', category: 'dashboard' },
  { keyPath: 'dashboard.localization.averageAcrossLanguages', defaultValue: 'average across languages', category: 'dashboard' },
  { keyPath: 'dashboard.localization.last30Days', defaultValue: 'last 30 days', category: 'dashboard' },

  // Language Switcher
  { keyPath: 'languageSwitcher.selectLanguage', defaultValue: 'Select Language', category: 'ui' },
  { keyPath: 'languageSwitcher.currentLanguage', defaultValue: 'Current: {language}', category: 'ui' },

  // Emotions
  { keyPath: 'emotions.trust', defaultValue: 'Trust', category: 'emotions' },
  { keyPath: 'emotions.excitement', defaultValue: 'Excitement', category: 'emotions' },
  { keyPath: 'emotions.relief', defaultValue: 'Relief', category: 'emotions' },
  { keyPath: 'emotions.confidence', defaultValue: 'Confidence', category: 'emotions' },
  { keyPath: 'emotions.calm', defaultValue: 'Calm', category: 'emotions' },

  // Niches
  { keyPath: 'niches.wealth', defaultValue: 'Wealth Building', category: 'niches' },
  { keyPath: 'niches.health', defaultValue: 'Health & Wellness', category: 'niches' },
  { keyPath: 'niches.relationships', defaultValue: 'Relationships', category: 'niches' },
  { keyPath: 'niches.selfimprovement', defaultValue: 'Self Improvement', category: 'niches' },
  { keyPath: 'niches.technology', defaultValue: 'Technology', category: 'niches' },

  // Sample Page Translations
  { keyPath: 'pages.wealth-building.title', defaultValue: 'Build Lasting Wealth with Proven Strategies', category: 'pages' },
  { keyPath: 'pages.wealth-building.description', defaultValue: 'Discover time-tested methods to create sustainable financial growth and achieve your wealth-building goals.', category: 'pages' },
  { keyPath: 'pages.wealth-building.keywords', defaultValue: 'wealth building, financial growth, investment strategies, passive income', category: 'pages' },
  { keyPath: 'pages.wealth-building.cta.title', defaultValue: 'Ready to Start Building Wealth?', category: 'pages' },
  { keyPath: 'pages.wealth-building.cta.description', defaultValue: 'Take the first step towards financial freedom today.', category: 'pages' },
  { keyPath: 'pages.wealth-building.cta.button', defaultValue: 'Start Your Wealth Journey', category: 'pages' },

  { keyPath: 'pages.health-optimization.title', defaultValue: 'Optimize Your Health for Peak Performance', category: 'pages' },
  { keyPath: 'pages.health-optimization.description', defaultValue: 'Transform your body and mind with evidence-based health optimization techniques.', category: 'pages' },
  { keyPath: 'pages.health-optimization.keywords', defaultValue: 'health optimization, wellness, fitness, nutrition, mental health', category: 'pages' },
  { keyPath: 'pages.health-optimization.cta.title', defaultValue: 'Ready to Transform Your Health?', category: 'pages' },
  { keyPath: 'pages.health-optimization.cta.description', defaultValue: 'Start your journey to optimal health and vitality.', category: 'pages' },
  { keyPath: 'pages.health-optimization.cta.button', defaultValue: 'Begin Health Transformation', category: 'pages' },

  // Error Messages
  { keyPath: 'errors.networkError', defaultValue: 'Network error occurred. Please try again.', category: 'errors' },
  { keyPath: 'errors.invalidInput', defaultValue: 'Invalid input. Please check your data.', category: 'errors' },
  { keyPath: 'errors.unauthorized', defaultValue: 'Unauthorized access. Please log in.', category: 'errors' },
  { keyPath: 'errors.notFound', defaultValue: 'The requested resource was not found.', category: 'errors' },

  // Success Messages
  { keyPath: 'success.saved', defaultValue: 'Changes saved successfully!', category: 'success' },
  { keyPath: 'success.created', defaultValue: 'Item created successfully!', category: 'success' },
  { keyPath: 'success.updated', defaultValue: 'Item updated successfully!', category: 'success' },
  { keyPath: 'success.deleted', defaultValue: 'Item deleted successfully!', category: 'success' },
];

// Sample translations for different languages
export const initialTranslations = {
  // Spanish translations
  es: {
    'ui.common.siteName': 'Imperio Findawise',
    'ui.common.allRightsReserved': 'Todos los derechos reservados.',
    'ui.common.loading': 'Cargando...',
    'nav.dashboard': 'Panel de Control',
    'nav.analytics': 'Analíticas',
    'nav.localization': 'Localización',
    'dashboard.localization.title': 'Panel de Localización',
    'dashboard.localization.subtitle': 'Gestionar traducciones y contenido multiidioma',
    'dashboard.localization.totalLanguages': 'Idiomas Totales',
    'languageSwitcher.selectLanguage': 'Seleccionar Idioma',
    'emotions.trust': 'Confianza',
    'emotions.excitement': 'Emoción',
    'pages.wealth-building.title': 'Construye Riqueza Duradera con Estrategias Probadas',
    'pages.wealth-building.cta.button': 'Comienza tu Viaje hacia la Riqueza',
  },

  // French translations
  fr: {
    'ui.common.siteName': 'Empire Findawise',
    'ui.common.allRightsReserved': 'Tous droits réservés.',
    'ui.common.loading': 'Chargement...',
    'nav.dashboard': 'Tableau de Bord',
    'nav.analytics': 'Analyses',
    'nav.localization': 'Localisation',
    'dashboard.localization.title': 'Tableau de Bord de Localisation',
    'dashboard.localization.subtitle': 'Gérer les traductions et le contenu multilingue',
    'dashboard.localization.totalLanguages': 'Langues Totales',
    'languageSwitcher.selectLanguage': 'Sélectionner la Langue',
    'emotions.trust': 'Confiance',
    'emotions.excitement': 'Excitation',
    'pages.wealth-building.title': 'Construire une Richesse Durable avec des Stratégies Éprouvées',
    'pages.wealth-building.cta.button': 'Commencez Votre Voyage vers la Richesse',
  },

  // German translations
  de: {
    'ui.common.siteName': 'Findawise Imperium',
    'ui.common.allRightsReserved': 'Alle Rechte vorbehalten.',
    'ui.common.loading': 'Laden...',
    'nav.dashboard': 'Dashboard',
    'nav.analytics': 'Analytik',
    'nav.localization': 'Lokalisierung',
    'dashboard.localization.title': 'Lokalisierungs-Dashboard',
    'dashboard.localization.subtitle': 'Übersetzungen und mehrsprachige Inhalte verwalten',
    'dashboard.localization.totalLanguages': 'Gesamte Sprachen',
    'languageSwitcher.selectLanguage': 'Sprache Auswählen',
    'emotions.trust': 'Vertrauen',
    'emotions.excitement': 'Aufregung',
    'pages.wealth-building.title': 'Dauerhaften Wohlstand mit Bewährten Strategien Aufbauen',
    'pages.wealth-building.cta.button': 'Beginnen Sie Ihre Wohlstandsreise',
  },

  // Hindi translations
  hi: {
    'ui.common.siteName': 'फाइंडावाइज साम्राज्य',
    'ui.common.allRightsReserved': 'सभी अधिकार सुरक्षित।',
    'ui.common.loading': 'लोड हो रहा है...',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.analytics': 'विश्लेषण',
    'nav.localization': 'स्थानीयकरण',
    'dashboard.localization.title': 'स्थानीयकरण डैशबोर्ड',
    'dashboard.localization.subtitle': 'अनुवाद और बहुभाषी सामग्री प्रबंधित करें',
    'dashboard.localization.totalLanguages': 'कुल भाषाएं',
    'languageSwitcher.selectLanguage': 'भाषा चुनें',
    'emotions.trust': 'विश्वास',
    'emotions.excitement': 'उत्साह',
    'pages.wealth-building.title': 'सिद्ध रणनीतियों के साथ स्थायी धन निर्माण',
    'pages.wealth-building.cta.button': 'अपनी धन यात्रा शुरू करें',
  },

  // Chinese (Simplified) translations
  zh: {
    'ui.common.siteName': 'Findawise帝国',
    'ui.common.allRightsReserved': '版权所有。',
    'ui.common.loading': '加载中...',
    'nav.dashboard': '仪表板',
    'nav.analytics': '分析',
    'nav.localization': '本地化',
    'dashboard.localization.title': '本地化仪表板',
    'dashboard.localization.subtitle': '管理翻译和多语言内容',
    'dashboard.localization.totalLanguages': '总语言数',
    'languageSwitcher.selectLanguage': '选择语言',
    'emotions.trust': '信任',
    'emotions.excitement': '兴奋',
    'pages.wealth-building.title': '用经过验证的策略建立持久财富',
    'pages.wealth-building.cta.button': '开始你的财富之旅',
  },

  // Japanese translations
  ja: {
    'ui.common.siteName': 'Findawise帝国',
    'ui.common.allRightsReserved': '全著作権所有。',
    'ui.common.loading': '読み込み中...',
    'nav.dashboard': 'ダッシュボード',
    'nav.analytics': '分析',
    'nav.localization': 'ローカライゼーション',
    'dashboard.localization.title': 'ローカライゼーションダッシュボード',
    'dashboard.localization.subtitle': '翻訳と多言語コンテンツを管理',
    'dashboard.localization.totalLanguages': '総言語数',
    'languageSwitcher.selectLanguage': '言語を選択',
    'emotions.trust': '信頼',
    'emotions.excitement': '興奮',
    'pages.wealth-building.title': '実証済みの戦略で持続可能な富を築く',
    'pages.wealth-building.cta.button': 'あなたの富の旅を始める',
  },
};

export const supportedLanguages = [
  { code: 'en', name: 'English', isActive: true, isDefault: true },
  { code: 'es', name: 'Español', isActive: true, isDefault: false },
  { code: 'fr', name: 'Français', isActive: true, isDefault: false },
  { code: 'de', name: 'Deutsch', isActive: true, isDefault: false },
  { code: 'hi', name: 'हिन्दी', isActive: true, isDefault: false },
  { code: 'zh', name: '中文', isActive: true, isDefault: false },
  { code: 'ja', name: '日本語', isActive: true, isDefault: false },
  { code: 'pt', name: 'Português', isActive: false, isDefault: false },
  { code: 'ru', name: 'Русский', isActive: false, isDefault: false },
  { code: 'ar', name: 'العربية', isActive: false, isDefault: false },
];