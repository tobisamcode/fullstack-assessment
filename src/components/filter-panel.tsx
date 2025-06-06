"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import type { FilterPanelProps } from "@/app/type";
import { Command, MapPin, Timer } from "lucide-react";

const FilterPanel: React.FC<FilterPanelProps> = ({
  consultants,
  onFilterChange,
}) => {
  // Derive unique locations and experience ranges
  const [locations, setLocations] = useState<string[]>([]);
  useEffect(() => {
    const locs = Array.from(new Set(consultants.map((c) => c.location)));
    setLocations(locs);
  }, [consultants]);

  const experienceRanges = [
    { label: "0–2 years", value: "0-2" },
    { label: "3–5 years", value: "3-5" },
    { label: "6+ years", value: "6+" },
  ];

  // Local state for filter values
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [keyword, setKeyword] = useState("");

  // Whenever any filter changes, call onFilterChange
  useEffect(() => {
    onFilterChange({ selectedLocation, selectedExperience, keyword });
  }, [selectedLocation, selectedExperience, keyword]);

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 sticky top-8">
      {/* Location Filter */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <MapPin className="text-orange-500" size={20} />
          Location
        </label>
        <Select
          onValueChange={(val) => setSelectedLocation(val)}
          defaultValue=""
        >
          <SelectTrigger className="w-full border-orange-500 border-2">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experience Filter */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Timer className="text-orange-500" size={20} />
          Experience
        </label>
        <Select
          onValueChange={(val) => setSelectedExperience(val)}
          defaultValue=""
        >
          <SelectTrigger className="w-full border-orange-500 border-2">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            {experienceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Keyword Filter */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2  ">
          <Command className="text-orange-500" size={20} />
          Keyword
        </label>
        <Input
          type="text"
          placeholder="e.g. React, AWS"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border-2 border-orange-500 w-full"
        />
      </div>
    </div>
  );
};

export default React.memo(FilterPanel);
