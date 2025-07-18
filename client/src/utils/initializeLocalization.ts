// Utility to initialize the localization system with sample data
import { initialTranslationKeys, initialTranslations, supportedLanguages } from '@/data/initialTranslations';

export async function initializeLocalizationSystem() {
  try {
    console.log('🌍 Initializing localization system...');

    // 1. Initialize default languages
    console.log('📋 Setting up languages...');
    await fetch('/api/localization/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    // 2. Create languages
    for (const language of supportedLanguages) {
      try {
        await fetch('/api/languages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(language)
        });
        console.log(`✅ Created language: ${language.name} (${language.code})`);
      } catch (error) {
        console.log(`ℹ️  Language ${language.code} already exists`);
      }
    }

    // 3. Create translation keys in batches
    console.log('🔑 Creating translation keys...');
    try {
      await fetch('/api/translation-keys/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: initialTranslationKeys })
      });
      console.log(`✅ Created ${initialTranslationKeys.length} translation keys`);
    } catch (error) {
      console.log('ℹ️  Translation keys already exist');
    }

    // 4. Create translations for each language
    console.log('📝 Creating translations...');
    for (const [languageCode, translations] of Object.entries(initialTranslations)) {
      for (const [keyPath, translatedValue] of Object.entries(translations)) {
        try {
          // Find the key ID
          const keyResponse = await fetch('/api/translation-keys');
          const keysData = await keyResponse.json();
          const keys = keysData.data || [];
          const key = keys.find((k: any) => k.keyPath === keyPath);
          
          if (key) {
            await fetch('/api/translations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                keyId: key.id,
                languageCode,
                translatedValue,
                isAutoTranslated: false,
                quality: 100
              })
            });
          }
        } catch (error) {
          // Translation might already exist
        }
      }
      console.log(`✅ Created translations for ${languageCode}`);
    }

    // 5. Create sample localized content assignments
    console.log('📄 Creating sample content assignments...');
    const sampleContentAssignments = [
      {
        contentType: 'page',
        contentId: 'wealth-building',
        languageCode: 'es',
        localizedTitle: 'Construye Riqueza Duradera',
        localizedContent: 'Contenido localizado para construcción de riqueza...',
        customTranslations: {
          title: 'Construye Riqueza Duradera con Estrategias Probadas',
          description: 'Descubre métodos probados para crear crecimiento financiero sostenible y alcanzar tus objetivos de construcción de riqueza.',
          keywords: 'construcción de riqueza, crecimiento financiero, estrategias de inversión, ingresos pasivos'
        }
      },
      {
        contentType: 'page',
        contentId: 'health-optimization',
        languageCode: 'fr',
        localizedTitle: 'Optimisez Votre Santé',
        localizedContent: 'Contenu localisé pour l\'optimisation de la santé...',
        customTranslations: {
          title: 'Optimisez Votre Santé pour des Performances Maximales',
          description: 'Transformez votre corps et votre esprit avec des techniques d\'optimisation de la santé basées sur des preuves.',
          keywords: 'optimisation de la santé, bien-être, fitness, nutrition, santé mentale'
        }
      }
    ];

    for (const assignment of sampleContentAssignments) {
      try {
        await fetch('/api/localized-content-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignment)
        });
      } catch (error) {
        // Assignment might already exist
      }
    }

    console.log('🎉 Localization system initialized successfully!');
    return { success: true };

  } catch (error) {
    console.error('❌ Failed to initialize localization system:', error);
    return { success: false, error };
  }
}

// Function to check if localization system is initialized
export async function checkLocalizationStatus() {
  try {
    const languagesResponse = await fetch('/api/languages');
    const languagesData = await languagesResponse.json();
    const languages = languagesData.data || [];

    const keysResponse = await fetch('/api/translation-keys');
    const keysData = await keysResponse.json();
    const keys = keysData.data || [];

    return {
      isInitialized: languages.length > 0 && keys.length > 0,
      languagesCount: languages.length,
      keysCount: keys.length,
      languages: languages.map((lang: any) => ({ code: lang.code, name: lang.name }))
    };
  } catch (error) {
    console.error('Failed to check localization status:', error);
    return { isInitialized: false, error };
  }
}