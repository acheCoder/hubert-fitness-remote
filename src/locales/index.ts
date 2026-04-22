import type { Language } from '../common-submodule/src/i18n/I18nContext';
import { es } from './es';
import { en } from './en';

/**
 * Diccionario centralizado de Huberfit.
 * Se registra una sola vez en el orquestador (HuberfitApp).
 */
export const huberfitTranslations: Record<Language, Record<string, string>> = {
  es,
  en,
};
