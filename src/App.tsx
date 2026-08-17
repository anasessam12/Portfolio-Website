import { lazy, Suspense } from "react";
import "./App.css";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";
import { ProjectProvider, useProject } from "./context/ProjectContext";
import { ProjectDetail } from "./components/ProjectDetail";

const AppContent = () => {
  const { activeProjectSlug, closeProject, openProject } = useProject();

  return (
    <>
      <Suspense>
        <MainContainer>
          <Suspense>
            <CharacterModel />
          </Suspense>
        </MainContainer>
      </Suspense>

      {activeProjectSlug && (
        <ProjectDetail
          projectSlug={activeProjectSlug}
          onClose={closeProject}
          onSelectProject={openProject}
        />
      )}
    </>
  );
};

const App = () => {
  return (
    <LoadingProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </LoadingProvider>
  );
};

export default App;
