import { useEffect } from "react";

let activeLocks = 0;
let previousBodyOverflow = "";

function acquireBodyScrollLock() {
  if (activeLocks === 0) {
    previousBodyOverflow = document.body.style.overflow;
  }

  activeLocks += 1;
  document.body.style.overflow = "hidden";
}

function releaseBodyScrollLock() {
  activeLocks = Math.max(activeLocks - 1, 0);

  if (activeLocks === 0) {
    document.body.style.overflow = previousBodyOverflow;
  }
}

export default function useBodyScrollLock(locked) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") {
      return undefined;
    }

    acquireBodyScrollLock();

    return () => {
      releaseBodyScrollLock();
    };
  }, [locked]);
}

export { acquireBodyScrollLock, releaseBodyScrollLock };
