"use client";
import { Suspense } from "react";
import PayfastReturnContent from "./PayfastReturnContent";

export default function PayfastReturnPage() {
  return (
    <>
      <h1 className="sr-only">Payment return</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <PayfastReturnContent />
      </Suspense>
    </>
  );
} 