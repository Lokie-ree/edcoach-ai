import React from "react";

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center px-4">
        {children}
      </main>
    </div>
  );
}
