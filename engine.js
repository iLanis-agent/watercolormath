// Watercolor math: wash water, dilution and mixes - exact arithmetic, labeled craft norms.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Watercolormath = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const round = x => Math.round(x * 100) / 100;

  function washBand(mL) {
    if (mL < 5) return 'a thimble - just a detail pass (labeled)';
    if (mL < 20) return 'a small puddle (labeled)';
    if (mL < 60) return 'a working puddle (labeled)';
    return 'a full well - mix it in a jar (labeled)';
  }
  function consistencyBand(paintParts, waterParts) {
    const r = paintParts / waterParts; // paint per water
    if (r <= 1 / 6) return 'a tea wash - barely tinted water (labeled)';
    if (r <= 1 / 3) return 'coffee - light but present (labeled)';
    if (r <= 1) return 'milk - the middle wash (labeled)';
    if (r <= 2) return 'cream - rich and slow to move (labeled)';
    return 'butter - nearly straight pigment (labeled)';
  }

  // areaCm2 to cover, layers, coverageCm2PerMl (labeled norm ~100 for sized paper)
  function wash(areaCm2, layers, coverageCm2PerMl) {
    if (!(areaCm2 > 0)) throw new Error('area must be positive');
    if (!(layers >= 1)) throw new Error('at least one layer');
    if (!(coverageCm2PerMl >= 10 && coverageCm2PerMl <= 500)) throw new Error('coverage outside the labeled 10-500 cm2/mL band');
    const waterMl = round(areaCm2 * layers / coverageCm2PerMl);
    return { waterMl, verdict: washBand(waterMl) };
  }

  // current paint:water -> target paint:water, per part of paint
  function dilute(paintParts, waterPartsNow, waterPartsTarget) {
    if (!(paintParts > 0)) throw new Error('paint parts must be positive');
    if (!(waterPartsNow >= 0)) throw new Error('current water parts cannot be negative');
    if (!(waterPartsTarget > waterPartsNow)) throw new Error('target must be weaker than the current wash');
    if (waterPartsTarget > 50 * paintParts) throw new Error('past 1:50 there is no color left (labeled)');
    const addWaterPerPaintPart = round((waterPartsTarget - waterPartsNow) / paintParts);
    return { addWaterPerPaintPart, from: consistencyBand(paintParts, waterPartsNow), to: consistencyBand(paintParts, waterPartsTarget) };
  }

  // mix two colors by parts, and split a target total
  function mix(partsA, partsB, totalMl) {
    if (!(partsA > 0)) throw new Error('first color parts must be positive');
    if (!(partsB > 0)) throw new Error('second color parts must be positive');
    if (!(totalMl > 0)) throw new Error('total must be positive');
    const sum = partsA + partsB;
    const mlA = round(totalMl * partsA / sum);
    const mlB = round(totalMl - mlA);
    const pctA = Math.round(1000 * partsA / sum) / 10;
    return { mlA, mlB, pctA, pctB: Math.round((100 - pctA) * 10) / 10 };
  }

  return { wash, dilute, mix, consistencyBand };
});
