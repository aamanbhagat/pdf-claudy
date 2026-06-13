/**
 * One-shot file handoff between the "Open a PDF" launcher and a tool's Dropzone.
 *
 * The launcher stages the chosen file(s) and navigates to a tool route; that
 * tool's <Dropzone> claims them on mount (claimStagedFiles) and runs exactly as
 * if the user had dropped the file in — so it carries across the navigation with
 * no per-tool wiring. Claim-once plus a short TTL keep a stale file from leaking
 * into an unrelated tool opened later.
 */

interface Staged {
  files: File[];
  at: number;
}

let staged: Staged | null = null;
const TTL_MS = 120_000;

export function stageFiles(files: File[]) {
  staged = files.length ? { files, at: Date.now() } : null;
}

/** Returns staged files that match `accept`, then clears the store. Null if none or stale. */
export function claimStagedFiles(accept: string, multiple: boolean): File[] | null {
  if (!staged) return null;
  const fresh = Date.now() - staged.at <= TTL_MS;
  const matched = fresh ? staged.files.filter((f) => matchesAccept(f, accept)) : [];
  staged = null; // claimed once, whether or not it matched the destination
  if (!matched.length) return null;
  return multiple ? matched : [matched[0]];
}

/** Mirror of the browser's <input accept> matching against a File. */
function matchesAccept(file: File, accept: string): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .some((a) => {
      if (!a) return false;
      if (a === "*/*") return true;
      if (a.startsWith(".")) return name.endsWith(a);
      if (a.endsWith("/*")) return type.startsWith(a.slice(0, -1));
      return type === a;
    });
}
