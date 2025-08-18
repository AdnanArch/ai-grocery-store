import { useEffect } from "react";

const Debug = () => {
  useEffect(() => {
    console.log("Debug component mounted");
    console.log("Current URL:", window.location.href);
    console.log("React version:", React.version);

    // Log any errors that occur
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      console.log("Error detected:", args);
    };

    // Check if the app is running in development or production mode
    console.log("NODE_ENV:", process.env.NODE_ENV);

    // Check if static resources are loading correctly
    const img = new Image();
    img.onload = () => console.log("Static resource test: Success");
    img.onerror = () => console.log("Static resource test: Failed");
    img.src = "/favicon.ico";

    return () => {
      console.log("Debug component unmounted");
      console.error = originalConsoleError;
    };
  }, []);

  return null; // This component doesn't render anything
};

export default Debug;
