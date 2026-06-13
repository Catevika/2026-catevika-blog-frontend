import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { useSlugAvailability } from "@/hooks/useSlugAvailability";
import type { SlugFieldProps } from "@/types";
import { slugifyFinal } from "@/utils/slugUtils";
import type React from "react";
import { useCallback, useId, useRef, useState } from "react";
import { LuRotateCcw } from "react-icons/lu";

const SlugField: React.FC<SlugFieldProps> = ({
  title,
  slug,
  locked,
  disabled = false,
  error,
  postId,
  isNew,
  onSlugInput,
  onSlugChange,
  onToggleLocked,
  onResetAuto,
}) => {
  const slugId = useId();
  const helpId = useId();
  const errorId = useId();

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Manual input state
  const [rawInput, setRawInput] = useState(slug);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (locked) onToggleLocked(); // unlock on typing

      setRawInput(value);
      onSlugInput(value);
    },
    [locked, onToggleLocked, onSlugInput],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      onSlugChange(e.target.value);
    },
    [onSlugChange],
  );

  // Auto slug from title
  const autoSlug = slugifyFinal(title);

  // What the input displays
  const effectiveValue = locked ? autoSlug : rawInput;

  // Correct API URL
  const checkUrl = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/posts/check-slug`
    : "http://localhost:4000/api/posts/check-slug";

  const {
    loading,
    available,
    suggestion,
    error: availError,
  } = useSlugAvailability(effectiveValue, {
    debounceMs: 400,
    excludeId: isNew ? undefined : postId,
    checkUrl,
  });

  return (
    <Field className="post-create-edit-title-group">
      <FieldLabel htmlFor={slugId}>Slug *</FieldLabel>

      <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
        <InputGroup>
          <InputGroupInput
            ref={inputRef}
            id={slugId}
            name="slug"
            type="text"
            value={effectiveValue}
            onChange={handleInput}
            onBlur={handleBlur}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helpId}
            placeholder="Edit slug else auto"
            className={`w-full ${error ? "form-error" : ""}`}
          />
        </InputGroup>

        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            onResetAuto();
            setRawInput(autoSlug);
            onSlugInput(autoSlug);
            onSlugChange(autoSlug);
            inputRef.current?.focus();
          }}
          disabled={disabled}
          className="w-42 whitespace-nowrap"
        >
          <LuRotateCcw size={16} className="mr-1 inline-block" />
          Reset
        </Button>
      </div>

      <div
        id={helpId}
        className="mt-1 flex min-h-12 flex-col justify-start text-sm"
        aria-live="polite"
      >
        <div className="flex items-center gap-1 text-xs">
          <span>{locked ? "🔒" : "🔓"}</span>
          {locked ? (
            <span>
              Auto mode — slug will follow title:{" "}
              <strong>{title || "…"}</strong>
            </span>
          ) : (
            <span>Manual mode</span>
          )}
        </div>

        {loading && <div>Checking availability…</div>}

        {/* show suggestion whenever suggestion exists */}
        {!loading && suggestion && (
          <div className="flex items-center gap-1 text-red-600">
            <span>⚠️</span>
            <span>
              Slug taken — suggestion:{" "}
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  if (locked) onToggleLocked();

                  setRawInput(suggestion);
                  onSlugInput(suggestion);
                  onSlugChange(suggestion);

                  inputRef.current?.focus();
                }}
              >
                {suggestion}
              </Button>
            </span>
          </div>
        )}

        {!loading && available === true && (
          <div className="text-green-600">Slug available</div>
        )}

        {!loading && availError && (
          <div className="flex items-center gap-1 text-red-600">
            <span>⚠️</span>
            <span>Check failed: {availError}</span>
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="form-error mt-1" role="alert">
          {error}
        </p>
      )}
    </Field>
  );
};

export default SlugField;
