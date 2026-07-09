"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, SwitchCamera } from "lucide-react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type FacingMode = "user" | "environment";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void | Promise<void>;
  disabled?: boolean;
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  disabled = false,
}: CameraCaptureModalProps) {
  const t = useTranslations("onboarding.account");
  const tc = useTranslations("common");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [starting, setStarting] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canSwitchCamera, setCanSwitchCamera] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      clearPreview();
      setError(null);
      setFacingMode("user");
      return;
    }

    void startCamera("user");

    return () => {
      stopStream();
      clearPreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when modal opens
  }, [isOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamRef.current || previewUrl) return;
    video.srcObject = streamRef.current;
    void video.play().catch(() => undefined);
  }, [previewUrl, streamReady, isOpen]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStreamReady(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function clearPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
    setCapturedFile(null);
  }

  async function startCamera(mode: FacingMode) {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setError(t("cameraUnsupported"));
      return;
    }

    setStarting(true);
    setError(null);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setFacingMode(mode);
      setStreamReady(true);

      const devices = await navigator.mediaDevices.enumerateDevices();
      setCanSwitchCamera(
        devices.filter((device) => device.kind === "videoinput").length > 1
      );

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
    } catch {
      setStreamReady(false);
      setError(t("cameraPermissionDenied"));
    } finally {
      setStarting(false);
    }
  }

  async function handleSwitchCamera() {
    const next: FacingMode = facingMode === "user" ? "environment" : "user";
    clearPreview();
    await startCamera(next);
  }

  function handleTakePhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    setCapturing(true);
    try {
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 640;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        setError(t("cameraCaptureFailed"));
        setCapturing(false);
        return;
      }

      // Mirror selfie preview so the saved photo matches what the user saw.
      if (facingMode === "user") {
        context.translate(width, 0);
        context.scale(-1, 1);
      }
      context.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError(t("cameraCaptureFailed"));
            setCapturing(false);
            return;
          }

          const file = new File([blob], `avatar-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          const url = URL.createObjectURL(blob);
          if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = url;
          setPreviewUrl(url);
          setCapturedFile(file);
          setCapturing(false);
        },
        "image/jpeg",
        0.92
      );
    } catch {
      setError(t("cameraCaptureFailed"));
      setCapturing(false);
    }
  }

  function handleRetake() {
    clearPreview();
    setError(null);
  }

  async function handleUsePhoto() {
    if (!capturedFile || disabled) return;

    setSaving(true);
    try {
      await onCapture(capturedFile);
      stopStream();
      clearPreview();
      onClose();
    } catch {
      setError(t("photoUploadFailed"));
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    stopStream();
    clearPreview();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("takePhoto")}>
      <div className="space-y-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {t("cameraHint")}
        </p>

        <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-900">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img
              src={previewUrl}
              alt={t("cameraPreviewAlt")}
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${
                facingMode === "user" ? "scale-x-[-1]" : ""
              }`}
            />
          )}

          {(starting || capturing) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">
              {starting ? t("cameraStarting") : t("cameraCapturing")}
            </div>
          )}
        </div>

        {error ? (
          <div className="space-y-2">
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void startCamera(facingMode)}
              disabled={starting || saving}
            >
              {tc("tryAgain")}
            </Button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={saving}
          >
            {tc("cancel")}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {!previewUrl && canSwitchCamera ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleSwitchCamera()}
                disabled={starting || capturing || saving || Boolean(error)}
              >
                <SwitchCamera className="mr-1.5 h-4 w-4" />
                {t("switchCamera")}
              </Button>
            ) : null}

            {previewUrl ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetake}
                  disabled={saving}
                >
                  <RefreshCw className="mr-1.5 h-4 w-4" />
                  {t("retakePhoto")}
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleUsePhoto()}
                  disabled={saving || disabled}
                >
                  {saving ? tc("uploading") : t("usePhoto")}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={handleTakePhoto}
                disabled={
                  starting || capturing || saving || Boolean(error) || !streamReady
                }
              >
                <Camera className="mr-1.5 h-4 w-4" />
                {t("capturePhoto")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
