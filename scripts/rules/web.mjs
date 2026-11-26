// Web markup rules: HTML, JSX/TSX (not React Native), Vue, Svelte, Astro.
import { findTags, elementContent, visibleText } from '../lib/source.mjs';

const LOWER = /^[a-z][a-z0-9-]*$/; // native elements only; components start with a capital
const has = (attrs, ...names) => names.some((n) => attrs.has(n.toLowerCase()));
const val = (attrs, name) => {
  const a = attrs.get(name.toLowerCase());
  if (!a) return undefined;
  return typeof a.value === 'string' ? a.value.replace(/^\{\s*["'`]?|["'`]?\s*\}$/g, '') : a.value;
};
const CLICK = ['onclick', '@click', 'v-on:click', 'on:click', '(click)'];
const NAMED = ['aria-label', 'aria-labelledby', 'title'];

export default [
  {
    id: 'web/img-alt',
    title: 'Image without an alt attribute',
    severity: 'error', tier: 'Required', sc: '1.1.1',
    fix: 'Add alt="" if decorative, or alt text that says what the image means here. Inside a link or button, describe the destination or action.',
    ref: 'references/content/images-and-charts.md',
    check({ text }) {
      return findTags(text, /^img$/)
        .filter((t) => !t.attrs.spread && !has(t.attrs, 'alt', 'aria-label', 'aria-labelledby') && val(t.attrs, 'role') !== 'presentation' && val(t.attrs, 'aria-hidden') !== 'true')
        .map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/img-alt-meaningless',
    title: 'Alt text that says nothing (file name, "image", "photo")',
    severity: 'warn', tier: 'Required', sc: '1.1.1',
    fix: 'Describe what the image means in this context, or use alt="" if it is decorative.',
    ref: 'references/content/images-and-charts.md',
    check({ text }) {
      return findTags(text, /^img$/).filter((t) => {
        const a = val(t.attrs, 'alt');
        if (typeof a !== 'string' || t.attrs.get('alt').expr) return false;
        return /^\s*(image|img|photo|picture|graphic|icon|logo|banner|untitled|spacer)\s*\d*\s*$/i.test(a) || /\.(png|jpe?g|gif|svg|webp|avif)\s*$/i.test(a);
      }).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/click-on-non-interactive',
    title: 'Click handler on a non-interactive element',
    severity: 'error', tier: 'Required', sc: '2.1.1, 4.1.2',
    fix: 'Use <button type="button"> for actions or <a href> for navigation. If you truly cannot, add role, tabindex="0" and Enter/Space key handlers.',
    ref: 'references/components/button.md',
    check({ text }) {
      return findTags(text, /^(div|span|li|p|section|article|td|tr|img|svg|label|h[1-6]|i|b|strong|em|header|footer|main|aside|figure)$/)
        .filter((t) => has(t.attrs, ...CLICK) && !has(t.attrs, 'role') && !has(t.attrs, 'tabindex'))
        .map((t) => ({ index: t.start, message: `<${t.name}> has a click handler but no role or keyboard access.` }));
    },
  },
  {
    id: 'web/role-button-not-focusable',
    title: 'role="button" (or link) on an element that cannot get keyboard focus',
    severity: 'error', tier: 'Required', sc: '2.1.1',
    fix: 'Use a real <button>. Otherwise add tabindex="0" and handle Enter and Space.',
    ref: 'references/components/button.md',
    check({ text }) {
      return findTags(text, /^(div|span|li|p|td|img|svg|i)$/)
        .filter((t) => /^(button|link|checkbox|switch|tab|menuitem|option|radio)$/.test(String(val(t.attrs, 'role'))) && !has(t.attrs, 'tabindex'))
        .map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/anchor-as-button',
    title: 'Link used as a button (no href, "#" or "javascript:")',
    severity: 'error', tier: 'Required', sc: '4.1.2, 2.1.1',
    fix: 'Actions on this page are <button type="button">. Links need a real href that goes somewhere.',
    ref: 'references/components/link.md',
    check({ text }) {
      return findTags(text, /^a$/).filter((t) => {
        if (t.attrs.spread) return false;
        const href = val(t.attrs, 'href');
        const click = has(t.attrs, ...CLICK);
        if (href === undefined && !has(t.attrs, ':href', 'v-bind:href', 'routerlink', 'to')) return click;
        return click && typeof href === 'string' && /^(#|javascript:)/i.test(href.trim());
      }).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/positive-tabindex',
    title: 'Positive tabindex',
    severity: 'error', tier: 'Required', sc: '2.4.3',
    fix: 'Use tabindex="0" (or none) and fix the order in the source instead.',
    ref: 'references/foundations/focus.md',
    check({ text }) {
      const out = [];
      const re = /tab[iI]ndex\s*=\s*(?:\{\s*)?["']?\s*([1-9]\d*)/g;
      let m;
      while ((m = re.exec(text))) out.push({ index: m.index });
      return out;
    },
  },
  {
    id: 'web/viewport-zoom-disabled',
    title: 'Viewport blocks zooming',
    severity: 'error', tier: 'Required', sc: '1.4.4',
    fix: 'Remove user-scalable=no and maximum-scale=1 from the viewport meta tag. To stop iOS input zoom, use 16px+ input text instead.',
    ref: 'references/foundations/typography.md',
    check({ text }) {
      return findTags(text, /^meta$/).filter((t) => {
        const c = String(val(t.attrs, 'content') || '');
        return val(t.attrs, 'name') === 'viewport' && (/user-scalable\s*=\s*(no|0)/i.test(c) || /maximum-scale\s*=\s*(1(\.0+)?|0?\.\d+)\b/i.test(c));
      }).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/html-lang',
    title: '<html> without a lang attribute',
    severity: 'error', tier: 'Required', sc: '3.1.1',
    fix: 'Add the page language, for example <html lang="en">.',
    ref: 'references/structure.md',
    check({ text, ext }) {
      if (!['.html', '.htm'].includes(ext)) return [];
      return findTags(text, /^html$/).filter((t) => !has(t.attrs, 'lang', ':lang')).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/form-field-label',
    title: 'Form field without a label',
    severity: 'error', tier: 'Required', sc: '1.3.1, 3.3.2, 4.1.2',
    fix: 'Add a visible <label for="id"> (or wrap the field in <label>). A placeholder is not a label.',
    ref: 'references/components/text-field.md',
    check({ text }) {
      const fields = findTags(text, /^(input|select|textarea)$/);
      return fields.filter((t) => {
        if (t.attrs.spread) return false;
        const type = String(val(t.attrs, 'type') || 'text').toLowerCase();
        if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) return false;
        if (has(t.attrs, ...NAMED)) return false;
        const id = val(t.attrs, 'id');
        if (typeof id === 'string' && id && new RegExp(`(?:for|htmlFor|html-for)\\s*=\\s*["'{]\\s*["'\`]?${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'\`]?`, 'i').test(text)) return false;
        const before = text.slice(Math.max(0, t.start - 600), t.start);
        if (before.lastIndexOf('<label') > before.lastIndexOf('</label>')) return false;
        return true;
      }).map((t) => ({
        index: t.start,
        message: has(t.attrs, 'placeholder') ? `<${t.name}> has a placeholder but no label. Placeholders disappear and are not labels.` : `<${t.name}> has no label.`,
      }));
    },
  },
  {
    id: 'web/button-name',
    title: 'Button with no accessible name',
    severity: 'error', tier: 'Required', sc: '4.1.2, 1.1.1',
    fix: 'Give icon-only buttons aria-label="<action>" and hide the icon (aria-hidden="true" focusable="false").',
    ref: 'references/components/button.md',
    check({ text }) {
      return findTags(text, /^button$/).filter((t) => {
        if (t.attrs.spread || has(t.attrs, ...NAMED, 'value')) return false;
        const inner = elementContent(text, t);
        if (/sr-only|visually-hidden|visuallyhidden|screen-reader/i.test(inner)) return false;
        if (/<img[^>]*\salt\s*=\s*["'][^"']+["']/i.test(inner)) return false;
        if (/<[A-Z][\w.]*(Message|Trans|Text|Label|T)\b/.test(inner)) return false; // i18n components render text
        if (/<[A-Z][\w.]*[^>]*\s(label|title|text|children)=/i.test(inner)) return false;
        const textOnly = inner.replace(/<[^>]*>/g, '');
        if (/\{[^}]*\}/.test(textOnly)) return false; // an expression may render text
        return textOnly.replace(/&nbsp;/g, '').trim() === '';
      }).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/aria-hidden-focusable',
    title: 'aria-hidden="true" on a focusable element',
    severity: 'error', tier: 'Required', sc: '4.1.2, 1.3.1',
    fix: 'Never hide focusable elements from assistive technology. Remove aria-hidden, or use inert / hidden to remove it for everyone.',
    ref: 'references/structure.md',
    check({ text }) {
      return findTags(text, /^(a|button|input|select|textarea|summary|div|span)$/).filter((t) => {
        if (String(val(t.attrs, 'aria-hidden')) !== 'true') return false;
        if (['button', 'input', 'select', 'textarea', 'summary'].includes(t.name)) return val(t.attrs, 'tabindex') !== '-1';
        if (t.name === 'a') return has(t.attrs, 'href') && val(t.attrs, 'tabindex') !== '-1';
        const ti = val(t.attrs, 'tabindex');
        return ti !== undefined && ti !== '-1';
      }).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/iframe-title',
    title: 'iframe without a title',
    severity: 'error', tier: 'Required', sc: '4.1.2',
    fix: 'Add title="<what this frame contains>".',
    ref: 'references/platforms/web.md',
    check({ text }) {
      return findTags(text, /^iframe$/).filter((t) => !t.attrs.spread && !has(t.attrs, 'title', 'aria-label', 'aria-labelledby') && String(val(t.attrs, 'aria-hidden')) !== 'true').map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/media-autoplay',
    title: 'Media that autoplays with sound or without controls',
    severity: 'warn', tier: 'Required', sc: '1.4.2, 2.2.2',
    fix: 'Avoid autoplay. If you must, make it muted, give it controls (pause), and respect prefers-reduced-motion.',
    ref: 'references/content/media.md',
    check({ text }) {
      return findTags(text, /^(video|audio)$/)
        .filter((t) => has(t.attrs, 'autoplay', 'autoPlay') && (!has(t.attrs, 'muted') || !has(t.attrs, 'controls')))
        .map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/video-captions',
    title: '<video> without a captions track',
    severity: 'warn', tier: 'Required', sc: '1.2.2',
    fix: 'Add <track kind="captions" srclang="en" label="English" src="…vtt">, unless the video has no speech or meaningful sound, or captions are burned in.',
    ref: 'references/content/media.md',
    check({ text }) {
      return findTags(text, /^video$/)
        .filter((t) => !t.attrs.spread && !has(t.attrs, 'muted') && !/kind\s*=\s*["'](captions|subtitles)["']/i.test(elementContent(text, t)))
        .map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/vague-link-text',
    title: 'Link text that makes no sense on its own',
    severity: 'warn', tier: 'Required', sc: '2.4.4',
    fix: 'Write link text that names the destination ("Read the pricing guide"), or add context with aria-label that starts with the visible text.',
    ref: 'references/components/link.md',
    check({ text }) {
      return findTags(text, /^a$/).filter((t) => {
        if (has(t.attrs, 'aria-label', 'aria-labelledby', 'aria-describedby')) return false;
        return /^(click here|here|read more|more|learn more|this|link|details|continue|go)\.?$/i.test(visibleText(elementContent(text, t)));
      }).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/autocomplete-missing',
    title: 'Personal-data field without autocomplete',
    severity: 'warn', tier: 'Required', sc: '1.3.5',
    fix: 'Add the matching autocomplete token: email, tel, given-name, family-name, name, street-address, postal-code, country-name, bday, username, current-password, new-password, one-time-code.',
    ref: 'references/components/text-field.md',
    check({ text }) {
      return findTags(text, /^input$/).filter((t) => {
        if (t.attrs.spread || has(t.attrs, 'autocomplete', 'autoComplete')) return false;
        const type = String(val(t.attrs, 'type') || '').toLowerCase();
        const key = `${val(t.attrs, 'name') || ''} ${val(t.attrs, 'id') || ''}`.toLowerCase();
        return ['email', 'tel', 'password'].includes(type) || /\b(e-?mail|phone|mobile|tel|postcode|postal|zip|first.?name|last.?name|given.?name|family.?name|full.?name|surname|street|address|city|country|birth|dob|username|otp|one.?time)\b/.test(key.replace(/[_-]/g, ' '));
      }).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/heading-skip',
    title: 'Heading level skipped',
    severity: 'info', tier: 'Recommended', sc: '1.3.1',
    fix: 'Choose heading levels by the page outline (h1 → h2 → h3) and style them with classes.',
    ref: 'references/foundations/typography.md',
    check({ text }) {
      const out = [];
      let prev = 0;
      for (const t of findTags(text, /^h[1-6]$/)) {
        const lvl = Number(t.name[1]);
        if (prev && lvl > prev + 1) out.push({ index: t.start, message: `h${prev} followed by h${lvl}.` });
        prev = lvl;
      }
      return out;
    },
  },
  {
    id: 'web/dialog-name',
    title: 'Dialog without an accessible name',
    severity: 'warn', tier: 'Required', sc: '4.1.2',
    fix: 'Add aria-labelledby pointing at the dialog title (or aria-label).',
    ref: 'references/components/dialog-and-sheet.md',
    check({ text }) {
      return findTags(text, /^[a-z][\w-]*$/)
        .filter((t) => (t.name === 'dialog' || /^(dialog|alertdialog)$/.test(String(val(t.attrs, 'role')))) && !t.attrs.spread && !has(t.attrs, 'aria-label', 'aria-labelledby'))
        .map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/moving-elements',
    title: '<marquee> or <blink>',
    severity: 'error', tier: 'Required', sc: '2.2.2',
    fix: 'Remove it. Moving or blinking content needs a pause control; these elements have none.',
    ref: 'references/foundations/motion.md',
    check({ text }) {
      return findTags(text, /^(marquee|blink)$/).map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'web/outline-none-class',
    title: 'Focus outline removed with a utility class and no visible replacement',
    severity: 'error', tier: 'Required', sc: '2.4.7',
    fix: 'Keep a visible focus style: e.g. "focus-visible:outline-2 focus-visible:outline-offset-2" or a focus-visible ring.',
    ref: 'references/foundations/focus.md',
    check({ text }) {
      const out = [];
      const re = /class(?:Name)?\s*=\s*(?:\{\s*)?["'`]([^"'`]*)["'`]/g;
      let m;
      while ((m = re.exec(text))) {
        const cls = m[1];
        if (/(^|\s)(focus:)?outline-(none|0)(\s|$)/.test(cls) && !/(focus-visible:|focus:ring|focus:outline-(?!none)|focus:border|focus:shadow|focus-within:)/.test(cls)) out.push({ index: m.index });
      }
      return out;
    },
  },
];
