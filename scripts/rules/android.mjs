// Android rules: Jetpack Compose (.kt/.kts) and XML layouts (res/layout*/*.xml).
import { callArgs, findTags } from '../lib/source.mjs';

const all = (re, text) => {
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push({ index: m.index, match: m });
  return out;
};

export const compose = [
  {
    id: 'compose/icon-button-no-description',
    title: 'IconButton whose Icon has contentDescription = null',
    severity: 'error', tier: 'Required', sc: '1.1.1, 4.1.2',
    fix: 'Icon-only buttons need a name: Icon(…, contentDescription = "<action>"). null is only for decorative icons next to visible text.',
    ref: 'references/components/button.md',
    check({ text }) {
      return all(/\b(IconButton|FilledIconButton|OutlinedIconButton|FilledTonalIconButton|IconToggleButton|FloatingActionButton|SmallFloatingActionButton)\s*\(/g, text).filter(({ index }) => {
        const open = text.indexOf('(', index);
        const args = callArgs(text, open);
        const end = open + args.length + 2;
        const body = text.slice(end, end + 600);
        const lambda = body.trimStart().startsWith('{') ? body.slice(0, body.indexOf('}') + 1 || 600) : '';
        const scope = args + lambda;
        return /contentDescription\s*=\s*null/.test(scope) && !/Text\s*\(/.test(scope) && !/semantics\s*\{[^}]*contentDescription/.test(scope);
      });
    },
  },
  {
    id: 'compose/text-size-in-dp',
    title: 'Text size in dp (doesn\'t follow the user\'s font size)',
    severity: 'error', tier: 'Required', sc: '1.4.4',
    fix: 'Use sp for text (fontSize = 16.sp) or Material typography.',
    ref: 'references/platforms/android.md',
    check({ text }) { return all(/(fontSize|lineHeight)\s*=\s*[\d.]+\.dp\b|\.dp\.toSp\(\)/g, text); },
  },
  {
    id: 'compose/description-includes-role',
    title: 'contentDescription repeats the role',
    severity: 'warn', tier: 'Required', sc: '4.1.2',
    fix: 'Describe the purpose ("Submit"); TalkBack announces the role from Role.',
    ref: 'references/platforms/android.md',
    check({ text }) { return all(/contentDescription\s*=\s*"[^"]*\b(button|image|icon)"/gi, text); },
  },
  {
    id: 'compose/clickable-no-role',
    title: 'clickable without a role or click label',
    severity: 'info', tier: 'Platform', sc: '4.1.2',
    fix: 'Add role = Role.Button (or Checkbox, Switch, Tab…) and onClickLabel when the action isn\'t obvious, so TalkBack says what it is and what it does.',
    ref: 'references/platforms/android.md',
    check({ text }) {
      return all(/\.clickable\s*(\(|\{)/g, text).filter(({ index, match }) => {
        if (match[1] === '{') return true;
        const args = callArgs(text, text.indexOf('(', index));
        return !/\brole\s*=|onClickLabel\s*=/.test(args);
      });
    },
  },
  {
    id: 'compose/assertive-live-region',
    title: 'Assertive live region',
    severity: 'info', tier: 'Platform', sc: '4.1.3',
    fix: 'Use LiveRegionMode.Polite unless the update is urgent; never on timers or fast-changing values.',
    ref: 'references/structure.md',
    check({ text }) { return all(/LiveRegionMode\.Assertive/g, text); },
  },
  {
    id: 'compose/swipe-without-actions',
    title: 'Swipe-to-dismiss with no custom accessibility actions in this file',
    severity: 'warn', tier: 'Required', sc: '2.5.1, 2.5.7',
    fix: 'Expose the swipe as customActions = listOf(CustomAccessibilityAction("Archive") { … }) and offer a visible alternative.',
    ref: 'references/components/list-rows-swipe.md',
    check({ text }) {
      if (/customActions|CustomAccessibilityAction/.test(text)) return [];
      const m = /SwipeToDismissBox|SwipeToDismiss\s*\(|anchoredDraggable|\.swipeable\s*\(/.exec(text);
      return m ? [{ index: m.index }] : [];
    },
  },
];

export const androidXml = [
  {
    id: 'android-xml/image-no-description',
    title: 'ImageView/ImageButton without contentDescription',
    severity: 'error', tier: 'Required', sc: '1.1.1, 4.1.2',
    fix: 'Add android:contentDescription="@string/…" (the action for buttons), or android:importantForAccessibility="no" for decorative images.',
    ref: 'references/platforms/android.md',
    check({ text }) {
      return findTags(text, /^(ImageView|ImageButton|com\.google\.android\.material\.imageview\.ShapeableImageView|androidx\.appcompat\.widget\.AppCompatImageView|androidx\.appcompat\.widget\.AppCompatImageButton|com\.google\.android\.material\.floatingactionbutton\.FloatingActionButton)$/)
        .filter((t) => !t.attrs.has('android:contentdescription') && !/^(no|noHideDescendants)$/.test(String(t.attrs.get('android:importantforaccessibility')?.value || '')))
        .map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'android-xml/text-size-in-dp',
    title: 'android:textSize in dp or px',
    severity: 'error', tier: 'Required', sc: '1.4.4',
    fix: 'Use sp for text sizes.',
    ref: 'references/platforms/android.md',
    check({ text }) { return all(/android:textSize\s*=\s*"[\d.]+(dp|dip|px)"/g, text); },
  },
  {
    id: 'android-xml/description-on-text-button',
    title: 'contentDescription on a view that already has visible text',
    severity: 'warn', tier: 'Required', sc: '2.5.3',
    fix: 'Remove it: it replaces the visible text for TalkBack and breaks Voice Access commands.',
    ref: 'references/components/button.md',
    check({ text }) {
      return findTags(text, /^(Button|TextView|CheckBox|RadioButton|Switch|com\.google\.android\.material\.button\.MaterialButton|com\.google\.android\.material\.materialswitch\.MaterialSwitch)$/)
        .filter((t) => t.attrs.has('android:text') && t.attrs.has('android:contentdescription'))
        .map((t) => ({ index: t.start }));
    },
  },
  {
    id: 'android-xml/edittext-hint-only',
    title: 'EditText labelled only by a hint',
    severity: 'warn', tier: 'Required', sc: '3.3.2, 1.3.1',
    fix: 'Use TextInputLayout (floating label that stays visible) or a visible TextView with android:labelFor.',
    ref: 'references/components/text-field.md',
    check({ text }) {
      if (/TextInputLayout|android:labelFor/.test(text)) return [];
      return findTags(text, /^(EditText|androidx\.appcompat\.widget\.AppCompatEditText)$/)
        .filter((t) => t.attrs.has('android:hint'))
        .map((t) => ({ index: t.start }));
    },
  },
];
