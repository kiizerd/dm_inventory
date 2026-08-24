const normalizeBodyStyle = (value?: string | null): string | undefined => {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';
  const text = normalizedValue.toLowerCase();
  if (!text) return undefined;

  if (/sport utility|sports activity|crossover|suv/.test(text)) return 'SUV';
  if (/crew cab|crewmax|double cab|supercrew|pickup|truck/.test(text)) return 'Truck';
  if (/passenger van|minivan|cargo van|van/.test(text)) return 'Van';
  if (/hatchback/.test(text)) return 'Hatchback';
  if (/sedan/.test(text)) return 'Sedan';
  if (/coupe/.test(text)) return 'Coupe';

  return normalizedValue || undefined;
};

export { normalizeBodyStyle };