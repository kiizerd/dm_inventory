const normalizeFuelType = (value?: string | null): string => {
  const text = (value ?? '').toLowerCase();

  if (/diesel/i.test(text)) return 'diesel';
  if (/hybrid/i.test(text) || /electric/i.test(text) && /gas/i.test(text)) return 'hybrid';
  if (/electric/i.test(text)) return 'electric';
  if (/gas|gasoline|flex fuel/i.test(text)) return 'gasoline';

  return 'unknown';
};

export { normalizeFuelType };
