"use client";

import {
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileText,
  FileVideo,
  Image as ImageIcon,
  UploadCloud,
  X,
} from "lucide-react";
import type * as React from "react";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  type Accept,
  type DropzoneOptions,
  type FileRejection,
  useDropzone,
} from "react-dropzone";
import { tv } from "tailwind-variants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyActions,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const fileUploadVariants = tv({
  slots: {
    root: "flex flex-col gap-3",
    dropzone:
      "relative cursor-pointer rounded-xl border border-border border-dashed bg-card transition-[background-color,border-color,box-shadow] hover:bg-[color-mix(in_srgb,var(--foreground)_3%,var(--card))]",
    dropzoneIcon:
      "flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors",
    list: "flex flex-col gap-2",
    grid: "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4",
    replaceRow: "flex justify-end",
    rejections: "flex flex-col gap-1 text-destructive-foreground text-xs",
    rejectionMessage: "font-medium",
    item: "flex items-center gap-3 rounded-lg border border-border bg-card px-2.5 py-2",
    itemIcon:
      "flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
    itemIconSvg: "size-4",
    itemBody: "flex min-w-0 flex-1 items-center gap-2",
    itemName: "min-w-0 truncate font-medium text-sm",
    itemSize: "shrink-0",
    gridItem: "group/cell relative aspect-square overflow-hidden rounded-lg border border-border bg-muted",
    gridImage: "size-full object-cover",
    gridFallback:
      "flex size-full flex-col items-center justify-center gap-1 px-2 text-muted-foreground",
    gridFallbackIcon: "size-6",
    gridFallbackName: "line-clamp-2 text-center text-[10px]",
    gridOverlay:
      "absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover/cell:opacity-100",
    gridRemove:
      "absolute top-1.5 right-1.5 opacity-0 transition-opacity group-hover/cell:opacity-100",
    gridName:
      "absolute right-1.5 bottom-1.5 left-1.5 line-clamp-1 text-[10px] text-white opacity-0 transition-opacity group-hover/cell:opacity-100",
  },
  variants: {
    drag: {
      idle: {},
      active: {
        dropzone:
          "border-foreground/50 bg-[color-mix(in_srgb,var(--foreground)_5%,var(--card))]",
        dropzoneIcon: "bg-foreground/10 text-foreground",
      },
      reject: {
        dropzone:
          "border-destructive bg-[color-mix(in_srgb,var(--destructive)_6%,var(--card))]",
        dropzoneIcon: "bg-destructive/10 text-destructive",
      },
    },
    disabled: {
      true: {
        dropzone: "pointer-events-none opacity-64",
      },
      false: {},
    },
  },
  defaultVariants: {
    disabled: false,
    drag: "idle",
  },
});

const fileUploadStaticStyles = fileUploadVariants();

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / k ** i;
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

export const isImage = (file: File): boolean => file.type.startsWith("image/");

export const fileTypeIcon = (
  file: File,
): React.ComponentType<{ className?: string }> => {
  const t = file.type;
  if (t.startsWith("image/")) return ImageIcon;
  if (t.startsWith("video/")) return FileVideo;
  if (t.startsWith("audio/")) return FileAudio;
  if (
    t === "application/zip" ||
    t === "application/x-tar" ||
    t === "application/gzip" ||
    t === "application/x-7z-compressed" ||
    t === "application/x-rar-compressed"
  )
    return FileArchive;
  if (
    t.startsWith("text/") ||
    t === "application/json" ||
    t === "application/pdf"
  )
    return FileText;
  return FileIcon;
};

const FileTypeIcon = (props: { file: File; className?: string }) => {
  const iconProps = { "aria-hidden": true, className: props.className } as const;
  const t = props.file.type;
  if (t.startsWith("image/")) return <ImageIcon {...iconProps} />;
  if (t.startsWith("video/")) return <FileVideo {...iconProps} />;
  if (t.startsWith("audio/")) return <FileAudio {...iconProps} />;
  if (
    t === "application/zip" ||
    t === "application/x-tar" ||
    t === "application/gzip" ||
    t === "application/x-7z-compressed" ||
    t === "application/x-rar-compressed"
  ) {
    return <FileArchive {...iconProps} />;
  }
  if (
    t.startsWith("text/") ||
    t === "application/json" ||
    t === "application/pdf"
  ) {
    return <FileText {...iconProps} />;
  }
  return <FileIcon {...iconProps} />;
};

