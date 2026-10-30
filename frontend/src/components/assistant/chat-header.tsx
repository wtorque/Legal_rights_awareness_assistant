import { Languages, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatJurisdiction } from "@/config/jurisdictions";
import { getLanguage } from "@/config/languages";
import type { Conversation } from "@/types/chat";

export function ChatHeader({ conversation }: { conversation: Conversation | undefined }) {
  return (
    <div className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-2 sm:px-6">
      <h1 className="min-w-0 flex-1 truncate font-display text-xl">{conversation?.title ?? "AI Legal Assistant"}</h1>
      {conversation && (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">
            <MapPin aria-hidden />
            {formatJurisdiction(conversation.countryCode, conversation.regionCode)}
          </Badge>
          <Badge variant="outline">
            <Languages aria-hidden />
            {getLanguage(conversation.language).name}
          </Badge>
        </div>
      )}
    </div>
  );
}
