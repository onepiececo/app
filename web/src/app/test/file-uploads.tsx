"use client";

import { Camera } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  FileUpload,
  useFileUpload,
  usePreviewUrl,
} from "@/components/ui/file-upload";
import { cn } from "@/lib/utils";

export const SingleFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <FileUpload
      value={files}
      onValueChangeAction={setFiles}
      accept={{ "image/*": [] }}
      maxSize={5 * 1024 * 1024}
      hideDropzoneWhenFilled
    />
  );
};

export const MultiFileList = () => {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <FileUpload
      multiple
      maxFiles={5}
      maxSize={10 * 1024 * 1024}
      value={files}
      onValueChangeAction={setFiles}
    />
  );
};

export const ImageGalleryGrid = () => {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <FileUpload
      multiple
      layout="grid"
      accept={{ "image/*": [] }}
      maxFiles={12}
      maxSize={5 * 1024 * 1024}
      value={files}
      onValueChangeAction={setFiles}
    />
  );
};

export const ValidatedFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState(false);
  return (
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
  );
};

export const AvatarPicker = () => {
  const [file, setFile] = useState<File | undefined>();
  const upload = useFileUpload({
    accept: { "image/*": [] },
    maxSize: 2 * 1024 * 1024,
    multiple: false,
    noClick: true,
    onFilesAddedAction: (added) => {
      if (added[0]) setFile(added[0]);
    },
  });
  const previewUrl = usePreviewUrl(file);
  return (
    <div className="flex items-center gap-4">
      <div
        {...upload.getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
          upload.isDragActive && "ring-2 ring-foreground/40",
          upload.isDragReject && "ring-2 ring-destructive",
        )}
      >
        <input {...upload.getInputProps()} />
        <Avatar size="2xl" shape="circle">
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt="Profile" />
          ) : null}
          <AvatarFallback tone="neutral">
            <Camera />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={upload.open}>
            {file ? "Change" : "Upload"}
          </Button>
          {file ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setFile(undefined)}
            >
              Remove
            </Button>
          ) : null}
        </div>
        <span className="text-muted-foreground text-xs">
          PNG or JPG, up to 2 MB
        </span>
      </div>
    </div>
  );
};
