"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { getAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export function AccountMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslation();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const placeMenu = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menu = menuRef.current;
    if (!menu) return;
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const gutter = 8;
    const left = Math.min(
      Math.max(gutter, rect.right - width),
      Math.max(gutter, window.innerWidth - width - gutter),
    );
    const below = window.innerHeight - rect.bottom - gutter;
    const above = rect.top - gutter;
    const placeAbove = height > below && above > below;
    const top = placeAbove
      ? Math.max(gutter, rect.top - height - gutter)
      : Math.min(rect.bottom + gutter, window.innerHeight - height - gutter);
    menu.style.left = `${left}px`;
    menu.style.top = `${Math.max(gutter, top)}px`;
    menu.style.visibility = "visible";
  }, []);

  useLayoutEffect(() => {
    if (open) placeMenu();
  }, [open, placeMenu]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      )
        setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open, placeMenu]);

  if (loading)
    return (
      <span
        className="h-9 w-16 animate-pulse rounded-lg bg-line/50"
        aria-label={t("nav.restoringAccount")}
      />
    );
  if (!user)
    return (
      <Link
        href="/login"
        className="px-2 py-3 text-sm font-medium text-muted hover:text-brand"
      >
        {t("nav.logIn")}
      </Link>
    );

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      aria-haspopup="true"
      aria-controls={id}
      onClick={(event) => {
        setError("");
        if (open) setOpen(false);
        else {
          setPortalRoot(event.currentTarget.closest("dialog") ?? document.body);
          setOpen(true);
        }
      }}
      className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs font-medium hover:bg-mint"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-mint text-brand">
        <UserRound size={16} />
      </span>
      <span className="max-w-24 truncate">{user.name}</span>
      <ChevronDown size={13} />
    </button>
  );

  const menu = open ? (
    <div
      ref={menuRef}
      id={id}
      role="menu"
      aria-label={t("nav.accountSettings")}
      className="fixed z-[100] max-h-[calc(100dvh-1rem)] w-56 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-lg"
      style={{ left: 0, top: 0, visibility: "hidden" }}
    >
      <p className="truncate border-b border-line px-3 py-3 text-xs text-muted">
        {user.email}
      </p>
      {[
        [LayoutDashboard, t("nav.dashboard"), "/dashboard"],
        [Settings, t("nav.accountSettings"), "/settings"],
      ].map(([Icon, label, href]) => {
        const ItemIcon = Icon as typeof Settings;
        return (
          <Link
            onClick={() => setOpen(false)}
            key={href as string}
            href={href as string}
            role="menuitem"
            className="flex items-center gap-2 rounded-lg p-3 text-xs hover:bg-mint"
          >
            <ItemIcon size={15} />
            {label as string}
          </Link>
        );
      })}
      <button
        role="menuitem"
        onClick={async () => {
          try {
            await getAuth().signOut();
            setOpen(false);
            router.push("/");
          } catch (reason) {
            setError(
              reason instanceof Error
                ? reason.message
                : t("common.unknownError"),
            );
          }
        }}
        className="flex w-full items-center gap-2 rounded-lg p-3 text-xs hover:bg-mint"
      >
        <LogOut size={15} />
        {t("nav.logOut")}
      </button>
      {error && (
        <p role="alert" className="p-3 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  ) : null;

  return (
    <>
      {trigger}
      {menu && portalRoot && createPortal(menu, portalRoot)}
    </>
  );
}
