import { Check, Globe } from "lucide-react";
import { useLanguage, LANGUAGES } from "./LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  
  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-[140px] justify-start gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="truncate">{currentLang?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] max-h-[300px] overflow-y-auto">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{lang.nativeName} <span className="text-gray-400 text-xs ml-2">({lang.name})</span></span>
            {language === lang.code && <Check className="w-4 h-4 text-teal-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
