export const Footer = () => {
  return (
    <div className="bg-gray-200 dark:bg-[#0a0a0a] mt-12 flex-1 border-t border-slate-300 dark:border-[#2a2a2a] py-24">
      <div className="md:container mx-4 md:auto pb-8 flex items-center justify-center h-full">
        <a
          href="https://github.com/toshimoto821/toshi-moto"
          target="_blank"
          className="transition-opacity hover:opacity-70" rel="noreferrer"
        >
          <img
            src="/assets/github.svg"
            alt="github"
            className="dark:invert dark:opacity-80 dark:hover:opacity-100 transition-opacity"
          />
        </a>
      </div>
    </div>
  );
};
