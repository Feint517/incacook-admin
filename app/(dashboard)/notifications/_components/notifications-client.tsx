"use client";

import { useMemo, useState } from "react";
import { Megaphone, CheckCircle2 } from "lucide-react";

import { useAdminMutation } from "@/lib/query";
import { post } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BODY_MAX,
  CATEGORY_LABELS,
  TARGET_LABELS,
  TARGET_ORDER,
  TITLE_MAX,
  type NotificationResult,
  type NotificationTarget,
  type SellerCategory,
  type SendNotificationInput,
} from "./types";

const CATEGORY_ORDER: SellerCategory[] = ["FAIT_MAISON", "TRAITEUR", "RESTAURANT"];

export function NotificationsClient() {
  const [target, setTarget] = useState<NotificationTarget>("ALL");
  const [category, setCategory] = useState<SellerCategory>("FAIT_MAISON");
  const [city, setCity] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<NotificationResult | null>(null);

  const send = useAdminMutation<NotificationResult, SendNotificationInput>(
    (payload, opts) => post("/admin/notifications/send", payload, opts),
  );

  const needsCategory = target === "CATEGORY";
  const needsCity = target === "CITY";

  const validationError = useMemo(() => {
    if (!title.trim()) return "Le titre est requis.";
    if (!body.trim()) return "Le message est requis.";
    if (needsCity && !city.trim()) return "La ville est requise pour cette cible.";
    return null;
  }, [title, body, needsCity, city]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (validationError || send.isPending) return;
    setResult(null);
    const payload: SendNotificationInput = {
      target,
      title: title.trim(),
      body: body.trim(),
      ...(needsCategory ? { category } : {}),
      ...(needsCity ? { city: city.trim() } : {}),
    };
    try {
      const res = await send.mutate(payload);
      setResult(res);
    } catch {
      // send.error is rendered inline below.
    }
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Diffuser une notification
          </CardTitle>
          <CardDescription>
            Envoie une notification push à une audience ciblée. L&apos;action est
            irréversible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            {/* Target */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant">Cible</label>
              <Select
                value={target}
                onValueChange={(v) => setTarget(v as NotificationTarget)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_ORDER.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TARGET_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {needsCategory && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant">
                  Catégorie de vendeur
                </label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as SellerCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_ORDER.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {needsCity && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="city" className="text-xs font-medium text-on-surface-variant">
                  Ville
                </label>
                <Input
                  id="city"
                  value={city}
                  maxLength={120}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Paris"
                />
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-medium text-on-surface-variant">
                Titre <span className="text-on-surface-variant/60">({title.length}/{TITLE_MAX})</span>
              </label>
              <Input
                id="title"
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nouvelle fonctionnalité disponible"
              />
            </div>

            {/* Body */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="body" className="text-xs font-medium text-on-surface-variant">
                Message <span className="text-on-surface-variant/60">({body.length}/{BODY_MAX})</span>
              </label>
              <textarea
                id="body"
                value={body}
                maxLength={BODY_MAX}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Découvrez les nouveautés IncaCook…"
                className="flex w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {send.error && (
              <p role="alert" className="rounded-md border border-error/40 bg-error/5 px-3 py-2 text-sm text-error">
                {send.error.message}
                {send.error.correlationId ? ` (réf. ${send.error.correlationId})` : ""}
              </p>
            )}

            {result && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-md border border-success/40 bg-success/5 px-3 py-2 text-sm text-on-surface"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>
                  Notification envoyée à <strong>{TARGET_LABELS[result.target]}</strong> —{" "}
                  {result.targetedUsers} ciblé(s), {result.sent} envoyé(s), {result.failed} échec(s).
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!!validationError || send.isPending}>
                {send.isPending ? "Envoi…" : "Envoyer"}
              </Button>
              {validationError && (
                <span className="text-xs text-on-surface-variant">{validationError}</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
