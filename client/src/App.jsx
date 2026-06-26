import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            border: "3px solid #000",
            boxShadow: "6px 6px 0 #000",
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </>
  );
}

export default App;
