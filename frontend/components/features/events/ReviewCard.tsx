import { Star } from "lucide-react";

interface ReviewCardProps {
  name: string;
  date: string;
  rating: number;
  title?: string;
  comment: string;
}

export default function ReviewCard({ name, date, rating, title, comment }: ReviewCardProps) {
  return (
    <div className="rounded-lg border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{name}</h4>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
            }`}
          />
        ))}
      </div>
      {title && <h5 className="font-medium">{title}</h5>}
      <p className="text-sm text-muted-foreground">{comment}</p>
    </div>
  );
}
