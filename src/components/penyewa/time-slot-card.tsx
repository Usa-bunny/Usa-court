import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimeSlotProps {
  jam: number;
  isTerisi: boolean | undefined;
  isSelected: boolean;
  onClick: (jam: number) => void;
}

export function TimeSlotCard({
  jam,
  isTerisi,
  isSelected,
  onClick,
}: TimeSlotProps) {
  return (
    <Button
      variant={isTerisi ? "secondary" : isSelected ? "default" : "outline"}
      disabled={isTerisi}
      onClick={() => onClick(jam)}
      className={cn(
        "h-auto py-3 flex flex-col items-center justify-center",
        isTerisi &&
          "bg-muted text-muted-foreground opacity-50 cursor-not-allowed",
        isSelected && "ring-2 ring-primary ring-offset-1",
      )}
    >
      <span className="font-semibold">
        {jam.toString().padStart(2, "0")}:00 -{" "}
        {(jam + 1).toString().padStart(2, "0")}:00
      </span>
      <span className="text-xs font-normal mt-1">
        {isTerisi ? "Terisi" : isSelected ? "Dipilih" : "Kosong"}
      </span>
    </Button>
  );
}