const sameFile = (a: File, b: File): boolean =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

const fileKey = (file: File): string =>
  `${file.name}-${file.size}-${file.lastModified}`;

type GroupedRejection = { message: string; names: string[] };

const groupRejections = (rejections: FileRejection[]): GroupedRejection[] => {
  const map = new Map<string, string[]>();
  for (const r of rejections) {
    const message = r.errors.map((e) => e.message).join(", ");
    const list = map.get(message) ?? [];
    list.push(r.file.name);
    map.set(message, list);
  }
  return Array.from(map.entries()).map(([message, names]) => ({
    message,
    names,
  }));
};

type PreviewUrlStore = {
  dispose: () => void;
  getSnapshot: () => string | undefined;
  setFile: (file: File | undefined) => void;
  subscribe: (listener: () => void) => () => void;
};

const getPreviewUrlServerSnapshot = (): undefined => undefined;

const createPreviewUrlStore = (): PreviewUrlStore => {
  let currentFile: File | undefined;
  let currentUrl: string | undefined;
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const revoke = () => {
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentFile = undefined;
    currentUrl = undefined;
  };

  return {
    dispose: revoke,
    getSnapshot: () => currentUrl,
    setFile: (nextFile) => {
      const next = nextFile && isImage(nextFile) ? nextFile : undefined;
      if (next === currentFile) return;
      revoke();
      currentFile = next;
      currentUrl = next ? URL.createObjectURL(next) : undefined;
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const usePreviewUrl = (file: File | undefined): string | undefined => {
  const [store] = useState(createPreviewUrlStore);

  useEffect(() => {
    store.setFile(file);
  }, [file, store]);

  useEffect(() => () => store.dispose(), [store]);

  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getPreviewUrlServerSnapshot,
  );
};

type UseFileUploadOptions = Omit<
  DropzoneOptions,
  "onDrop" | "onDropAccepted" | "onDropRejected"
> & {
  value?: File[];
  defaultValue?: File[];
  onValueChangeAction?: (files: File[]) => void;
  onFilesAddedAction?: (added: File[]) => void;
  onFilesRejectedAction?: (rejections: FileRejection[]) => void;
};

export type UseFileUploadReturn = {
  files: File[];
  add: (files: File[]) => void;
  remove: (file: File) => void;
  clear: () => void;
  rejections: FileRejection[];
  getRootProps: ReturnType<typeof useDropzone>["getRootProps"];
  getInputProps: ReturnType<typeof useDropzone>["getInputProps"];
  isDragActive: boolean;
  isDragReject: boolean;
  open: () => void;
};

export const useFileUpload = (
  opts: UseFileUploadOptions = {},
): UseFileUploadReturn => {
  const {
    value,
    defaultValue,
    onValueChangeAction,
    onFilesAddedAction,
    onFilesRejectedAction,
    multiple,
    maxFiles,
    ...dropzoneOpts
  } = opts;

  const isControlled = value !== undefined;
  const [internalFiles, setInternalFiles] = useState<File[]>(
    defaultValue ?? [],
  );
  const files = isControlled ? value : internalFiles;
  const [rejections, setRejections] = useState<FileRejection[]>([]);

  const setFiles = (next: File[]) => {
    if (!isControlled) setInternalFiles(next);
    onValueChangeAction?.(next);
  };

  const add = (incoming: File[]) => {
    if (incoming.length === 0) return;
    const deduped = incoming.filter(
      (f) => !files.some((existing) => sameFile(existing, f)),
    );
    if (deduped.length === 0) return;
    let next: File[];
    if (multiple) {
      next = [...files, ...deduped];
      if (typeof maxFiles === "number" && next.length > maxFiles) {
        next = next.slice(0, maxFiles);
      }
    } else {
      next = [deduped[deduped.length - 1] as File];
    }
    setFiles(next);
    onFilesAddedAction?.(deduped);
  };

  const remove = (target: File) => {
    setFiles(files.filter((f) => !sameFile(f, target)));
  };

  const clear = () => {
    setFiles([]);
    setRejections([]);
  };

  const dropzone = useDropzone({
    ...dropzoneOpts,
    multiple,
    maxFiles,
    onDropAccepted: (accepted: File[]) => add(accepted),
    onDropRejected: (next: FileRejection[]) => {
      setRejections(next);
      onFilesRejectedAction?.(next);
    },
  });

  return {
    files,
    add,
    remove,
    clear,
    rejections,
    getRootProps: dropzone.getRootProps,
    getInputProps: dropzone.getInputProps,
    isDragActive: dropzone.isDragActive,
    isDragReject: dropzone.isDragReject,
    open: dropzone.open,
  };
};

export type FileUploadProps = {
  value?: File[];
  defaultValue?: File[];
  onValueChangeAction?: (files: File[]) => void;
  onFilesAddedAction?: (added: File[]) => void;
  onFilesRejectedAction?: (rejections: FileRejection[]) => void;
  multiple?: boolean;
  accept?: Accept;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  layout?: "list" | "grid";
  preview?: boolean;
  /** Hide the dropzone after files exist (for single-file replace pattern). */
  hideDropzoneWhenFilled?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  dropzoneClassName?: string;
  listClassName?: string;
  id?: string;
  name?: string;
};

const describeAccept = (accept?: Accept, maxSize?: number): string => {
  const parts: string[] = [];
  if (accept) {
    const exts = Object.values(accept).flat();
    if (exts.length > 0) {
      parts.push(exts.join(", ").replaceAll(".", "").toUpperCase());
    } else {
      parts.push(
        Object.keys(accept)
          .map((k) => k.replace("/*", "").toUpperCase())
          .join(", "),
      );
    }
  }
  if (typeof maxSize === "number") {
    parts.push(`up to ${formatBytes(maxSize)}`);
  }
  return parts.join(", ");
};

export const FileUpload = (props: FileUploadProps) => {
  const {
    accept,
    className,
    defaultValue,
    description: descriptionProp,
    disabled,
    dropzoneClassName,
    hideDropzoneWhenFilled,
    id,
    layout = "list",
    listClassName,
    maxFiles,
    maxSize,
    multiple,
    name,
    onFilesAddedAction,
    onFilesRejectedAction,
    onValueChangeAction,
    preview = true,
    title,
    value,
  } = props;

  const acceptDesc = describeAccept(accept, maxSize);
  const description =
    descriptionProp ??
    (acceptDesc ? acceptDesc : multiple ? "Any file type" : "One file");

  const {
    files,
    remove,
    rejections,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    open,
  } = useFileUpload({
    value,
    defaultValue,
    onValueChangeAction,
    onFilesAddedAction,
    onFilesRejectedAction,
    multiple,
    accept,
    maxSize,
    maxFiles,
    disabled,
  });

  const showDropzone = !(hideDropzoneWhenFilled && files.length > 0);
  const hasFiles = files.length > 0;
  const showList = hasFiles && layout === "list";
  const showGrid = hasFiles && layout === "grid";
  const dragState = isDragReject ? "reject" : isDragActive ? "active" : "idle";
  const dropzoneTitle =
    title ??
    (isDragReject
      ? "File type not allowed"
      : isDragActive
        ? "Drop to upload"
        : multiple
          ? "Drop files or click to upload"
          : "Drop a file or click to upload");
  const styles = fileUploadVariants({
    disabled: !!disabled,
    drag: dragState,
  });

  return (
    <div className={styles.root({ class: className })}>
      {showDropzone ? (
        <div
          {...getRootProps()}
          className={styles.dropzone({ class: dropzoneClassName })}
          data-slot="file-upload-dropzone"
          data-drag-active={isDragActive || undefined}
          data-drag-reject={isDragReject || undefined}
        >
          <input {...getInputProps({ id, name })} />
          <Empty className="md:py-10">
            <EmptyMedia>
              <span className={styles.dropzoneIcon()}>
                <UploadCloud className="size-6" aria-hidden="true" />
              </span>
            </EmptyMedia>
            <EmptyTitle>{dropzoneTitle}</EmptyTitle>
            {description ? (
              <EmptyDescription>{description}</EmptyDescription>
            ) : null}
            <EmptyActions>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
              >
                Browse files
              </Button>
            </EmptyActions>
          </Empty>
        </div>
      ) : null}

      {showList ? (
        <ul
          className={styles.list({ class: listClassName })}
          data-slot="file-upload-list"
        >
          {files.map((file) => (
            <FileUploadRow
              key={fileKey(file)}
              file={file}
              preview={preview}
              onRemove={() => remove(file)}
            />
          ))}
        </ul>
      ) : null}

      {showGrid ? (
        <ul
          className={styles.grid({ class: listClassName })}
          data-slot="file-upload-list"
        >
          {files.map((file) => (
            <FileUploadGridCell
              key={fileKey(file)}
              file={file}
              onRemove={() => remove(file)}
            />
          ))}
        </ul>
      ) : null}

      {hideDropzoneWhenFilled && !multiple && hasFiles ? (
        <div className={styles.replaceRow()}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={open}
            disabled={disabled}
          >
            Replace
          </Button>
        </div>
      ) : null}

      {rejections.length > 0 ? (
        <ul
          className={styles.rejections()}
          data-slot="file-upload-rejections"
        >
          {groupRejections(rejections)
            .slice(0, 3)
            .map((g) => (
              <li key={`${g.message}-${g.names.join("\u0000")}`}>
                {g.names.length > 1 ? (
                  <>
                    <span className={styles.rejectionMessage()}>{g.message}</span>
                    <span> — {g.names.length} files rejected</span>
                  </>
                ) : (
                  <>
                    <span className={styles.rejectionMessage()}>{g.names[0]}</span>
                    <span> — {g.message}</span>
                  </>
                )}
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
};

const FileUploadRow = (props: {
  file: File;
  preview: boolean;
  onRemove: () => void;
}) => {
  const previewUrl = usePreviewUrl(
    props.preview && isImage(props.file) ? props.file : undefined,
  );
  const styles = fileUploadStaticStyles;

  return (
    <li
      className={styles.item()}
      data-slot="file-upload-item"
    >
      {previewUrl ? (
        <Avatar shape="square" size="md">
          <AvatarImage src={previewUrl} alt={props.file.name} />
          <AvatarFallback tone="neutral">
            <FileTypeIcon file={props.file} className={styles.itemIconSvg()} />
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className={styles.itemIcon()}>
          <FileTypeIcon file={props.file} className={styles.itemIconSvg()} />
        </span>
      )}
      <div className={styles.itemBody()}>
        <span className={styles.itemName()}>{props.file.name}</span>
        <Badge appearance="soft" variant="default" className={styles.itemSize()}>
          {formatBytes(props.file.size)}
        </Badge>
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={`Remove ${props.file.name}`}
        onClick={props.onRemove}
      >
        <X />
      </Button>
    </li>
  );
};

const FileUploadGridCell = (props: { file: File; onRemove: () => void }) => {
  const previewUrl = usePreviewUrl(props.file);
  const styles = fileUploadStaticStyles;

  return (
    <li
      className={styles.gridItem()}
      data-slot="file-upload-item"
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={props.file.name}
          className={styles.gridImage()}
        />
      ) : (
        <div className={styles.gridFallback()}>
          <FileTypeIcon file={props.file} className={styles.gridFallbackIcon()} />
          <span className={styles.gridFallbackName()}>{props.file.name}</span>
        </div>
      )}
      <div className={styles.gridOverlay()} />
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        aria-label={`Remove ${props.file.name}`}
        onClick={props.onRemove}
        className={styles.gridRemove()}
      >
        <X />
      </Button>
      <span className={styles.gridName()}>{props.file.name}</span>
    </li>
  );
};
