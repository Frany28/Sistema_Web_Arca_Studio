import {
  Calendar2 as IconsaxCalendar2,
  CalendarTick as IconsaxCalendarTick,
  Clock as IconsaxClock,
} from "iconsax-react";

function ClockIcon({ className, size = 20 }) {
  return (
    <IconsaxClock
      size={size}
      variant="Linear"
      color="currentColor"
      className={className}
      aria-hidden="true"
    />
  );
}

function CalendarTickIcon({ className, size = 20 }) {
  return (
    <IconsaxCalendarTick
      size={size}
      variant="Linear"
      color="currentColor"
      className={className}
      aria-hidden="true"
    />
  );
}

function CalendarIcon({ className, size = 16 }) {
  return (
    <IconsaxCalendar2
      size={size}
      variant="Linear"
      color="currentColor"
      className={className}
      aria-hidden="true"
    />
  );
}

function InfoIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 18.3337C14.6024 18.3337 18.3333 14.6027 18.3333 10.0003C18.3333 5.39795 14.6024 1.66699 10 1.66699C5.39759 1.66699 1.66663 5.39795 1.66663 10.0003C1.66663 14.6027 5.39759 18.3337 10 18.3337Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 9.16699V13.3337"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.99536 6.66699H10.0028"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10 18.3337C14.6024 18.3337 18.3333 14.6027 18.3333 10.0003C18.3333 5.39795 14.6024 1.66699 10 1.66699C5.39759 1.66699 1.66663 5.39795 1.66663 10.0003C1.66663 14.6027 5.39759 18.3337 10 18.3337Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 10.0837L8.75 12.3337L13.5 7.66699"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TickSquareIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.21533 9.00009L6.733 13.5178L15.7843 4.48242"
        stroke="white"
        strokeWidth="2.25879"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export {
  CalendarIcon,
  CalendarTickIcon,
  CheckIcon,
  ClockIcon,
  InfoIcon,
  TickSquareIcon,
};
