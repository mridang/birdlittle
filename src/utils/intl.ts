/**
 * @file Locale-aware text helpers built on the standard `Intl` APIs.
 *
 * Locale-aware text helpers built on the standard `Intl` APIs, so ordering,
 * counts, dates and lists are right for real-world text ("Éclair" sorts with E,
 * "1 recipe" vs "2 recipes", "3 days ago") instead of relying on code-unit
 * comparisons and hand-rolled plural checks.
 *
 * Everything here uses one fixed locale, English. The interface text around
 * these values is English, so mixing in the visitor's locale would produce
 * half-translated sentences, and a fixed locale keeps server and browser output
 * identical (no hydration mismatches, stable API messages). Changing
 * {@link LOCALE} is the single switch if the app is ever translated.
 */

/** The locale used for all formatting. */
const LOCALE = 'en';

const collator = new Intl.Collator(LOCALE, {
  // "Apple" = "apple" = "Äpple" for ordering purposes; ties fall to the caller.
  sensitivity: 'base',
  // "Recipe 2" before "Recipe 10".
  numeric: true,
});

/**
 * Compare two strings the way a person would alphabetise them: accents and case
 * are ignored, and runs of digits compare as numbers. Returns 0 for strings
 * that differ only by accent or case, so callers should break ties themselves.
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns A negative number if `a` sorts first, a positive number if `b` sorts first, or 0 when they tie.
 * @example
 * ['Recipe 10', 'Recipe 2', 'Éclair'].sort(compareText);
 */
export function compareText(a: string, b: string): number {
  return collator.compare(a, b);
}

/**
 * Fold text for searching: lower case with accents removed, so "creme" finds
 * "Crème brûlée". (`Intl` can compare whole strings but has no substring
 * search, so matching uses this folded form with `includes`.).
 * @param text - The text to fold for comparison or searching.
 * @returns The lower-case text with all combining accent marks removed.
 * @example
 * foldText('Crème brûlée').includes(foldText('creme'));
 */
export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replaceAll(/\p{M}+/gu, '')
    .toLowerCase();
}

const plurals = new Intl.PluralRules(LOCALE);
const counts = new Intl.NumberFormat(LOCALE);

/**
 * A count with its noun in the right plural form: `countOf(1, 'recipe')` is
 * "1 recipe", `countOf(2, 'recipe')` is "2 recipes". Pass `many` for nouns that
 * don't just add an "s".
 * @param n - The number being described.
 * @param one - The noun in its singular form, used when `n` is one.
 * @param many - The noun in its plural form, defaulting to the singular with an "s" added.
 * @returns The formatted count followed by the noun in the matching form.
 * @example
 * countOf(2, 'recipe'); // '2 recipes'
 */
export function countOf(n: number, one: string, many = `${one}s`): string {
  return `${counts.format(n)} ${plurals.select(n) === 'one' ? one : many}`;
}

/**
 * A formatter that keeps at most `maxFractionDigits` decimal places.
 * @param maxFractionDigits - The largest number of decimal places the formatter may print.
 * @returns A number formatter with no thousands separators and the given precision cap.
 * @example
 * decimalFormat(2).format(1.2345); // '1.23'
 */
const decimalFormat = (maxFractionDigits: number): Intl.NumberFormat =>
  new Intl.NumberFormat(LOCALE, {
    maximumFractionDigits: maxFractionDigits,
    useGrouping: false,
  });

/** Formatters built once for the precisions in common use (0 to 6 places). */
const COMMON_DECIMALS = Array.from({ length: 7 }, (_, places) =>
  decimalFormat(places),
);

/**
 * A plain decimal for a quantity: at most `maxFractionDigits` places, no
 * trailing zeros and no thousands separators ("0.5", "250", "1.25").
 * @param value - The quantity to format.
 * @param maxFractionDigits - The largest number of decimal places to print, defaulting to 2.
 * @returns The quantity as a plain decimal string.
 * @example
 * formatQuantityNumber(1.256); // '1.26'
 */
export function formatQuantityNumber(
  value: number,
  maxFractionDigits = 2,
): string {
  const format =
    COMMON_DECIMALS[maxFractionDigits] ?? decimalFormat(maxFractionDigits);
  return format.format(value);
}

