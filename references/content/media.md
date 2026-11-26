# Audio and video

> Speech gets captions, important visuals get audio description, audio gets a transcript, nothing plays sound by itself, and the player works with a keyboard and a screen reader.

## What's required
| Content | Level A | Level AA | Recommended |
|---|---|---|---|
| Prerecorded video with sound | **Captions** (1.2.2) + audio description **or** a full text alternative (1.2.3) | **Audio description** (1.2.5) | Descriptive transcript |
| Live video with sound | — | **Live captions** (1.2.4) | — |
| Prerecorded audio only (podcast, voice note) | **Transcript** (1.2.1) | — | Transcript with speaker names |
| Prerecorded silent video | Transcript **or** audio track describing it (1.2.1) | — | — |
| Any media | Autoplaying sound over 3 s can be paused/stopped or has its own volume (1.4.2); moving content over 5 s can be paused (2.2.2); no flashing over 3/s (2.3.1) | — | No autoplay at all |

## Captions
- Text for **speech, speaker changes and meaningful sounds** ("[door slams]", "[upbeat music]"), synchronised.
- **Automatic captions don't count unless a person has checked them.** They change numbers and drop "not". Always review.
- Format: **WebVTT** (`.vtt`) on the web; speaker names with `<v Name>`. Native players accept WebVTT, SRT or embedded tracks.
- Closed captions (user can toggle) by default. Respect the user's caption style settings (size, colour, background); don't hard-code caption styling.
- Burned-in (open) captions on social video are fine for sighted viewers but aren't readable by screen readers or adjustable; provide a text alternative too.

## Audio description
- Describes **important visual information** that the soundtrack doesn't: on-screen text, names, actions, chart contents, scene changes. Present tense, neutral voice, in the gaps.
- **Cheapest route: write it into the script.** If the presenter says what's on screen ("As you can see on this chart, sales doubled…"), no separate description is needed.
- Otherwise: a described audio track, a WebVTT `kind="descriptions"` track read by the player, or a separate described version.
- Not needed for a talking head with no important visuals.

## Transcripts
- Speech + meaningful sounds; a **descriptive** transcript adds visual information (needed by Deaf-blind people, who use braille).
- Put it on the same page, right under or next to the media, or one clearly labelled link away.
- Plain HTML or text, with speaker names and paragraphs; timestamps optional.

## The player
| Requirement | SC |
|---|---|
| All controls work by keyboard (Space/Enter on buttons, arrows on sliders), switch and voice | 2.1.1 |
| Every control has a name (Play, Mute, Captions, Full screen) and state (pressed, volume value) | 4.1.2 |
| Visible focus; controls 3:1; text 4.5:1 | 2.4.7, 1.4.11, 1.4.3 |
| A captions button; captions on/off and style respected | 1.2.2 |
| No autoplay with sound; autoplay respects reduced motion and the system's autoplay setting | 1.4.2, 2.2.2 |
| Controls don't auto-hide while focused or while a screen reader is running | 2.2.1 |
| Speed control and interactive transcript | Recommended |

- **Web:** native `<video controls>` with `<track kind="captions" srclang="en" label="English" src="…vtt" default>`, or an accessible player (Able Player, Video.js with its accessibility settings checked, OzPlayer). Custom players are a big job.
- **iOS:** `AVPlayerViewController` / SwiftUI `VideoPlayer` give accessible controls, caption and audio-description track selection from the user's settings, and Dim Flashing Lights support.
- **Android:** Media3 / ExoPlayer `PlayerView` with subtitle tracks; caption style from `CaptioningManager`.
- **React Native:** `react-native-video` with native controls and text tracks; label any custom overlay controls.
- **Flutter:** `video_player` + `chewie` (or similar) with closed captions; label custom controls with `Semantics`.

## Audio cues and alerts
- Never only sound: pair it with visible text and, on mobile, haptics (Apple recommends both).
- Background music under speech should be quiet (AAA 1.4.7 suggests 20 dB lower) or removable.

## Sources
W3C WAI: Making Audio and Video Media Accessible (captions, description, transcripts, player); WCAG 2.2 (1.2.x, 1.4.2, 2.2.2, 2.3.1); Apple HIG Accessibility (hearing, autoplay, Dim Flashing Lights).
