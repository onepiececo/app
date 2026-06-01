# FileUpload

Source: [`src/components/ui/file-upload.tsx`](../../src/components/ui/file-upload.tsx).
Built on [react-dropzone](https://react-dropzone.js.org/) (v15) with our
own `Empty` / `Avatar` / `Card` / `Button` / `Badge` chrome on top.

A drop-or-click file picker that emits `File[]`. Two surfaces:

1. **`<FileUpload>`** — the all-in-one component for the standard
   "dropzone + selected files list" pattern. Covers single + multi,
   list or grid layout, inline rejection display.
2. **`useFileUpload()`** — the same selection state but exposed as a
   hook, so you can build custom layouts (avatar pickers, gallery
   tables, drag-into-form-row patterns) without touching the chrome.

The component **does not upload anything**. It hands you `File[]`; the
actual upload pipeline (signed URL → PUT → progress → server-side
processing) is the consumer's responsibility. Reach for a managed
service (UploadThing, Uppy + Tus, etc.) if you want a turnkey backend
— this primitive is deliberately layer-of-abstraction-below that.

## Why react-dropzone

- Drag handlers (`onDragEnter` / `Over` / `Leave` / `Drop`) and the
  hidden `<input type="file">` work are thoroughly handled, including
  edge cases (paste, keyboard activation, programmatic `open()`).
- Validation (mime type, max size, max files) returns structured
  `FileRejection[]` instead of strings.
- ~10KB, ~5M weekly downloads, headless — zero opinion on UI, which
  matches our "design system on top of base-ui-style primitives" model.

## Quick start

```tsx
import { FileUpload } from "@/components/ui/file-upload";

const [files, setFiles] = useState<File[]>([]);

<FileUpload value={files} onValueChangeAction={setFiles} multiple maxFiles={5} />
```

That's the entire baseline: a dashed-border dropzone with empty-state
icon, "Drop files or click to upload" copy, and a "Browse files" button
that's just a visual cue (the whole drop area is the click target).
Files appear as a vertical list of card-rows below the dropzone with a
remove button on each.

## Props (`FileUpload`)

```ts
type FileUploadProps = {
  value?: File[];                                 // controlled value
  defaultValue?: File[];                          // initial uncontrolled value
  onValueChangeAction?: (files: File[]) => void;  // fires for any state change
  onFilesAddedAction?: (added: File[]) => void;   // only the freshly added files
  onFilesRejectedAction?: (rejections: FileRejection[]) => void;

  multiple?: boolean;                             // default false
  accept?: Accept;                                // react-dropzone Accept map
  maxSize?: number;                               // bytes
  maxFiles?: number;
  disabled?: boolean;

  layout?: "list" | "grid";                       // default "list"
  preview?: boolean;                              // image thumbnails. default true
  hideDropzoneWhenFilled?: boolean;               // single-file replace pattern

  title?: ReactNode;                              // override empty-state heading
  description?: ReactNode;                        // override empty-state subline

  className?: string;
  dropzoneClassName?: string;
  listClassName?: string;

  id?: string;
  name?: string;
};
```

`accept` follows react-dropzone's shape:

```ts
accept={{
  "image/*": [],                                  // any image
  "application/pdf": [".pdf"],                    // explicit extension
  "application/zip": [".zip", ".tar.gz"],
}}
```

## Hook (`useFileUpload`)

```ts
const upload = useFileUpload({
  accept: { "image/*": [] },
  maxSize: 2 * 1024 * 1024,
  multiple: false,
  onFilesAddedAction: (added) => { /* … */ },
});

upload.files;            // File[]
upload.add(files);       // append to selection (respects multiple + maxFiles)
upload.remove(file);     // remove a specific file
upload.clear();          // wipe selection + rejections
upload.rejections;       // FileRejection[] from the last drop
upload.getRootProps();   // spread on the drop target
upload.getInputProps();  // spread on a hidden <input type="file">
upload.isDragActive;     // pointer is over the drop target with valid files
upload.isDragReject;     // pointer is over with files that fail accept/size
upload.open();           // programmatic file dialog (use on Browse buttons)
```

The hook accepts every `useDropzone` option (`noClick`, `noKeyboard`,
`noDrag`, etc.) plus our `value` / `defaultValue` / `onValueChangeAction` /
`onFilesAddedAction` / `onFilesRejectedAction`. Use it whenever the all-in-one
`<FileUpload>` chrome doesn't fit (avatar pickers, custom drop zones
inside a list row, gallery tables).