/** Says a gap in time in words ("yesterday", "in 2 hours"). */
const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

/** Seconds in each unit, largest first, for choosing how to say an age. */
const UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/**
 * How long ago (or from now) a moment is, in words: "yesterday", "3 days ago",
 * "in 2 hours". Anything within a minute is "now".
 * @param when - The moment to describe, as a `Date` or a string that `Date` can parse.
 * @param now - The reference moment to measure from, defaulting to the current time.
 * @returns The gap between `when` and `now` written as a relative phrase.
 * @example
 * relativeTime('2026-11-01T00:00:00Z', new Date('2026-11-04T00:00:00Z')); // '3 days ago'
 */
export function relativeTime(
  when: Date | string,
  now: Date = new Date(),
): string {
  const seconds = (new Date(when).getTime() - now.getTime()) / 1000;
  const magnitude = Math.abs(seconds);
  for (const [unit, size] of UNITS) {
    if (magnitude >= size) {
      return relative.format(Math.round(seconds / size), unit);
    }
  }
  return relative.format(0, 'second');
}

/** Joins items with "and". */
const andList = new Intl.ListFormat(LOCALE, {
  style: 'long',
  type: 'conjunction',
});
/** Joins items with "or". */
const orList = new Intl.ListFormat(LOCALE, {
  style: 'long',
  type: 'disjunction',
});

/**
 * Joins a list of items into one phrase with "and" before the last item.
 * @param items - The items to join, in order.
 * @returns The items joined with commas and a final "and", such as "a, b and c".
 * @example
 * listAnd(['eggs', 'milk', 'flour']); // 'eggs, milk and flour'
 */
export function listAnd(items: readonly string[]): string {
  return andList.format(items);
}

/**
 * Joins a list of items into one phrase with "or" before the last item.
 * @param items - The items to join, in order.
 * @returns The items joined with commas and a final "or", such as "a, b or c".
 * @example
 * listOr(['tea', 'coffee']); // 'tea or coffee'
 */
export function listOr(items: readonly string[]): string {
  return orList.format(items);
}

/** A rating or score, always with one decimal place: "8.0", "7.4". */
const ratings = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** A size in gigabytes, one decimal place at most: "1.5 GB". */
const gigabytes = new Intl.NumberFormat(LOCALE, {
  style: 'unit',
  unit: 'gigabyte',
  unitDisplay: 'short',
  maximumFractionDigits: 1,
});

/** A size in whole megabytes: "640 MB". */
const megabytes = new Intl.NumberFormat(LOCALE, {
  style: 'unit',
  unit: 'megabyte',
  unitDisplay: 'short',
  maximumFractionDigits: 0,
});

/** A share of a whole (0.25) as a percentage with no decimals. */
const percents = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 0,
});

/**
 * Formats a rating or score with exactly one decimal place.
 * @param value - The rating to format.
 * @returns The rating with one decimal place, such as "8.0".
 * @example
 * formatRating(8); // '8.0'
 */
export function formatRating(value: number): string {
  return ratings.format(value);
}

/**
 * Formats a size in gigabytes with one decimal place at most.
 * @param gigabyteCount - The size in gigabytes.
 * @returns The size with its unit, such as "1.5 GB".
 * @example
 * formatGigabytes(1.5); // '1.5 GB'
 */
export function formatGigabytes(gigabyteCount: number): string {
  return gigabytes.format(gigabyteCount);
}

/**
 * Formats a file size in bytes, in gigabytes from 1 GB up and megabytes below.
 * @param bytes - The file size in bytes.
 * @returns The size with its unit, such as "640 MB".
 * @example
 * formatSize(640_000_000); // '640 MB'
 */
export function formatSize(bytes: number): string {
  return bytes >= 1_000_000_000
    ? gigabytes.format(bytes / 1_000_000_000)
    : megabytes.format(bytes / 1_000_000);
}

/**
 * Formats a fraction as a whole-number percentage.
 * @param fraction - The share of a whole, where 1 is the whole.
 * @returns The percentage with no decimal places, such as "26%".
 * @example
 * formatPercent(0.256); // '26%'
 */
