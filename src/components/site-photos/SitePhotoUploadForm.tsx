"use client";

import { useActionState, useState, type FormEvent } from "react";
import {
  addSitePhotos,
  type AddSitePhotosState,
} from "@/app/admin/(protected)/actions";
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-form-styles";
import {
  SITE_PHOTO_BATCH_BODY_SOFT_LIMIT_BYTES,
  SITE_PHOTO_MAX_BYTES,
} from "@/lib/site-photos";

const initialState: AddSitePhotosState = { error: null };

export function SitePhotoUploadForm({ sectionKey }: { sectionKey: string }) {
  const [state, formAction, pending] = useActionState(
    addSitePhotos,
    initialState,
  );
  const [clientError, setClientError] = useState<string | null>(null);

  function validateBeforeSubmit(e: FormEvent<HTMLFormElement>) {
    setClientError(null);
    const input = e.currentTarget.querySelector<HTMLInputElement>(
      'input[name="file"]',
    );
    const files = input?.files;
    if (!files?.length) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i]!;
      if (f.size > SITE_PHOTO_MAX_BYTES) {
        e.preventDefault();
        setClientError(
          `"${f.name}" is about ${(f.size / (1024 * 1024)).toFixed(1)} MB — each file must be ${SITE_PHOTO_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
        );
        return;
      }
    }

    let total = 0;
    for (let i = 0; i < files.length; i++) {
      total += files[i]!.size;
    }
    if (total > SITE_PHOTO_BATCH_BODY_SOFT_LIMIT_BYTES) {
      e.preventDefault();
      setClientError(
        `This batch is about ${(total / (1024 * 1024)).toFixed(1)} MB total. Keep one upload under about ${SITE_PHOTO_BATCH_BODY_SOFT_LIMIT_BYTES / (1024 * 1024)} MB for all files combined (multipart overhead), or split into two uploads.`,
      );
      return;
    }
  }

  const message = state.error ?? clientError;
  const banner = message ? (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </div>
  ) : null;

  return (
    <form
      action={formAction}
      onSubmit={validateBeforeSubmit}
      className="space-y-4 border-t border-border px-4 py-4"
    >
      {banner}
      <input type="hidden" name="section" value={sectionKey} />
      <div>
        <label className={adminLabelClass}>Image files</label>
        <input
          name="file"
          type="file"
          required
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={pending}
          onChange={() => setClientError(null)}
          className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WEBP, or AVIF · up to {SITE_PHOTO_MAX_BYTES / (1024 * 1024)}{" "}
          MB each. Multiple files: keep the whole set under about{" "}
          {SITE_PHOTO_BATCH_BODY_SOFT_LIMIT_BYTES / (1024 * 1024)} MB in one
          submit so the upload is accepted.
        </p>
      </div>
      <div>
        <label className={adminLabelClass}>
          Alt text (applied to every photo in this batch)
        </label>
        <input
          name="alt_text"
          required
          maxLength={200}
          disabled={pending}
          placeholder="Describe the photos for screen readers"
          className={adminInputClass}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Refine each photo&apos;s alt text individually after upload.
        </p>
      </div>
      <div>
        <label className={adminLabelClass}>
          Caption (optional, applied to every photo in this batch)
        </label>
        <input
          name="caption"
          maxLength={280}
          disabled={pending}
          placeholder="Shown overlaid on the photo"
          className={adminInputClass}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="published"
          defaultChecked
          disabled={pending}
          className="rounded border-border"
        />
        Show on the public site
      </label>
      <button type="submit" disabled={pending} className={adminPrimaryButtonClass}>
        {pending ? "Uploading…" : "Upload photos"}
      </button>
    </form>
  );
}
