import React from "react";

const Credits = (props) => {
  const currentYear = new Date().getFullYear();
  return (
    <div data-section id="credits" className="group pt-20 pb-8 flex flex-col">
      <div className="text-surface-600 flex flex-col">
        <div className="mb-4">
          This website was built using{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-background transition-all hover:text-primary-500"
          >
            Next.js
          </a>{" "}
          and
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-background transition-all hover:text-primary-500"
          >
            {" "}
            Tailwind CSS
          </a>
          . The inspiration for the design comes from{" "}
          <a
            href="https://www.sarahdayan.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-background transition-all hover:text-primary-500"
          >
            Sarah Dayan{" "}
          </a>
          and{" "}
          <a
            href="https://brittanychiang.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-background transition-all hover:text-primary-500"
          >
            Brittany Chiang
          </a>
          .
        </div>
        <div className="flex flex-row justify-between">
          <span className="flex space-x-2">
            <a
              href="https://www.linkedin.com/in/atulparida"
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-background transition-all hover:text-primary-500"
            >
              LinkedIn
            </a>
            <span>|</span>
            <a
              href="https://www.github.com/T2LIPthedeveloper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-background transition-all hover:text-primary-500"
            >
              GitHub
            </a>
          </span>
          <span>
            © {props.data.name} | {currentYear}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Credits;
