"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { FormWrapper } from "@/components/forms/form-wrapper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerSchoolOrganization } from "@/lib/actions/school-registration";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

const completeSchema = z.object({
  school_name: z.string().min(2, "School name is required"),
});

type CompleteFormData = z.infer<typeof completeSchema>;

export default function RegisterCompletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/register/complete");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id, role")
        .eq("id", user.id)
        .single();

      if (profile?.school_id) {
        router.replace("/");
        return;
      }

      if (profile?.role === "super_admin") {
        window.location.assign("/admin");
        return;
      }

      setAdminEmail(user.email ?? null);
      setAdminName(
        (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          null
      );
      setCheckingSession(false);
    }

    void loadSession();
  }, [router]);

  async function onSubmit(data: CompleteFormData) {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error("Your Google account must include an email address.");
      }

      const org = await registerSchoolOrganization({
        userId: user.id,
        schoolName: data.school_name,
        adminEmail: user.email,
        adminName: adminName ?? undefined,
      });

      if (org.error) {
        throw new Error(org.error);
      }

      window.location.assign("/pending");
      return;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="font-display text-2xl tracking-tight text-white">
            Finish school setup
          </h1>
          <p className="mt-2 text-sm text-white/50">
            You signed in with Google
            {adminEmail ? ` as ${adminEmail}` : ""}. Enter your school name to
            complete registration.
          </p>
        </div>

        <FormWrapper
          schema={completeSchema}
          onSubmit={onSubmit}
          className="space-y-5"
        >
          <CompleteFormFields loading={loading} />
        </FormWrapper>

        <p className="mt-6 text-center text-sm text-white/45">
          Wrong account?{" "}
          <Link href="/login" className="font-medium text-amber-500 hover:text-amber-400">
            Sign in with a different account
          </Link>
        </p>
      </div>
    </div>
  );
}

function CompleteFormFields({ loading }: { loading: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CompleteFormData>();

  return (
    <>
      <div>
        <Label htmlFor="school_name" required>
          School name
        </Label>
        <Input
          id="school_name"
          placeholder="Greenfield Academy"
          error={!!errors.school_name}
          {...register("school_name")}
        />
        {errors.school_name && (
          <p className="mt-1.5 text-sm text-red-500">
            {errors.school_name.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? "Creating school..." : "Complete registration"}
      </Button>
    </>
  );
}
