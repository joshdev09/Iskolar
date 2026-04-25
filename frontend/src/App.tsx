import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { WelcomePage } from "@/pages/WelcomePage";
import { UploadNotesPage } from "@/pages/UploadNotesPage";
import { NotesPage } from "@/pages/NotesPage";
import { GenerateQuizPage } from "@/pages/GenerateQuizPage";
import { LoginPage } from "@/pages/LoginPage";
import { JoinPage } from "@/features/multiplayer/JoinPage";
import { PlayerQuizView } from "@/features/multiplayer/PlayerQuizView";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },

  // ── Multiplayer routes ──────────────────────────
  {
    path: "/join/:sessionId",
    element: <JoinPage />,
  },
  {
    path: "/play/:sessionId",
    element: <PlayerQuizView />,
  },

  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true,           element: <WelcomePage /> },
      { path: "home",          element: <WelcomePage /> },
      { path: "upload-notes",  element: <UploadNotesPage /> },
      { path: "notes",         element: <NotesPage /> },
      { path: "generate-quiz", element: <GenerateQuizPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;