function svgProps(className) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    className,
    "aria-hidden": "true",
  };
}

export function UserIcon({ className }) {
  return (
    <svg {...svgProps(className)} width="20" height="20" viewBox="0 0 20 20">
      <path
        d="M10 10.0003C12.3012 10.0003 14.1667 8.13485 14.1667 5.83366C14.1667 3.53247 12.3012 1.66699 10 1.66699C7.69885 1.66699 5.83337 3.53247 5.83337 5.83366C5.83337 8.13485 7.69885 10.0003 10 10.0003Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.1583 18.3333C17.1583 15.1083 13.95 12.5 10 12.5C6.05001 12.5 2.84167 15.1083 2.84167 18.3333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BuildingsIcon({ className }) {
  return (
    <svg {...svgProps(className)} viewBox="0 0 20 20">
      <path d="M5.83337 15H3.33337C2.50004 15 2.08337 14.5833 2.08337 13.75V4.58333C2.08337 3.75 2.50004 3.33333 3.33337 3.33333H7.50004C8.33337 3.33333 8.75004 3.75 8.75004 4.58333V5.83333" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.7917 7.29167V15.2083C14.7917 16.375 14.2083 16.9583 13.0417 16.9583H8.95837C7.79171 16.9583 7.20837 16.375 7.20837 15.2083V7.29167C7.20837 6.125 7.79171 5.54167 8.95837 5.54167H13.0417C14.2083 5.54167 14.7917 6.125 14.7917 7.29167Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.4584 5.54167V4.58333C11.4584 3.75 11.875 3.33333 12.7084 3.33333H16.6667C17.5 3.33333 17.9167 3.75 17.9167 4.58333V13.75C17.9167 14.5833 17.5 15 16.6667 15H14.7917" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.58337 9.58333H12.4167" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.58337 12.0833H12.4167" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.8334 16.9583V14.7917" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SmsIcon({ className }) {
  return (
    <svg {...svgProps(className)} viewBox="0 0 20 20">
      <path d="M14.1667 17.0833H5.83341C3.33341 17.0833 1.66675 15.8333 1.66675 12.9166V7.08329C1.66675 4.16663 3.33341 2.91663 5.83341 2.91663H14.1667C16.6667 2.91663 18.3334 4.16663 18.3334 7.08329V12.9166C18.3334 15.8333 16.6667 17.0833 14.1667 17.0833Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.1666 7.5L11.5582 9.58333C10.6999 10.2667 9.29158 10.2667 8.43325 9.58333L5.83325 7.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InfoCircleIcon({ className }) {
  return (
    <svg {...svgProps(className)} viewBox="0 0 20 20">
      <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39762 14.6024 1.66666 10 1.66666C5.39763 1.66666 1.66667 5.39762 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.66666V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.99536 13.3333H10.0028" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SunIcon({ className }) {
  return (
    <svg {...svgProps(className)} width="20" height="20" viewBox="0 0 20 20">
      <path d="M10 15.4163C12.9916 15.4163 15.4167 12.9912 15.4167 9.99967C15.4167 7.00813 12.9916 4.58301 10 4.58301C7.0085 4.58301 4.58337 7.00813 4.58337 9.99967C4.58337 12.9912 7.0085 15.4163 10 15.4163Z" stroke="#09AE41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.95 15.9503L15.8416 15.842M15.8416 4.15866L15.95 4.05033L15.8416 4.15866ZM4.04996 15.9503L4.15829 15.842L4.04996 15.9503ZM9.99996 1.73366V1.66699V1.73366ZM9.99996 18.3337V18.267V18.3337ZM1.73329 10.0003H1.66663H1.73329ZM18.3333 10.0003H18.2666H18.3333ZM4.15829 4.15866L4.04996 4.05033L4.15829 4.15866Z" stroke="#09AE41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BellIcon({ className }) {
  return (
    <svg {...svgProps(className)} width="20" height="20" viewBox="0 0 20 20">
      <path d="M10.0164 2.4248C7.25804 2.4248 5.01637 4.66647 5.01637 7.4248V9.83314C5.01637 10.3415 4.79971 11.1165 4.54137 11.5498L3.58304 13.1415C2.99137 14.1248 3.39971 15.2165 4.48304 15.5831C8.07471 16.7831 11.9497 16.7831 15.5414 15.5831C16.5497 15.2498 16.9914 14.0581 16.4414 13.1415L15.483 11.5498C15.233 11.1165 15.0164 10.3415 15.0164 9.83314V7.4248C15.0164 4.6748 12.7664 2.4248 10.0164 2.4248Z" stroke="#09AE41" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" />
      <path d="M11.5583 2.66719C11.3 2.59219 11.0333 2.53385 10.7583 2.50052C9.95831 2.40052 9.19164 2.45885 8.47498 2.66719C8.71664 2.05052 9.31664 1.61719 10.0166 1.61719C10.7166 1.61719 11.3166 2.05052 11.5583 2.66719Z" stroke="#09AE41" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5162 15.8828C12.5162 17.2578 11.3912 18.3828 10.0162 18.3828C9.3329 18.3828 8.69957 18.0995 8.24957 17.6495C7.79957 17.1995 7.51624 16.5661 7.51624 15.8828" stroke="#09AE41" strokeWidth="1.5" strokeMiterlimit="10" />
    </svg>
  );
}

export function CallIcon({ className }) {
  return (
    <svg {...svgProps(className)} width="20" height="20" viewBox="0 0 20 20">
      <path d="M18.3083 15.2753C18.3083 15.5753 18.2416 15.8837 18.1 16.1837C17.9583 16.4837 17.775 16.767 17.5333 17.0337C17.125 17.4837 16.675 17.8087 16.1666 18.017C15.6666 18.2253 15.125 18.3337 14.5416 18.3337C13.6916 18.3337 12.7833 18.1337 11.825 17.7253C10.8666 17.317 9.90829 16.767 8.95829 16.0753C7.99996 15.3753 7.09163 14.6003 6.22496 13.742C5.36663 12.8753 4.59163 11.967 3.89996 11.017C3.21663 10.067 2.66663 9.11699 2.26663 8.17533C1.86663 7.22533 1.66663 6.31699 1.66663 5.45033C1.66663 4.88366 1.76663 4.34199 1.96663 3.84199C2.16663 3.33366 2.48329 2.86699 2.92496 2.45033C3.45829 1.92533 4.04163 1.66699 4.65829 1.66699C4.89163 1.66699 5.12496 1.71699 5.33329 1.81699C5.54996 1.91699 5.74163 2.06699 5.89163 2.28366L7.82496 5.00866C7.97496 5.21699 8.08329 5.40866 8.15829 5.59199C8.23329 5.76699 8.27496 5.94199 8.27496 6.10033C8.27496 6.30033 8.21663 6.50033 8.09996 6.69199C7.99163 6.88366 7.83329 7.08366 7.63329 7.28366L6.99996 7.94199C6.90829 8.03366 6.86663 8.14199 6.86663 8.27533C6.86663 8.34199 6.87496 8.40033 6.89163 8.46699C6.91663 8.53366 6.94163 8.58366 6.95829 8.63366C7.10829 8.90866 7.36663 9.26699 7.73329 9.70033C8.10829 10.1337 8.50829 10.5753 8.94163 11.017C9.39163 11.4587 9.82496 11.867 10.2666 12.242C10.7 12.6087 11.0583 12.8587 11.3416 13.0087C11.3833 13.0253 11.4333 13.0503 11.4916 13.0753C11.5583 13.1003 11.625 13.1087 11.7 13.1087C11.8416 13.1087 11.95 13.0587 12.0416 12.967L12.675 12.342C12.8833 12.1337 13.0833 11.9753 13.275 11.8753C13.4666 11.7587 13.6583 11.7003 13.8666 11.7003C14.025 11.7003 14.1916 11.7337 14.375 11.8087C14.5583 11.8837 14.75 11.992 14.9583 12.1337L17.7166 14.092C17.9333 14.242 18.0833 14.417 18.175 14.6253C18.2583 14.8337 18.3083 15.042 18.3083 15.2753Z" stroke="#09AE41" strokeWidth="1.5" strokeMiterlimit="10" />
    </svg>
  );
}

export function SendIcon({ className }) {
  return (
    <svg {...svgProps(className)} width="20" height="20" viewBox="0 0 20 20">
      <path
        d="M6.16665 5.2668L13.2417 2.90846C16.4167 1.85013 18.1417 3.58346 17.0917 6.75846L14.7333 13.8335C13.15 18.5918 10.55 18.5918 8.96665 13.8335L8.26665 11.7335L6.16665 11.0335C1.40832 9.45013 1.40832 6.85846 6.16665 5.2668Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.4248 11.3745L11.4081 8.38281"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
