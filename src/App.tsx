import { useState } from "react";
import {
  DynamicWidget,
  useDynamicContext,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { useDarkMode } from "./lib/useDarkMode";
import LoginDialog from "./components/LoginDialog";
import MessageSigner from "./components/MessageSigner";
import "./App.css";

function App() {
  const { isDarkMode } = useDarkMode();
  const { user, showAuthFlow, handleLogOut } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const [showCustomLogin, setShowCustomLogin] = useState(true);

  // Debug logging
  console.log("App state:", {
    user: !!user,
    isLoggedIn,
    showAuthFlow,
    showCustomLogin,
  });

  // Show custom login when user is not logged in
  if (!isLoggedIn && showCustomLogin && !showAuthFlow) {
    return (
      <div className={`container ${isDarkMode ? "dark" : "light"}`}>
        <LoginDialog onClose={() => setShowCustomLogin(false)} />
      </div>
    );
  }

  // Main screen for authenticated users
  return (
    <div className={`container ${isDarkMode ? "dark" : "light"}`}>
      <div className="modal">
        {isLoggedIn ? (
          <>
            <MessageSigner />
            <div className="logout-section">
              <button className="logout-button" onClick={handleLogOut}>
                Log Out
              </button>
            </div>
          </>
        ) : (
          <DynamicWidget />
        )}
      </div>
    </div>
  );
}

export default App;