export function formatPercent(fraction: number): string {
  return percents.format(fraction);
}

/** Writes an hour of the day (0 to 23) as a clock time: "07:00". */
const hours = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
});

/**
 * Formats an hour of the day as a 24-hour clock time.
 * @param hour - The hour of the day, from 0 to 23.
 * @returns The clock time with two-digit hour and minutes, such as "07:00".
 * @example
 * formatHour(7); // '07:00'
 */
export function formatHour(hour: number): string {
  return hours.format(Date.UTC(1970, 0, 1, hour));
}

/**
 * The locale for dates and times: English with the day before the month ("1
 * November 2026"), the order the interface already uses. It is separate from
 * {@link LOCALE} only for that reason.
 */
const DATE_LOCALE = 'en-GB';

const day = new Intl.DateTimeFormat(DATE_LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const timestamp = new Intl.DateTimeFormat(DATE_LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});

/**
 * Formats a day written out in full, in UTC so it reads the same in every time zone.
 * @param when - An ISO date such as `2026-11-01`, an ISO timestamp, a number of milliseconds or a `Date`.
 * @returns The day spelled out with its month and year, such as "1 November 2026".
 * @example
 * formatDay('2026-11-01'); // '1 November 2026'
 */
export function formatDay(when: Date | string | number): string {
  const date =
    typeof when === 'string' && when.length === 10 ? `${when}T00:00:00Z` : when;
  return day.format(new Date(date));
}

/**
 * Formats a moment as a short date and time in UTC.
 * @param when - The moment to format, as a `Date`, an ISO string or a number of milliseconds.
 * @returns The date and time in UTC, such as "1 Nov 2026, 10:00".
 * @example
 * formatTimestamp('2026-11-01T10:00:00Z'); // '1 Nov 2026, 10:00'
 */
export function formatTimestamp(when: Date | string | number): string {
  return timestamp.format(new Date(when));
}

const durations = new Intl.DurationFormat(LOCALE, { style: 'narrow' });

/**
 * Formats a length of time in prose from its parts.
 * @param parts - The duration broken into units, such as hours and minutes.
 * @returns The duration written in short form, such as "1h 30m".
 * @example
 * formatDuration({ hours: 1, minutes: 30 }); // '1h 30m'
 */
export function formatDuration(
  parts: Partial<Record<Intl.DurationFormatUnit, number>>,
): string {
  return durations.format(parts);
}

const languages = new Intl.DisplayNames(LOCALE, { type: 'language' });

/**
 * The name of a language from its code. A code that is not a language tag
 * (such as "?") comes back unchanged.
 * @param code - The language code, such as `ja` or `en-GB`.
 * @returns The English name of the language, or the code itself when no name is known.
 * @example
 * languageName('ja'); // 'Japanese'
 */
export function languageName(code: string): string {
  try {
    return languages.of(code) ?? code;
  } catch {
    return code;
  }
}

const words = new Intl.Segmenter(LOCALE, { granularity: 'word' });
const graphemes = new Intl.Segmenter(LOCALE, { granularity: 'grapheme' });

/**
 * Counts how many characters a person sees in a text.
 * @param text - The text to count.
 * @returns The number of visible characters, where an emoji sequence counts as one.
 * @example
 * characterCount('👨‍👩‍👧'); // 1
 */
export function characterCount(text: string): number {
  return [...graphemes.segment(text)].length;
}

/**
 * Cut `text` to at most `limit` visible characters, ending on a whole word, and
 * add an ellipsis if anything was left off. Counts what a person sees, so an
 * emoji or an accented letter is never cut in half.
 * @param text - The text to shorten.
 * @param limit - The largest number of visible characters to keep before the ellipsis.
 * @returns The original text when it fits, otherwise the leading whole words followed by an ellipsis.
 * @example
 * truncate('The quick brown fox', 10); // 'The quick…'
 */
export function truncate(text: string, limit: number): string {
  if (characterCount(text) <= limit) {
    return text;
  }
  let kept = '';
  let used = 0;
  for (const { segment } of words.segment(text)) {
    used += characterCount(segment);
    if (used > limit) {
      break;
    }
    kept += segment;
  }
  return `${kept.trimEnd()}…`;
}
