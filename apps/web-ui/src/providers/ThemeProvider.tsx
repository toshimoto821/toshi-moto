import { useEffect } from "react";
import { Theme } from "@radix-ui/themes";
import { useAppSelector } from "@lib/hooks/store.hooks";
import { selectDarkMode } from "@lib/slices/ui.slice";

interface IThemeProvider {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: IThemeProvider) => {
  const darkMode = useAppSelector(selectDarkMode);

  useEffect(() => {
    // Apply dark mode class to document root
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <Theme
      accentColor="orange"
      radius="small"
      scaling="90%"
      appearance={darkMode ? "dark" : "light"}
    >
      {children}
    </Theme>
  );
};