The `Action` suffix is intentional. This file is a client boundary, and
Next's serializability checks require function props exported from client
entry files to be named `action` or end in `Action`.

## Styling

`fileUploadVariants` is exported for local extension and keeps the
dropzone, list rows, grid cells, rejection copy, and replace row in one
slot recipe. Prefer slot overrides (`dropzoneClassName`, `listClassName`,
or `fileUploadVariants().gridItem()`) over copying long utility strings.

## Helpers (exported)

```ts
formatBytes(bytes: number): string                // "12.3 KB", "4.5 MB"
isImage(file: File): boolean                      // mime starts with "image/"
fileTypeIcon(file: File): LucideIcon              // mime → File / ImageIcon / FileVideo / FileAudio / FileArchive / FileText
usePreviewUrl(file: File | undefined): string | undefined
```

`usePreviewUrl` is the **only** correct way to render an image preview.
It calls `URL.createObjectURL` once per file identity and revokes the
URL on cleanup. Calling `URL.createObjectURL` inline in render leaks
memory **and** causes the AvatarImage to remount every render (which
breaks AvatarFallback's "show on missing image" behavior — a real bug
we hit).

## Examples

### A · Single file (image)

```tsx
const [files, setFiles] = useState<File[]>([]);
<FileUpload
  value={files}
  onValueChangeAction={setFiles}
  accept={{ "image/*": [] }}
  maxSize={5 * 1024 * 1024}
  hideDropzoneWhenFilled
/>
```

`hideDropzoneWhenFilled` collapses the dropzone once a file is picked,
showing just the file row + a "Replace" button on the right that
reopens the file dialog. Use for single-image picker fields.

### B · Multi-file list

```tsx
<FileUpload multiple maxFiles={5} maxSize={10 * 1024 * 1024} value={files} onValueChangeAction={setFiles} />
```

Default layout. Each row carries a leading mime-typed icon (or thumbnail
for images), the filename, a soft Badge with the formatted size, and a
ghost icon-sm remove button.

### C · Image gallery grid

```tsx
<FileUpload
  multiple
  layout="grid"
  accept={{ "image/*": [] }}
  maxFiles={12}
  maxSize={5 * 1024 * 1024}
  value={files}
  onValueChangeAction={setFiles}
/>
```

`layout="grid"` renders thumbnails as 2/3/4-col aspect-square cells
with a hover-reveal remove button + filename overlay.

### D · With Field + validation

```tsx
const [files, setFiles] = useState<File[]>([]);
const [touched, setTouched] = useState(false);
<Field>
  <FieldLabel>Attachments</FieldLabel>
  <FileUpload
    multiple
    maxFiles={5}
    value={files}
    onValueChangeAction={(next) => {
      setTouched(true);
      setFiles(next);
    }}
  />
  <FieldError match={touched && files.length === 0}>
    Attach at least one file.
  </FieldError>
</Field>
```

Track a `touched` flag so the error doesn't show on initial mount —
flip it on the first `onValueChangeAction` so the "validate after first
interaction" pattern kicks in.

### E · Avatar picker via the hook

