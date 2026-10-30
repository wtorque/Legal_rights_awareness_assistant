export function TypingIndicator() {
  return (
    <span role="status" aria-label="Assistant is writing" className="inline-flex items-center gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 animate-bounce rounded-full bg-primary/60"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "1s" }}
        />
      ))}
    </span>
  );
}
