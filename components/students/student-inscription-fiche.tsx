import { cn } from "@/lib/utils";

export type InscriptionFicheSchool = {
  name: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  primaryColor: string;
};

export type InscriptionFicheLabels = {
  title: string;
  number: string;
  identity: string;
  family: string;
  health: string;
  familyName: string;
  postName: string;
  givenName: string;
  gender: string;
  placeOfBirth: string;
  dob: string;
  previousSchool: string;
  desiredClass: string;
  fatherNames: string;
  motherNames: string;
  profession: string;
  address: string;
  phone: string;
  chronicIllness: string;
  visualProblem: string;
  physicalProblem: string;
  allergies: string;
  difficulties: string;
  notes: string;
  photo: string;
  guardianSignature: string;
  schoolSignature: string;
  yes: string;
};

export type InscriptionFicheData = {
  fullName: string;
  lastName: string;
  middleName: string;
  firstName: string;
  gender: string;
  placeOfBirth: string;
  dateOfBirth: string;
  previousSchool: string;
  className: string;
  fatherName: string;
  motherName: string;
  profession: string;
  address: string;
  phone: string;
  chronicIllness: string;
  visualProblem: string;
  physicalProblem: string;
  allergies: string;
  difficulties: string;
  notes: string;
  photoUrl: string | null;
};

function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={cn("min-w-0 px-4 py-3", wide && "col-span-2")}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium leading-snug text-stone-900">
        {value}
      </dd>
    </div>
  );
}

function Flag({
  label,
  value,
  yes,
}: {
  label: string;
  value: string;
  yes: string;
}) {
  const marked = value === yes;
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
          marked
            ? "bg-amber-100 text-amber-950"
            : "bg-stone-100 text-stone-700"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function StudentInscriptionFiche({
  school,
  data,
  labels,
}: {
  school: InscriptionFicheSchool | null;
  data: InscriptionFicheData;
  labels: InscriptionFicheLabels;
}) {
  const primary = school?.primaryColor || "#0d9488";
  const contact = [school?.address, school?.phone].filter(Boolean).join(" · ");
  const initial = (school?.name?.trim().charAt(0) || "S").toUpperCase();

  return (
    <article
      className="inscription-fiche mx-auto flex w-[210mm] max-w-full min-h-[297mm] flex-col overflow-hidden bg-white text-stone-900 shadow-lg ring-1 ring-stone-200 print:w-full print:max-w-none print:min-h-0 print:shadow-none print:ring-0"
      style={{ ["--fiche-primary" as string]: primary }}
    >
      <header className="relative px-8 pb-5 pt-7">
        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: primary }}
        />
        <div
          className="absolute inset-x-0 top-1.5 h-1"
          style={{ backgroundColor: "#f59e0b" }}
        />
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            {school?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={school.logoUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-contain"
              />
            ) : (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-lg font-semibold text-white"
                style={{ backgroundColor: primary }}
              >
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-editorial text-lg font-semibold leading-tight tracking-tight">
                {school?.name}
              </p>
              {contact ? (
                <p className="mt-1 text-xs leading-snug text-stone-500">
                  {contact}
                </p>
              ) : null}
            </div>
          </div>
          <p
            className="shrink-0 rounded-md px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-white"
            style={{ backgroundColor: primary }}
          >
            {labels.number}
          </p>
        </div>
        <h2 className="font-editorial mt-6 text-center text-[1.35rem] font-semibold uppercase tracking-[0.12em]">
          {labels.title}
        </h2>
      </header>

      <div
        className="mx-8 flex items-center gap-4 rounded-xl px-4 py-3"
        style={{ backgroundColor: "color-mix(in srgb, var(--fiche-primary) 8%, white)" }}
      >
        <div className="h-[34mm] w-[26mm] shrink-0 overflow-hidden rounded-md border border-stone-200 bg-white">
          {data.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.photoUrl}
              alt={data.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-1 text-center text-[10px] font-medium uppercase tracking-wide text-stone-400">
              {labels.photo}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-editorial text-xl font-semibold leading-tight tracking-tight">
            {data.fullName}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {data.className}
            <span className="px-1.5 text-stone-300">·</span>
            {data.gender}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5 px-8">
        <section>
          <h3
            className="rounded-t-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
            style={{ backgroundColor: primary }}
          >
            {labels.identity}
          </h3>
          <dl className="grid grid-cols-2 divide-x divide-y divide-stone-200 overflow-hidden rounded-b-lg border border-t-0 border-stone-200">
            <Field label={labels.familyName} value={data.lastName} />
            <Field label={labels.postName} value={data.middleName} />
            <Field label={labels.givenName} value={data.firstName} />
            <Field label={labels.gender} value={data.gender} />
            <Field label={labels.placeOfBirth} value={data.placeOfBirth} />
            <Field label={labels.dob} value={data.dateOfBirth} />
            <Field label={labels.previousSchool} value={data.previousSchool} />
            <Field label={labels.desiredClass} value={data.className} />
          </dl>
        </section>

        <section>
          <h3
            className="rounded-t-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
            style={{ backgroundColor: primary }}
          >
            {labels.family}
          </h3>
          <dl className="grid grid-cols-2 divide-x divide-y divide-stone-200 overflow-hidden rounded-b-lg border border-t-0 border-stone-200">
            <Field label={labels.fatherNames} value={data.fatherName} />
            <Field label={labels.motherNames} value={data.motherName} />
            <Field label={labels.profession} value={data.profession} />
            <Field label={labels.phone} value={data.phone} />
            <Field label={labels.address} value={data.address} wide />
          </dl>
        </section>

        <section>
          <h3
            className="rounded-t-lg px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
            style={{ backgroundColor: primary }}
          >
            {labels.health}
          </h3>
          <div className="overflow-hidden rounded-b-lg border border-t-0 border-stone-200">
            <div className="grid grid-cols-3 divide-x divide-stone-200 border-b border-stone-200">
              <Flag
                label={labels.chronicIllness}
                value={data.chronicIllness}
                yes={labels.yes}
              />
              <Flag
                label={labels.visualProblem}
                value={data.visualProblem}
                yes={labels.yes}
              />
              <Flag
                label={labels.physicalProblem}
                value={data.physicalProblem}
                yes={labels.yes}
              />
            </div>
            <dl className="grid grid-cols-2 divide-x divide-y divide-stone-200">
              <Field label={labels.allergies} value={data.allergies} />
              <Field label={labels.difficulties} value={data.difficulties} />
              {data.notes ? (
                <Field label={labels.notes} value={data.notes} wide />
              ) : null}
            </dl>
          </div>
        </section>
      </div>

      <footer className="mt-auto grid grid-cols-2 gap-12 px-8 pb-8 pt-10">
        <div>
          <div className="h-12 border-b border-stone-400" />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {labels.guardianSignature}
          </p>
        </div>
        <div>
          <div className="h-12 border-b border-stone-400" />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {labels.schoolSignature}
          </p>
        </div>
      </footer>
    </article>
  );
}
