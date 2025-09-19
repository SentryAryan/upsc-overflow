import React from "react";

const TestComponent = ({ propA, propB }: any) => {
  console.log("TestComponent.jsx");
  return (
    <div>
      TestComponent {propA} {propB}
    </div>
  );
};

export default TestComponent;
