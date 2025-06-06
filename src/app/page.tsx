"use client";

import { useState, useCallback, FormEvent } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import ConsultantCard from "@/components/consultant-card";
import FilterPanel from "@/components/filter-panel";
import type { Consultant, Evaluation, EvaluationMap, Filters } from "./type";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationMap>({});
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [isLoadingEval, setIsLoadingEval] = useState<boolean>(false);

  const [filters, setFilters] = useState<Filters>({
    selectedLocation: "any",
    selectedExperience: "any",
    keyword: "",
  });

  const fetchConsultants = async () => {
    setIsLoadingList(true);
    try {
      const res = await axios.get<Consultant[]>("/api/consultants", {
        params: { jobDescription: jobDescription.trim() },
      });

      toast.success("Successfully loaded consultants");
      setConsultants(res.data);
      setEvaluations({});
    } catch (err) {
      console.error("Failed to load consultants:", err);
      setConsultants([]);
      toast.error("Failed to load consultants");
    } finally {
      setIsLoadingList(false);
    }
  };

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    fetchConsultants();
  }

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  async function handleEvaluateAll(e: FormEvent) {
    e.preventDefault();
    if (!jobDescription.trim() || consultants.length === 0) return;

    setIsLoadingEval(true);
    const newEvals: Record<string, Evaluation> = {};

    await Promise.all(
      consultants.map(async (c) => {
        try {
          const res = await axios.post<{ evaluation: Evaluation }>(
            "/api/evaluate",
            {
              jobDescription: jobDescription.trim(),
              consultantId: c.id,
            }
          );

          newEvals[c.id] = res.data.evaluation;
        } catch (err) {
          console.error(`Eval failed for ${c.id}:`, err);
        }
      })
    );

    setEvaluations(newEvals);
    setIsLoadingEval(false);
  }

  const hasFilters =
    (filters.selectedLocation && filters.selectedLocation !== "any") ||
    (filters.selectedExperience && filters.selectedExperience !== "any") ||
    filters.keyword.trim().length > 0;

  const consultantsToDisplay = hasFilters
    ? consultants.filter((c) => {
        const { selectedLocation, selectedExperience, keyword } = filters;

        if (selectedLocation !== "any" && c.location !== selectedLocation)
          return false;

        if (selectedExperience !== "any") {
          const yrs = Number(c.yearsOfExp);
          if (selectedExperience === "0-2" && !(yrs >= 0 && yrs <= 2))
            return false;
          if (selectedExperience === "3-5" && !(yrs >= 3 && yrs <= 5))
            return false;
          if (selectedExperience === "6+" && yrs < 6) return false;
        }

        if (keyword.trim()) {
          const kw = keyword.trim().toLowerCase();
          const inName = c.name.toLowerCase().includes(kw);
          const inRole = c.role.toLowerCase().includes(kw);
          const inSkills = c.skills.some((s) => s.toLowerCase().includes(kw));
          if (!inName && !inRole && !inSkills) return false;
        }

        return true;
      })
    : consultants;

  return (
    <div className="p-4">
      {/* Top */}
      <div className="max-w-4xl mx-auto mt-7">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
            Consultant Assessment Tool
          </h1>
          <p className="text-gray-600">
            Submit a job description to retrieve the top ten matching
            consultants, then filter or evaluate them using AI.
          </p>
        </header>

        <section className="mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <textarea
              rows={5}
              className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none border-orange-500"
              placeholder="e.g. Senior Full-Stack Engineer with React and Node.js experience…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isLoadingList}>
                {isLoadingList ? "Searching…" : "Search Consultants"}
              </Button>
              <Button
                variant="outline"
                onClick={handleEvaluateAll}
                disabled={isLoadingEval || consultants.length === 0}
              >
                {isLoadingEval ? "Evaluating…" : "Evaluate All"}
              </Button>
            </div>
          </form>
        </section>

        <FilterPanel
          consultants={consultants}
          onFilterChange={handleFilterChange}
        />
      </div>

      <section className="grid mt-[90px] gap-6 lg:grid-cols-2 max-w-4xl lg:mx-auto">
        {isLoadingEval ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-4 shadow-sm animate-pulse"
            >
              <div className="flex flex-col h-full gap-2">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))
        ) : consultantsToDisplay.length > 0 ? (
          consultantsToDisplay.map((consultant) => (
            <ConsultantCard
              key={consultant.id}
              consultant={consultant}
              evaluation={evaluations[consultant.id]}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No consultants match filters.
          </p>
        )}
      </section>
    </div>
  );
}
