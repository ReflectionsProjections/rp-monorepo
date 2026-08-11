import { ChakraProvider } from "@chakra-ui/react";
import { customTheme } from "@app/theme";
import { Route, Routes } from "react-router-dom";
import { Page } from "./components/Page";
import { Home } from "./routes/Home";
import { Login } from "./routes/Login";
import { MagicLinkCallback } from "./routes/MagicLinkCallback";
import { ResumeAllPDF } from "./routes/ResumeBook/ResumeAllPDF";
import { ResumeBook } from "./routes/ResumeBook/ResumeBook";
import { DownloadPage } from "./routes/DownloadPage";
import { RequireAuth } from "@app";

function App() {
  return (
    <ChakraProvider theme={customTheme}>
      <Routes>
        <Route
          path="resume-book/:resumeId/download"
          element={<DownloadPage />}
        />
        <Route path="resume-book/:resumeId?" element={<ResumeBook />} />
        <Route
          path="login"
          element={<Page showNav={true} pageContent={<Login />} />}
        />
        <Route path="auth/magic-link" element={<MagicLinkCallback />} />
        <Route element={<RequireAuth />}>
          <Route
            path="resume-book/dev"
            element={<Page showNav={false} pageContent={<ResumeAllPDF />} />}
          />
        </Route>
        <Route
          path="*"
          element={<Page showNav={true} pageContent={<Home />} />}
        />
      </Routes>
    </ChakraProvider>
  );
}

export default App;
