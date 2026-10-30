"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { rightsCategories } from "@/mocks/rights";
import { usePlansStore } from "@/stores/plans-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import type { RightsCategoryId } from "@/types/dashboard";

const schema = z.object({
  title: z.string().trim().min(3, "Give the plan a short name (3+ characters)").max(80, "Keep it under 80 characters"),
  category: z.string().min(1, "Choose a category"),
  situation: z.string().trim().min(10, "Describe your situation in a sentence or two").max(600, "Keep it under 600 characters"),
});
type Values = z.infer<typeof schema>;

export function NewPlanDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const create = usePlansStore((s) => s.create);
  const { country, region } = usePreferencesStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { title: "", category: "housing", situation: "" } });

  const onSubmit = async (v: Values) => {
    const plan = await create({ title: v.title, category: v.category as RightsCategoryId, situation: v.situation, countryCode: country, regionCode: region });
    toast.success("Plan created", { description: "Steps are suggestions to adapt, not legal requirements." });
    reset();
    onOpenChange(false);
    router.push(`/action-plans/${plan.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>New action plan</DialogTitle>
            <DialogDescription>Starts from a general checklist you can edit. Nothing is sent anywhere.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="plan-title">Plan name</Label>
              <Input id="plan-title" aria-invalid={!!errors.title} aria-describedby="plan-title-err" {...register("title")} />
              <p id="plan-title-err" role="alert" className="min-h-4 text-xs text-destructive">{errors.title?.message}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-category">Category</Label>
              <Select id="plan-category" {...register("category")}>
                {rightsCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-situation">What happened?</Label>
              <Textarea id="plan-situation" rows={4} aria-invalid={!!errors.situation} aria-describedby="plan-sit-err" {...register("situation")} />
              <p id="plan-sit-err" role="alert" className="min-h-4 text-xs text-destructive">{errors.situation?.message}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Create plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