```tsx
const [file, setFile] = useState<File>();
const upload = useFileUpload({
  accept: { "image/*": [] },
  maxSize: 2 * 1024 * 1024,
  multiple: false,
  noClick: true,                     // no auto-click on the drop target
  onFilesAddedAction: (added) => {
    if (added[0]) setFile(added[0]);
  },
});
const previewUrl = usePreviewUrl(file);

<div className="flex items-center gap-4">
  <div {...upload.getRootProps()} className="cursor-pointer rounded-full">
    <input {...upload.getInputProps()} />
    <Avatar size="2xl" shape="circle">
      {previewUrl ? <AvatarImage src={previewUrl} alt="Profile" /> : null}
      <AvatarFallback tone="neutral"><Camera /></AvatarFallback>
    </Avatar>
  </div>
  <div className="flex items-center gap-2">
    <Button size="sm" variant="outline" onClick={upload.open}>
      {file ? "Change" : "Upload"}
    </Button>
    {file ? (
      <Button size="sm" variant="ghost" onClick={() => setFile(undefined)}>
        Remove
      </Button>
    ) : null}
  </div>
</div>
```

`noClick: true` keeps the wrapping div from triggering on every avatar
click — the explicit Upload/Change Button calls `upload.open()` itself.
Drag-to-drop on the avatar still works.

## Pitfalls

- **`useFileUpload` requires `noClick: true` if you have a Button
  inside that calls `open()`.** Otherwise the button's click bubbles up
  to the dropzone root, which calls `open()` again, which double-fires
  the file dialog. The default `<FileUpload>` component handles this
  the other way: drops `noClick`, removes the Button's own `onClick`,
  relies on bubbling for a single open.
- **Always use `usePreviewUrl(file)` for image previews.** Inline
  `URL.createObjectURL(file)` in render leaks memory and breaks
  AvatarImage / AvatarFallback. The hook revokes URLs on cleanup.
- **`FieldError match={files.length === 0}` shows on initial mount.**
  Track a `touched` boolean and gate the match: `match={touched &&
  files.length === 0}`.
- **File equality is by `(name, size, lastModified)`.** Two `File`
  references with the same triple count as the same file (so
  re-dropping the same file is a no-op). This matches what
  `react-dropzone` does internally.
- **`value` is **not** persisted across navigations.** `File` objects
  reference browser-side blob memory and can't be serialized. If you
  need server-roundtrip persistence (re-edit a previously-uploaded
  file list), keep your own `{ name, size, url }` metadata array
  alongside and rebuild the list from there — don't try to feed it to
  `value`.
- **Rejections aggregate by error message.** When 5 files all fail
  "Too many files," the rejection list shows one line: `Too many files
  — 5 files rejected`. If you need per-file detail, read
  `onFilesRejectedAction(rejections)` directly and render your own UI.
- **`accept`'s value array can be empty.** `{ "image/*": [] }` means
  "accept any image, no extension restriction." This is the common case
  — extensions are only needed when the consumer wants to restrict
  *within* a wildcard mime type.
- **`<FileUpload>` is `"use client"`.** It uses react-dropzone's hooks
  + our state, so it can't render in a Server Component.

## Rules of thumb

- **Default to `<FileUpload>`** unless you genuinely need a custom
  layout. The 5 examples above cover ~90% of product needs.
- **Reach for `useFileUpload`** when the layout breaks the "dropzone +
  list" mental model: avatar pickers, drag-into-table-row, drag-onto-an-
  already-rendered-card patterns.
- **Always pass `accept` and `maxSize`.** No-constraint dropzones are a
  trap — users will drop a 200MB video into a "profile photo" picker
  and get a confused server error. Validate on the client first.
- **Use `hideDropzoneWhenFilled` for single-file pickers.** Once a file
  is chosen, the dropzone becomes redundant — the file row + Replace
  button is the affordance.
- **Wrap in `<Field>` whenever the upload is a form input.** Inherits
  label association + error display + the form-control aria machinery.
- **Don't bake an upload pipeline into the consumer's render tree.**
  Take `File[]` from the component, hand it to a server action / signed
  URL flow / managed service. The primitive stops at selection — keep
  your upload code on the network boundary, not in the React tree.
- **Show a server-side progress UI separately.** Once the user has
  picked files, your form's submit handler should kick off the upload
  and surface progress via a `Progress` component or toast — not
  through `FileUpload` itself. We'll add a controlled `uploadState` prop
  later if a real consumer needs it; v1 stays selection-only.
