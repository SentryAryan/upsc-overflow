import React from "react";
import { Skeleton } from "../ui/skeleton";

const PageSkeleton = () => {
  return Array.from({ length: 10 }).map((_, index) => (
    <div className="grid grid-cols-1 gap-8 w-full" key={index}>
      <Skeleton className="w-full h-[20vh] md:h-[30vh]" />
    </div>
  ));
};

export default PageSkeleton;
