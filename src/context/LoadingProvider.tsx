import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Loading, { setProgress } from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const skipLoader =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugScroll");
  const [isLoading, setIsLoading] = useState(!skipLoader);
  const [loading, setLoading] = useState(skipLoader ? 100 : 0);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };

  const bootedRef = useRef(false);

  /**
   * The loader used to be driven by the 3D character download. With the model
   * gone we drive it from the document's own load event instead, and we still
   * wait for ScrollSmoother to exist before completing so the intro
   * animations always have a scroller to attach to.
   */
  useEffect(() => {
    if (skipLoader || bootedRef.current) return;
    bootedRef.current = true;

    const progress = setProgress(setLoading);
    let completing = false;

    const finish = () => {
      if (completing) return;
      import("../components/Navbar").then(({ smoother }) => {
        if (completing) return;
        if (!smoother) {
          window.setTimeout(finish, 100);
          return;
        }
        completing = true;
        progress.loaded();
      });
    };

    const onReady = () => window.setTimeout(finish, 150);

    if (document.readyState === "complete") {
      onReady();
    } else {
      window.addEventListener("load", onReady, { once: true });
    }

    // Safety net: never leave a visitor stuck on the loader.
    window.setTimeout(finish, 8000);
  }, [skipLoader]);

  useEffect(() => {
    if (!skipLoader) return;
    let cancelled = false;
    const boot = () => {
      import("../components/utils/initialFX").then(async (mod) => {
        const { smoother } = await import("../components/Navbar");
        if (cancelled) return;
        if (!smoother) {
          window.setTimeout(boot, 100);
          return;
        }
        mod.initialFX?.();
      });
    };
    const id = window.setTimeout(boot, 150);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [skipLoader]);

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className={`main-body ${skipLoader ? "main-active" : ""}`}>
        {children}
      </main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
