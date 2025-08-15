
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import LoginDialog from "./components/LoginDialog";
import MessageSigner from "./components/MessageSigner";
import "./App.css";


function App() {
  const isLoggedIn = useIsLoggedIn();

  return (
    <div className="bg-primary-foreground container grid h-svh max-w-none items-center justify-center">
      {!isLoggedIn ? (
        <LoginDialog />
      ) : (
        <MessageSigner />
      )}
    </div>
  );
}

export default App;
