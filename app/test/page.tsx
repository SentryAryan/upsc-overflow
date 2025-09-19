"use client";
import React from "react";
import { useState } from "react";
import TestComponent from "@/components/test/TestComponen";
import { Button } from "@/components/ui/button";

const TestPage = () => {
  console.log("TestPage.jsx");
  const [propA, setPropA] = useState<string>("");
  const [propB, setPropB] = useState<string>("");
  const [propC, setPropC] = useState<number>(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full gap-4">
      <TestComponent propA={propA} propB={propB} />
      <Button onClick={() => setPropC((current) => current + 1)}>
        Change The prop which is not passed to the test component
      </Button>
    </div>
  );
};

export default TestPage;
