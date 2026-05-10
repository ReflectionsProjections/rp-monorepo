import React, { useEffect } from "react";

const Resume: React.FC = () => {
  useEffect(() => {
    alert("Resume downloads are disabled on the archived 2025 site.");
    window.location.href = "/";
  }, []);

  return <p>Redirecting...</p>;
};

export default Resume;