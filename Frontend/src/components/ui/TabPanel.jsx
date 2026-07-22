import clsx from "clsx";

export default function TabPanel({ children, className, transitionKey }) {
  return (
    <div key={transitionKey} className={clsx("content-reveal", className)}>
      {children}
    </div>
  );
}
