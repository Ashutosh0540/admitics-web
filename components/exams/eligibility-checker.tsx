"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  Info,
  XCircle,
} from "lucide-react";
import type {
  EligibilityField,
  EligibilityProfile,
  EligibilityResult,
  Exam,
} from "@/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/primitives";
import { buildExamAskHref } from "./exam-utils";
import { useI18n, useTranslation } from "@/lib/i18n";

const initialProfile: EligibilityProfile = {
  educationLevel: "",
  percentage: null,
  stream: "",
  passingYear: null,
  category: "",
  examSpecific: {},
};

function ResultPanel({
  exam,
  result,
}: {
  exam: Exam;
  result: EligibilityResult;
}) {
  const t = useTranslation();
  const { locale } = useI18n();
  const content = {
    eligible: {
      title: t("eligibility.eligible"),
      copy: t("eligibility.eligibleCopy"),
      Icon: CheckCircle2,
      className: "border-brand/20 bg-mint text-brand",
    },
    "not-eligible": {
      title: t("eligibility.notEligible"),
      copy: t("eligibility.notEligibleCopy"),
      Icon: XCircle,
      className: "border-red-200 bg-red-50 text-danger",
    },
    "insufficient-information": {
      title: t("eligibility.moreInfo"),
      copy: t("eligibility.moreInfoCopy"),
      Icon: CircleHelp,
      className: "border-amber-200 bg-amber-50 text-amber",
    },
  }[result.status];
  return (
    <div
      className={`mt-6 rounded-2xl border p-5 ${content.className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <content.Icon
          size={22}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div>
          <h3 className="font-semibold">{content.title}</h3>
          <p className="mt-2 text-sm leading-6 opacity-90">{content.copy}</p>
          {result.reasons.length > 0 && (
            <ul className="mt-4 space-y-2 text-xs leading-5 opacity-90">
              {result.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 size-1 shrink-0 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  {reason}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-current/15 pt-4 text-[11px] leading-5 opacity-80">
            {result.disclaimer}
          </p>
          <ButtonLink
            href={buildExamAskHref(exam, "eligibility-check", locale)}
            variant="ghost"
            className="mt-4 min-h-9 px-0 py-1 text-current hover:bg-transparent hover:underline"
          >
            {t("eligibility.askResult")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function EligibilityChecker({
  exam,
  onCheck,
}: {
  exam: Exam;
  onCheck?: (profile: EligibilityProfile) => Promise<EligibilityResult>;
}) {
  const t = useTranslation();
  const [profile, setProfile] = useState<EligibilityProfile>(initialProfile);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [serviceMessage, setServiceMessage] = useState("");
  const [checking, setChecking] = useState(false);
  const setValue = <K extends keyof EligibilityProfile>(
    key: K,
    value: EligibilityProfile[K],
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setResult(null);
  };
  const setSpecificValue = (
    field: EligibilityField,
    value: string | boolean,
  ) => {
    setProfile((current) => ({
      ...current,
      examSpecific: { ...current.examSpecific, [field.id]: value },
    }));
    setResult(null);
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);
    setServiceMessage("");
    if (!onCheck) {
      setServiceMessage(t("eligibility.unavailableCopy"));
      return;
    }
    setChecking(true);
    try {
      setResult(await onCheck(profile));
    } catch (reason) {
      setServiceMessage(
        reason instanceof Error ? reason.message : t("eligibility.failed"),
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mint text-brand">
          <CircleHelp size={22} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">{t("eligibility.check")}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            {t("eligibility.formCopy")}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#f8f4eb] p-3 text-xs leading-5 text-muted">
        <Info
          size={15}
          className="mt-0.5 shrink-0 text-amber"
          aria-hidden="true"
        />
        <p>{t("eligibility.formNotice")}</p>
      </div>
      <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={submit}>
        <div>
          <label
            htmlFor="education-level"
            className="mb-2 block text-xs font-semibold"
          >
            {t("eligibility.educationLevel")}
          </label>
          <select
            id="education-level"
            value={profile.educationLevel}
            onChange={(event) => setValue("educationLevel", event.target.value)}
            className={inputStyles}
            aria-describedby="education-level-help"
          >
            <option value="">{t("eligibility.selectLevel")}</option>
            <option value="class-10">{t("eligibility.class10")}</option>
            <option value="class-12">{t("eligibility.class12")}</option>
            <option value="undergraduate">
              {t("eligibility.undergraduate")}
            </option>
            <option value="postgraduate">
              {t("eligibility.postgraduate")}
            </option>
          </select>
          <p id="education-level-help" className="mt-2 text-[11px] text-muted">
            {t("eligibility.levelHelp")}
          </p>
        </div>
        <div>
          <label
            htmlFor="percentage"
            className="mb-2 block text-xs font-semibold"
          >
            {t("eligibility.percentage")}
          </label>
          <input
            id="percentage"
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.01"
            placeholder={t("eligibility.percentagePlaceholder")}
            value={profile.percentage ?? ""}
            onChange={(event) =>
              setValue(
                "percentage",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
            className={inputStyles}
            aria-describedby="percentage-help"
          />
          <p id="percentage-help" className="mt-2 text-[11px] text-muted">
            {t("eligibility.percentageHelp")}
          </p>
        </div>
        <div>
          <label htmlFor="stream" className="mb-2 block text-xs font-semibold">
            {t("eligibility.stream")}
          </label>
          <select
            id="stream"
            value={profile.stream}
            onChange={(event) => setValue("stream", event.target.value)}
            className={inputStyles}
          >
            <option value="">{t("eligibility.selectStream")}</option>
            <option value="science">{t("eligibility.science")}</option>
            <option value="engineering">{t("eligibility.engineering")}</option>
            <option value="commerce">{t("eligibility.commerce")}</option>
            <option value="arts-humanities">{t("eligibility.arts")}</option>
            <option value="vocational">{t("eligibility.vocational")}</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="passing-year"
            className="mb-2 block text-xs font-semibold"
          >
            {t("eligibility.passingYear")}
          </label>
          <input
            id="passing-year"
            type="number"
            inputMode="numeric"
            min="1900"
            max="2100"
            placeholder={t("eligibility.yearPlaceholder")}
            value={profile.passingYear ?? ""}
            onChange={(event) =>
              setValue(
                "passingYear",
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
            className={inputStyles}
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="category"
            className="mb-2 block text-xs font-semibold"
          >
            {t("eligibility.category")}{" "}
            <span className="font-normal text-muted">
              ({t("eligibility.whereRelevant")})
            </span>
          </label>
          <select
            id="category"
            value={profile.category}
            onChange={(event) => setValue("category", event.target.value)}
            className={inputStyles}
          >
            <option value="">{t("eligibility.preferNot")}</option>
            <option value="open">{t("eligibility.openDemo")}</option>
            <option value="reserved">{t("eligibility.reservedDemo")}</option>
          </select>
        </div>
        {exam.eligibilityFields.map((field) => (
          <div key={field.id} className="sm:col-span-2">
            {field.type === "boolean" ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 hover:bg-paper">
                <input
                  type="checkbox"
                  checked={profile.examSpecific[field.id] === true}
                  onChange={(event) =>
                    setSpecificValue(field, event.target.checked)
                  }
                  className="mt-1 size-4 accent-brand"
                />
                <span>
                  <span className="block text-sm font-medium">
                    {field.label}
                  </span>
                  {field.helpText && (
                    <span className="mt-1 block text-[11px] leading-5 text-muted">
                      {field.helpText}
                    </span>
                  )}
                </span>
              </label>
            ) : (
              <>
                <label
                  htmlFor={`exam-field-${field.id}`}
                  className="mb-2 block text-xs font-semibold"
                >
                  {field.label}
                </label>
                <select
                  id={`exam-field-${field.id}`}
                  value={String(profile.examSpecific[field.id] ?? "")}
                  onChange={(event) =>
                    setSpecificValue(field, event.target.value)
                  }
                  className={inputStyles}
                >
                  <option value="">{t("eligibility.selectOption")}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {field.helpText && (
                  <p className="mt-2 text-[11px] text-muted">
                    {field.helpText}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
        <div className="flex flex-col items-start gap-3 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:items-center">
          <Button type="submit" loading={checking}>
            {t("eligibility.check")}
          </Button>
          <span className="flex items-center gap-2 text-[11px] text-muted">
            <AlertCircle size={14} aria-hidden="true" />
            {t("eligibility.preliminaryOnly")}
          </span>
        </div>
      </form>
      {serviceMessage && (
        <div
          className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <CircleHelp
              size={21}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-semibold">{t("eligibility.unavailable")}</h3>
              <p className="mt-2 text-sm leading-6">{serviceMessage}</p>
              <p className="mt-4 border-t border-amber-900/10 pt-4 text-[11px] leading-5">
                {t("eligibility.officialAuthoritative")}
              </p>
            </div>
          </div>
        </div>
      )}
      {result && <ResultPanel exam={exam} result={result} />}
    </div>
  );
}
