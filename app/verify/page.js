"use client";

import Link from "next/link";
import { CircleCheckBig, CircleX, LoaderCircle, Stethoscope } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "../api";

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyShell heading="Loading verification" />}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const apiBaseUrl = getApiBaseUrl();
  const prescriptionId = useMemo(() => searchParams.get("prescriptionId") ?? "", [searchParams]);
  const [state, setState] = useState({
    status: "idle",
    prescription: null,
  });

  useEffect(() => {
    async function verifyPrescription() {
      if (!apiBaseUrl) {
        setState({ status: "unavailable", prescription: null });
        return;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/api/prescriptions/${encodeURIComponent(prescriptionId)}/verify`,
        );
        const data = await response.json();

        if (!response.ok || !data.valid) {
          setState({ status: "invalid", prescription: null });
          return;
        }

        setState({
          status: "valid",
          prescription: data.prescription,
        });
      } catch {
        setState({ status: "invalid", prescription: null });
      }
    }

    if (!prescriptionId) {
      setState({ status: "missing", prescription: null });
      return;
    }

    setState({ status: "loading", prescription: null });
    verifyPrescription();
  }, [apiBaseUrl, prescriptionId]);

  return (
    <VerifyShell heading={prescriptionId || "Missing prescription ID"}>

        {state.status === "missing" && (
          <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
            Scan a prescription QR code or open a verification link with
            <code className="ml-1">?prescriptionId=...</code>.
          </p>
        )}

        {state.status === "unavailable" && (
          <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
            Verification API is not configured for this deployment.
          </div>
        )}

        {state.status === "loading" && (
          <div className="flex items-center gap-3 rounded-md bg-sky-50 p-4 text-sky-800">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Verifying prescription
          </div>
        )}

        {state.status === "invalid" && (
          <div className="flex items-center gap-3 rounded-md bg-rose-50 p-4 text-rose-700">
            <CircleX className="h-5 w-5" />
            Prescription could not be verified.
          </div>
        )}

        {state.status === "valid" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-md bg-emerald-50 p-4 text-emerald-700">
              <CircleCheckBig className="h-5 w-5" />
              Prescription verified
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Patient" value={state.prescription.patientName} />
              <Detail label="Patient ID" value={state.prescription.patientId} />
              <Detail label="Medicine" value={state.prescription.medicine} />
              <Detail label="Dosage" value={state.prescription.dosage} />
              <Detail label="Doctor" value={state.prescription.doctorName} />
              <Detail label="Issued" value={formatDate(state.prescription.createdAt)} />
              <Detail
                label="Document"
                value={
                  state.prescription.documentUrl ? (
                    <a
                      className="text-sky-700 underline"
                      href={`${apiBaseUrl}${state.prescription.documentUrl}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {state.prescription.documentName ?? "Open file"}
                    </a>
                  ) : (
                    "Not uploaded"
                  )
                }
              />
            </dl>
          </div>
        )}

        <Link
          className="mt-5 inline-flex rounded-md bg-sky-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-800"
          href="/"
        >
          Go to dashboard
        </Link>
    </VerifyShell>
  );
}

function VerifyShell({ heading, children }) {
  return <main className="flex min-h-screen items-center justify-center px-4 py-8 text-slate-900">
    <section className="w-full max-w-xl rounded-lg border border-sky-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-950 text-white">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">Prescription verification</p>
          <h1 className="text-2xl font-semibold">{heading}</h1>
        </div>
      </div>
      {children}
    </section>
  </main>;
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium">{value || "Not available"}</dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
