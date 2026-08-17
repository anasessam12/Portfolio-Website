import {
  createContext,
  useContext,
  useState,
  useEffect,
  PropsWithChildren,
} from "react";
import { projectsData } from "../data/projectsData";

interface ProjectContextType {
  activeProjectSlug: string | null;
  openProject: (slug: string) => void;
  closeProject: () => void;
}

const ProjectContext = createContext<ProjectContextType>({
  activeProjectSlug: null,
  openProject: () => {},
  closeProject: () => {},
});

export const ProjectProvider = ({ children }: PropsWithChildren) => {
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(null);

  const getSlugFromHash = (hash: string): string | null => {
    const cleanHash = hash.replace(/^#\/?/, "");
    if (cleanHash.startsWith("project-")) {
      const slug = cleanHash.replace("project-", "");
      const found = projectsData.find((p) => p.slug === slug || p.id === slug);
      return found ? found.slug : null;
    }
    if (cleanHash.startsWith("project/")) {
      const slug = cleanHash.replace("project/", "");
      const found = projectsData.find((p) => p.slug === slug || p.id === slug);
      return found ? found.slug : null;
    }
    return null;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const slug = getSlugFromHash(window.location.hash);
      setActiveProjectSlug(slug);
    };

    // Check initial hash on mount
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  const openProject = (slug: string) => {
    const found = projectsData.find((p) => p.slug === slug || p.id === slug);
    if (found) {
      setActiveProjectSlug(found.slug);
      window.location.hash = `project-${found.slug}`;
    }
  };

  const closeProject = () => {
    setActiveProjectSlug(null);
    if (window.location.hash.includes("project-") || window.location.hash.includes("project/")) {
      window.history.pushState(null, "", window.location.pathname + "#work");
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        activeProjectSlug,
        openProject,
        closeProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
